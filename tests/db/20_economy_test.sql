-- Integration tests for the coin ledger and purchases.
begin;

insert into auth.users (email, raw_user_meta_data) values ('carol@example.com', '{"display_name": "Carol"}');

create or replace function pg_temp.as_carol() returns void language plpgsql as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claim.sub', (select id::text from auth.users where email = 'carol@example.com'), true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('role', 'authenticated', true);
end $$;

-- ---------------------------------------------------------------- ledger
do $$
declare v_user uuid; v_bal bigint; v_txn int;
begin
  select id into v_user from auth.users where email = 'carol@example.com';

  v_bal := public.apply_currency_transaction(v_user, 100, 'daily_reward', 'daily_claim', '2026-09-06', null, 'daily:2026-09-06');
  assert v_bal = 100, 'earn 100';

  -- idempotent replay does not double-award
  v_bal := public.apply_currency_transaction(v_user, 100, 'daily_reward', 'daily_claim', '2026-09-06', null, 'daily:2026-09-06');
  assert v_bal = 100, 'idempotent replay';
  select count(*) into v_txn from public.currency_transactions where user_id = v_user;
  assert v_txn = 1, 'one transaction row';

  v_bal := public.apply_currency_transaction(v_user, -30, 'purchase', 'item', 'x');
  assert v_bal = 70, 'spend 30';

  begin
    perform public.apply_currency_transaction(v_user, -500, 'purchase', 'item', 'y');
    assert false, 'overspend should raise';
  exception when others then
    assert sqlerrm = 'INSUFFICIENT_FUNDS', 'overspend error: ' || sqlerrm;
  end;

  select balance, lifetime_earned into v_bal, v_txn from public.user_balances where user_id = v_user and currency_slug = 'coins';
  assert v_bal = 70 and v_txn = 100, 'balance and lifetime tracked';
end $$;

-- ---------------------------------------------------------------- authenticated users cannot call the ledger directly
do $$
declare v_ok boolean := false;
begin
  perform pg_temp.as_carol();
  begin
    perform public.apply_currency_transaction(auth.uid(), 1000000, 'admin');
  exception when insufficient_privilege then v_ok := true;
  end;
  assert v_ok, 'apply_currency_transaction is not callable by users';
end $$;

-- ---------------------------------------------------------------- purchase
do $$
declare r jsonb; v_qty int; v_item uuid;
begin
  perform pg_temp.as_carol();
  select id into v_item from public.items where slug = 'rug-round-peach';   -- 40 coins

  r := public.purchase_item(v_item, 1);
  assert r->>'ok' = 'true' and (r->>'balance')::int = 30, 'bought rug: ' || r::text;

  select quantity into v_qty from public.user_inventory where user_id = auth.uid() and item_id = v_item;
  assert v_qty = 1, 'rug in inventory';

  begin
    perform public.purchase_item(v_item, 1);
    assert false, 'second rug unaffordable';
  exception when others then
    assert sqlerrm = 'INSUFFICIENT_FUNDS', 'unaffordable error: ' || sqlerrm;
  end;

  -- not-for-sale item
  select id into v_item from public.items where slug = 'bg-bakery-kitchen';
  begin
    perform public.purchase_item(v_item, 1);
    assert false, 'reward-only item not purchasable';
  exception when others then
    assert sqlerrm = 'ITEM_NOT_AVAILABLE', 'not available error: ' || sqlerrm;
  end;
end $$;

-- ---------------------------------------------------------------- room placement respects ownership
do $$
declare v_room uuid; v_rug uuid; v_bed uuid; v_ok boolean := false;
begin
  perform pg_temp.as_carol();
  select id into v_room from public.rooms where user_id = auth.uid() and is_primary;
  select id into v_rug from public.items where slug = 'rug-round-peach';
  select id into v_bed from public.items where slug = 'bed-toast-loaf';

  insert into public.room_items (room_id, item_id, grid_x, grid_y) values (v_room, v_rug, 2, 3);

  begin
    insert into public.room_items (room_id, item_id) values (v_room, v_rug);   -- only own 1
  exception when others then v_ok := (sqlerrm = 'ITEM_QUANTITY_EXCEEDED');
  end;
  assert v_ok, 'cannot place more copies than owned';

  v_ok := false;
  begin
    insert into public.room_items (room_id, item_id) values (v_room, v_bed);   -- never bought
  exception when others then v_ok := (sqlerrm = 'ITEM_NOT_OWNED');
  end;
  assert v_ok, 'cannot place unowned item';
end $$;

rollback;
select 'economy tests passed' as result;
