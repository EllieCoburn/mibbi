-- =============================================================================
-- 0900 REDEMPTION
-- redeem_adoption_code(): the single, atomic path from a physical code to a
-- digital Mibbi. Called by the server action in src/lib/adoption with the
-- HMAC hash of the normalized code (the DB never sees plaintext).
--
-- Returns jsonb { ok: true, ... } or { ok: false, error: <code> }.
-- Error codes: not_authenticated | suspended | rate_limited | invalid |
--              already_redeemed | already_yours | disabled | unavailable
-- =============================================================================

create or replace function public.redeem_adoption_code(
  p_code_hash text,
  p_nickname  text default null,
  p_ip_hash   text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user        uuid := auth.uid();
  v_profile     public.profiles%rowtype;
  v_code        public.adoption_codes%rowtype;
  v_sku         public.product_skus%rowtype;
  v_character   public.characters%rowtype;
  v_variant     public.character_variants%rowtype;
  v_mibbi_id    uuid;
  v_recent_fail int;
  v_ip_fail     int;
  v_nickname    text;
  v_display     text;
  v_is_first    boolean;
  v_owned_count int;
  c_user_limit  constant int := 10;   -- failed attempts per user per hour
  c_ip_limit    constant int := 30;   -- failed attempts per IP per hour
begin
  -- 1. Who is asking?
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select * into v_profile from public.profiles where id = v_user;
  if not found or v_profile.status <> 'active' then
    insert into public.adoption_attempts (user_id, ip_hash, result) values (v_user, p_ip_hash, 'suspended');
    return jsonb_build_object('ok', false, 'error', 'suspended');
  end if;

  -- 2. Brute-force limiter (enforced here so it cannot be bypassed by any client).
  select count(*) into v_recent_fail
  from public.adoption_attempts
  where user_id = v_user
    and result <> 'success'
    and attempted_at > now() - interval '1 hour';

  if v_recent_fail >= c_user_limit then
    insert into public.adoption_attempts (user_id, ip_hash, result) values (v_user, p_ip_hash, 'rate_limited');
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  if p_ip_hash is not null then
    select count(*) into v_ip_fail
    from public.adoption_attempts
    where ip_hash = p_ip_hash
      and result <> 'success'
      and attempted_at > now() - interval '1 hour';
    if v_ip_fail >= c_ip_limit then
      insert into public.adoption_attempts (user_id, ip_hash, result) values (v_user, p_ip_hash, 'rate_limited');
      return jsonb_build_object('ok', false, 'error', 'rate_limited');
    end if;
  end if;

  -- 3. Look up and lock the code.
  if p_code_hash is null or p_code_hash !~ '^[0-9a-f]{64}$' then
    insert into public.adoption_attempts (user_id, ip_hash, result) values (v_user, p_ip_hash, 'invalid');
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  select * into v_code from public.adoption_codes where code_hash = p_code_hash for update;

  if not found then
    insert into public.adoption_attempts (user_id, ip_hash, result) values (v_user, p_ip_hash, 'invalid');
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  if v_code.status = 'redeemed' then
    insert into public.adoption_attempts (user_id, ip_hash, result, code_id) values (v_user, p_ip_hash, 'already_redeemed', v_code.id);
    if v_code.redeemed_by = v_user then
      return jsonb_build_object('ok', false, 'error', 'already_yours');
    end if;
    return jsonb_build_object('ok', false, 'error', 'already_redeemed');
  end if;

  if v_code.status = 'disabled' then
    insert into public.adoption_attempts (user_id, ip_hash, result, code_id) values (v_user, p_ip_hash, 'disabled', v_code.id);
    return jsonb_build_object('ok', false, 'error', 'disabled');
  end if;

  -- 4. Resolve what the code unlocks.
  select * into v_sku from public.product_skus where id = v_code.sku_id;
  select * into v_character from public.characters where id = v_sku.character_id;

  if v_sku.variant_id is not null then
    select * into v_variant from public.character_variants where id = v_sku.variant_id;
  end if;

  if v_character.status <> 'active'
     or (v_sku.variant_id is not null and v_variant.status <> 'active') then
    insert into public.adoption_attempts (user_id, ip_hash, result, code_id) values (v_user, p_ip_hash, 'inactive_character', v_code.id);
    return jsonb_build_object('ok', false, 'error', 'unavailable');
  end if;

  -- 5. Validate the optional nickname (same rules as the table constraint).
  v_nickname := nullif(trim(coalesce(p_nickname, '')), '');
  if v_nickname is not null and (
       char_length(v_nickname) > 20
    or v_nickname !~ '^[A-Za-z0-9][A-Za-z0-9 ''\-]*$'
  ) then
    v_nickname := null;  -- silently fall back; the UI validates before calling
  end if;

  -- 6. Adopt.
  select count(*) = 0 into v_is_first from public.user_mibbis where user_id = v_user;

  insert into public.user_mibbis (user_id, character_id, variant_id, adoption_code_id, nickname)
  values (v_user, v_character.id, v_sku.variant_id, v_code.id, v_nickname)
  returning id into v_mibbi_id;

  update public.adoption_codes
  set status = 'redeemed', redeemed_by = v_user, redeemed_at = now()
  where id = v_code.id;

  insert into public.adoption_attempts (user_id, ip_hash, result, code_id)
  values (v_user, p_ip_hash, 'success', v_code.id);

  -- First Mibbi becomes the one in the room.
  if v_is_first then
    update public.rooms set active_mibbi_id = v_mibbi_id
    where user_id = v_user and is_primary and active_mibbi_id is null;
  end if;

  v_display := coalesce(v_variant.name, v_character.name);

  insert into public.activity_log (user_id, kind, title, metadata)
  values (v_user, 'adoption',
          'You found someone new: ' || v_display || '.',
          jsonb_build_object('user_mibbi_id', v_mibbi_id, 'character_slug', v_character.slug,
                             'variant_slug', v_variant.slug));

  select count(*) into v_owned_count from public.user_mibbis where user_id = v_user;

  return jsonb_build_object(
    'ok', true,
    'user_mibbi_id', v_mibbi_id,
    'character_id', v_character.id,
    'character_slug', v_character.slug,
    'character_name', v_character.name,
    'variant_id', v_sku.variant_id,
    'variant_slug', v_variant.slug,
    'variant_name', v_variant.name,
    'display_name', v_display,
    'rarity_slug', coalesce(v_variant.rarity_slug, v_character.rarity_slug),
    'nickname', v_nickname,
    'is_first', v_is_first,
    'owned_count', v_owned_count
  );
end;
$$;

revoke execute on function public.redeem_adoption_code(text, text, text) from public, anon;
grant  execute on function public.redeem_adoption_code(text, text, text) to authenticated;

comment on function public.redeem_adoption_code(text, text, text) is
  'Atomically redeems a hashed adoption code for the calling user. See docs/DATABASE.md.';
