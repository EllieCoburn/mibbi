-- Integration tests for redeem_adoption_code(). Runs inside one transaction
-- and rolls back, so it can run repeatedly against the same database.
-- Fails loudly (ASSERT) on any regression.
begin;

create temp table t_users (name text primary key, id uuid);
insert into auth.users (email, raw_user_meta_data) values
  ('alice@example.com', '{"display_name": "Alice"}'),
  ('bob@example.com',   '{"display_name": "Bob"}'),
  ('eve@example.com',   '{"display_name": "x"}');   -- invalid name → default
insert into t_users select split_part(email, '@', 1), id from auth.users;

-- Helper: act as a given user, like PostgREST does with the JWT.
create or replace function pg_temp.as_user(p_name text) returns void language plpgsql as $$
declare v uuid; begin
  perform set_config('role', 'postgres', true);
  select id into v from t_users where name = p_name;
  perform set_config('request.jwt.claim.sub', v::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('role', 'authenticated', true);
end $$;

create or replace function pg_temp.h(p_code text) returns text language sql as $$
  select encode(hmac(p_code, 'dev-pepper-change-me', 'sha256'), 'hex');
$$;

-- ---------------------------------------------------------------- bootstrap
do $$
declare v_profiles int; v_rooms int; v_bal int; v_name text;
begin
  select count(*) into v_profiles from public.profiles;
  select count(*) into v_rooms from public.rooms where is_primary;
  select count(*) into v_bal from public.user_balances;
  assert v_profiles = 3, 'profile per user';
  assert v_rooms = 3, 'primary room per user';
  assert v_bal = 3, 'coin balance per user';
  select display_name into v_name from public.profiles p join t_users u on u.id = p.id where u.name = 'eve';
  assert v_name = 'New Friend', 'invalid display name falls back to default, got ' || v_name;
end $$;

-- ---------------------------------------------------------------- anon cannot redeem
do $$
declare r jsonb;
begin
  perform set_config('request.jwt.claim.sub', '', true);
  r := public.redeem_adoption_code(pg_temp.h('CRUMBDEVAAAA'));
  assert r->>'ok' = 'false' and r->>'error' = 'not_authenticated', 'anon rejected: ' || r::text;
end $$;

-- ---------------------------------------------------------------- happy path
do $$
declare r jsonb; v_count int; v_active uuid;
begin
  perform pg_temp.as_user('alice');
  r := public.redeem_adoption_code(pg_temp.h('CRUMBDEVAAAA'), 'Crumbles');
  assert r->>'ok' = 'true', 'valid code redeems: ' || r::text;
  assert r->>'character_slug' = 'crumb', 'resolves to crumb';
  assert r->>'nickname' = 'Crumbles', 'nickname stored';
  assert (r->>'is_first')::boolean, 'first adoption flagged';
  assert r->>'rarity_slug' = 'common', 'rarity from character';

  select count(*) into v_count from public.user_mibbis where user_id = auth.uid();
  assert v_count = 1, 'one mibbi owned';

  select active_mibbi_id into v_active from public.rooms where user_id = auth.uid() and is_primary;
  assert v_active = (r->>'user_mibbi_id')::uuid, 'first mibbi placed in room';

  -- Ownership row is visible to the owner through RLS.
  select count(*) into v_count from public.user_mibbis;
  assert v_count = 1, 'RLS: owner sees own mibbi';
end $$;

-- ---------------------------------------------------------------- duplicate redemption
do $$
declare r jsonb;
begin
  perform pg_temp.as_user('alice');
  r := public.redeem_adoption_code(pg_temp.h('CRUMBDEVAAAA'));
  assert r->>'error' = 'already_yours', 'same user re-redeem: ' || r::text;

  perform pg_temp.as_user('bob');
  r := public.redeem_adoption_code(pg_temp.h('CRUMBDEVAAAA'));
  assert r->>'error' = 'already_redeemed', 'other user re-redeem: ' || r::text;
end $$;

-- ---------------------------------------------------------------- RLS isolation
do $$
declare v_count int;
begin
  perform pg_temp.as_user('bob');
  select count(*) into v_count from public.user_mibbis;
  assert v_count = 0, 'RLS: bob cannot see alice''s mibbi';
  select count(*) into v_count from public.adoption_codes;
  assert v_count = 0, 'RLS: non-admin cannot read adoption codes';
  select count(*) into v_count from public.characters;
  assert v_count = 6, 'RLS: only active characters visible, got ' || v_count;
end $$;

-- ---------------------------------------------------------------- invalid + disabled
do $$
declare r jsonb;
begin
  perform pg_temp.as_user('bob');
  r := public.redeem_adoption_code(pg_temp.h('NOPENOPENOPE'));
  assert r->>'error' = 'invalid', 'unknown code: ' || r::text;

  r := public.redeem_adoption_code('not-a-hash');
  assert r->>'error' = 'invalid', 'malformed hash: ' || r::text;

  perform set_config('role', 'postgres', true);  -- act as admin/service
  update public.adoption_codes set status = 'disabled', disabled_at = now(), disabled_reason = 'leaked'
  where code_hash = pg_temp.h('TOASTDEVAAAA');

  perform pg_temp.as_user('bob');
  r := public.redeem_adoption_code(pg_temp.h('TOASTDEVAAAA'));
  assert r->>'error' = 'disabled', 'disabled code: ' || r::text;
end $$;

-- ---------------------------------------------------------------- variant (Golden Crumb)
do $$
declare r jsonb;
begin
  perform pg_temp.as_user('bob');
  r := public.redeem_adoption_code(pg_temp.h('GCRMBDEVAAAA'));
  assert r->>'ok' = 'true', 'golden crumb redeems: ' || r::text;
  assert r->>'character_slug' = 'crumb' and r->>'variant_slug' = 'golden-crumb', 'variant resolved';
  assert r->>'rarity_slug' = 'secret', 'variant rarity wins';
  assert r->>'display_name' = 'Golden Crumb', 'display name is variant name';
end $$;

-- ---------------------------------------------------------------- bad nickname falls back to null
do $$
declare r jsonb;
begin
  perform pg_temp.as_user('bob');
  r := public.redeem_adoption_code(pg_temp.h('MOCHDEV2AAAA'), '<script>alert(1)</script>');
  assert r->>'ok' = 'true', 'redeems despite bad nickname';
  assert r->'nickname' = 'null'::jsonb, 'bad nickname dropped: ' || r::text;
end $$;

-- ---------------------------------------------------------------- suspended user
do $$
declare r jsonb;
begin
  perform set_config('role', 'postgres', true);
  update public.profiles set status = 'suspended' where id = (select id from t_users where name = 'eve');
  perform pg_temp.as_user('eve');
  r := public.redeem_adoption_code(pg_temp.h('PEACHDEVAAAA'));
  assert r->>'error' = 'suspended', 'suspended user blocked: ' || r::text;
end $$;

-- ---------------------------------------------------------------- rate limit (10 failures / hour)
do $$
declare r jsonb; i int;
begin
  perform pg_temp.as_user('bob');
  -- bob already has 3 failures above (invalid, malformed, disabled)
  for i in 1..7 loop
    r := public.redeem_adoption_code(pg_temp.h('NOPE' || i || 'NOPENOPE'));
  end loop;
  r := public.redeem_adoption_code(pg_temp.h('PEACHDEVAAAA'));   -- a VALID code
  assert r->>'error' = 'rate_limited', 'valid code blocked after 10 failures: ' || r::text;

  -- alice is unaffected
  perform pg_temp.as_user('alice');
  r := public.redeem_adoption_code(pg_temp.h('PEACHDEVAAAA'));
  assert r->>'ok' = 'true', 'other user not rate limited: ' || r::text;
end $$;

-- ---------------------------------------------------------------- series progress view
do $$
declare v_owned int; v_total int;
begin
  perform pg_temp.as_user('alice');
  select owned_required, total_required into v_owned, v_total
  from public.user_series_progress where series_slug = 'the-bakery';
  assert v_owned = 2 and v_total = 6, format('alice bakery progress %s/%s', v_owned, v_total);
end $$;

-- ---------------------------------------------------------------- users cannot tamper with ownership
do $$
declare v_ok boolean := false;
begin
  perform pg_temp.as_user('bob');
  begin
    insert into public.user_mibbis (user_id, character_id)
    values (auth.uid(), (select id from public.characters where slug = 'butter'));
  exception when insufficient_privilege or others then v_ok := true;
  end;
  assert v_ok, 'direct insert into user_mibbis is blocked';

  v_ok := false;
  begin
    update public.user_mibbis set user_id = auth.uid();  -- column not granted
  exception when insufficient_privilege then v_ok := true;
  end;
  assert v_ok, 'user_id column update is blocked';

  -- nickname update on own row is allowed
  perform pg_temp.as_user('alice');
  update public.user_mibbis set nickname = 'Crumby' where nickname = 'Crumbles';
  assert found, 'owner can rename own mibbi';
end $$;

rollback;
select 'redemption tests passed' as result;
