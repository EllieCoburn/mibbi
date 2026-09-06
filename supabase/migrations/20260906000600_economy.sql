-- =============================================================================
-- 0600 ECONOMY
-- A ledger-first currency system. Balances are cached in user_balances but
-- every change is an immutable row in currency_transactions, applied through
-- apply_currency_transaction() which locks, validates and writes atomically.
-- =============================================================================

create table public.currencies (
  slug        citext primary key,                        -- 'coins'
  name        text not null,                             -- 'Mibbi Coins'
  icon        text not null default 'coin',
  created_at  timestamptz not null default now()
);

create table public.user_balances (
  user_id        uuid not null references auth.users (id) on delete cascade,
  currency_slug  citext not null references public.currencies (slug) on update cascade,
  balance        bigint not null default 0 check (balance >= 0),
  lifetime_earned bigint not null default 0,
  lifetime_spent  bigint not null default 0,
  updated_at     timestamptz not null default now(),
  primary key (user_id, currency_slug)
);

create table public.currency_transactions (
  id               bigint generated always as identity primary key,
  user_id          uuid not null references auth.users (id) on delete cascade,
  currency_slug    citext not null references public.currencies (slug) on update cascade,
  amount           bigint not null check (amount <> 0),   -- positive = earn, negative = spend
  balance_after    bigint not null,
  source           public.acquisition_source not null,
  reference_type   text,                                  -- 'item', 'quest', 'game_score', 'daily_claim', 'admin'
  reference_id     text,
  note             text,
  idempotency_key  text unique,                           -- prevents double-awards on retries
  created_by       uuid references auth.users (id) on delete set null,  -- admin, for manual grants
  created_at       timestamptz not null default now()
);

create index currency_transactions_user_idx on public.currency_transactions (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- apply_currency_transaction
-- The ONLY way coins change. Returns the new balance.
-- Raises INSUFFICIENT_FUNDS when a spend would go negative.
-- Idempotent when p_idempotency_key is supplied.
-- -----------------------------------------------------------------------------
create or replace function public.apply_currency_transaction(
  p_user_id         uuid,
  p_amount          bigint,
  p_source          public.acquisition_source,
  p_reference_type  text default null,
  p_reference_id    text default null,
  p_note            text default null,
  p_idempotency_key text default null,
  p_currency_slug   citext default 'coins'
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance bigint;
  v_existing bigint;
begin
  if p_amount = 0 then
    raise exception 'ZERO_AMOUNT' using errcode = 'P0001';
  end if;

  -- Idempotent replay: return the balance recorded at the time.
  if p_idempotency_key is not null then
    select balance_after into v_existing
    from public.currency_transactions
    where idempotency_key = p_idempotency_key;
    if found then
      return v_existing;
    end if;
  end if;

  -- Ensure a balance row exists, then lock it.
  insert into public.user_balances (user_id, currency_slug, balance)
  values (p_user_id, p_currency_slug, 0)
  on conflict (user_id, currency_slug) do nothing;

  select balance into v_balance
  from public.user_balances
  where user_id = p_user_id and currency_slug = p_currency_slug
  for update;

  if v_balance + p_amount < 0 then
    raise exception 'INSUFFICIENT_FUNDS' using errcode = 'P0001';
  end if;

  v_balance := v_balance + p_amount;

  update public.user_balances
  set balance = v_balance,
      lifetime_earned = lifetime_earned + greatest(p_amount, 0),
      lifetime_spent  = lifetime_spent  + greatest(-p_amount, 0),
      updated_at = now()
  where user_id = p_user_id and currency_slug = p_currency_slug;

  insert into public.currency_transactions
    (user_id, currency_slug, amount, balance_after, source, reference_type, reference_id, note, idempotency_key, created_by)
  values
    (p_user_id, p_currency_slug, p_amount, v_balance, p_source, p_reference_type, p_reference_id, p_note, p_idempotency_key, auth.uid());

  return v_balance;
end;
$$;

-- Only server code / other definer functions should call this directly.
revoke execute on function public.apply_currency_transaction(uuid, bigint, public.acquisition_source, text, text, text, text, citext) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- grant_item: adds quantity to a user's inventory (upsert). Used by purchase,
-- quests, adoption unlocks and admin support tools.
-- -----------------------------------------------------------------------------
create or replace function public.grant_item(
  p_user_id  uuid,
  p_item_id  uuid,
  p_quantity int,
  p_source   public.acquisition_source
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_quantity <= 0 then
    raise exception 'INVALID_QUANTITY' using errcode = 'P0001';
  end if;

  insert into public.user_inventory (user_id, item_id, quantity, acquired_via)
  values (p_user_id, p_item_id, p_quantity, p_source)
  on conflict (user_id, item_id)
  do update set quantity = public.user_inventory.quantity + excluded.quantity,
                updated_at = now();
end;
$$;

revoke execute on function public.grant_item(uuid, uuid, int, public.acquisition_source) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- purchase_item: user-callable. Spends coins and grants the item atomically.
-- -----------------------------------------------------------------------------
create or replace function public.purchase_item(p_item_id uuid, p_quantity int default 1)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := auth.uid();
  v_item    public.items%rowtype;
  v_owned   int;
  v_cost    bigint;
  v_balance bigint;
begin
  if v_user is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;
  if p_quantity < 1 or p_quantity > 10 then
    raise exception 'INVALID_QUANTITY' using errcode = 'P0001';
  end if;

  select * into v_item from public.items where id = p_item_id for share;

  if not found
     or v_item.status <> 'active'
     or not v_item.is_shop_available
     or v_item.coin_price is null
     or (v_item.shop_starts_at is not null and v_item.shop_starts_at > now())
     or (v_item.shop_ends_at   is not null and v_item.shop_ends_at   < now()) then
    raise exception 'ITEM_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if v_item.max_per_user is not null then
    select coalesce(quantity, 0) into v_owned
    from public.user_inventory where user_id = v_user and item_id = p_item_id;
    if coalesce(v_owned, 0) + p_quantity > v_item.max_per_user then
      raise exception 'ITEM_LIMIT_REACHED' using errcode = 'P0001';
    end if;
  end if;

  v_cost := v_item.coin_price::bigint * p_quantity;

  -- Raises INSUFFICIENT_FUNDS if the user cannot afford it.
  v_balance := public.apply_currency_transaction(
    v_user, -v_cost, 'purchase', 'item', p_item_id::text,
    'Bought ' || v_item.name, null, 'coins'
  );

  perform public.grant_item(v_user, p_item_id, p_quantity, 'purchase');

  insert into public.activity_log (user_id, kind, title, metadata)
  values (v_user, 'purchase', 'You brought home ' || v_item.name || '.',
          jsonb_build_object('item_id', p_item_id, 'quantity', p_quantity, 'cost', v_cost));

  return jsonb_build_object('ok', true, 'balance', v_balance, 'item_id', p_item_id, 'quantity', p_quantity);
end;
$$;

revoke execute on function public.purchase_item(uuid, int) from public, anon;
grant  execute on function public.purchase_item(uuid, int) to authenticated;
