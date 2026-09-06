-- =============================================================================
-- 0800 ROW LEVEL SECURITY
-- Default deny everywhere. Three audiences:
--   anon / authenticated : public catalog (active rows only) + their own rows
--   admins               : everything, via is_admin()
--   service role         : bypasses RLS (server-only code, never shipped to client)
-- Game-state writes (coins, inventory, adoption) never happen through direct
-- table access; they go through SECURITY DEFINER functions.
-- =============================================================================

-- Helper: enable RLS + force it even for table owners.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','admin_users','audit_logs','activity_log',
    'rarities','series','locations','characters','character_variants','series_characters','product_skus',
    'code_batches','adoption_codes','user_mibbis','adoption_attempts',
    'item_categories','items','user_inventory','rooms','room_items',
    'currencies','user_balances','currency_transactions',
    'games','game_scores','events','quests','user_quests','achievements','user_achievements',
    'daily_rewards','user_daily_claims','location_unlocks','user_location_visits'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Public catalog: anyone can read active rows; admins can read/write all.
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'series','locations','characters','character_variants','items','games','events','quests','achievements'
  ] loop
    execute format($p$
      create policy "%1$s_public_read" on public.%1$s
        for select to anon, authenticated
        using (status = 'active' or public.is_admin());
    $p$, t);
    execute format($p$
      create policy "%1$s_admin_write" on public.%1$s
        for all to authenticated
        using (public.has_admin_role('admin'))
        with check (public.has_admin_role('admin'));
    $p$, t);
  end loop;
end $$;

-- Tables without a status column that are still public reference data.
create policy "rarities_public_read" on public.rarities for select to anon, authenticated using (true);
create policy "rarities_admin_write" on public.rarities for all to authenticated
  using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

create policy "item_categories_public_read" on public.item_categories for select to anon, authenticated using (true);
create policy "item_categories_admin_write" on public.item_categories for all to authenticated
  using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

create policy "currencies_public_read" on public.currencies for select to anon, authenticated using (true);
create policy "currencies_admin_write" on public.currencies for all to authenticated
  using (public.has_admin_role('owner')) with check (public.has_admin_role('owner'));

create policy "daily_rewards_public_read" on public.daily_rewards for select to anon, authenticated using (status = 'active' or public.is_admin());
create policy "daily_rewards_admin_write" on public.daily_rewards for all to authenticated
  using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

create policy "series_characters_public_read" on public.series_characters for select to anon, authenticated using (true);
create policy "series_characters_admin_write" on public.series_characters for all to authenticated
  using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

create policy "location_unlocks_public_read" on public.location_unlocks for select to anon, authenticated using (true);
create policy "location_unlocks_admin_write" on public.location_unlocks for all to authenticated
  using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

-- SKUs: readable by signed-in users (for "buy the one you're missing" links); admin-managed.
create policy "product_skus_read" on public.product_skus for select to authenticated using (status = 'active' or public.is_admin());
create policy "product_skus_admin_write" on public.product_skus for all to authenticated
  using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

-- -----------------------------------------------------------------------------
-- Accounts
-- -----------------------------------------------------------------------------
create policy "profiles_select_own"  on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own"  on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_admin_update" on public.profiles for update to authenticated using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));
-- Users may only change cosmetic columns. status / suspended_reason are admin-only.
revoke update on public.profiles from authenticated;
grant  update (display_name, avatar_key, onboarding_completed_at, last_seen_at) on public.profiles to authenticated;

create policy "admin_users_select" on public.admin_users for select to authenticated using (public.is_admin());
create policy "admin_users_owner_write" on public.admin_users for all to authenticated
  using (public.has_admin_role('owner')) with check (public.has_admin_role('owner'));

create policy "audit_logs_admin_read" on public.audit_logs for select to authenticated using (public.is_admin());

create policy "activity_log_select_own" on public.activity_log for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- -----------------------------------------------------------------------------
-- Adoption: codes are admin-only. Ownership rows are the user's to read and
-- lightly edit (nickname, favourite). Inserts happen in redeem_adoption_code().
-- -----------------------------------------------------------------------------
create policy "code_batches_admin"     on public.code_batches     for all to authenticated using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));
create policy "adoption_codes_admin"   on public.adoption_codes   for all to authenticated using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));
create policy "adoption_codes_support_read" on public.adoption_codes for select to authenticated using (public.is_admin());
create policy "adoption_attempts_admin_read" on public.adoption_attempts for select to authenticated using (public.is_admin());

create policy "user_mibbis_select_own" on public.user_mibbis for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "user_mibbis_update_own" on public.user_mibbis for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.user_mibbis from authenticated;
grant  update (nickname, is_favorite) on public.user_mibbis to authenticated;
create policy "user_mibbis_admin_write" on public.user_mibbis for all to authenticated using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

-- -----------------------------------------------------------------------------
-- Inventory & rooms
-- -----------------------------------------------------------------------------
create policy "user_inventory_select_own" on public.user_inventory for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "user_inventory_admin_write" on public.user_inventory for all to authenticated using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

create policy "rooms_own" on public.rooms for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "rooms_admin_read" on public.rooms for select to authenticated using (public.is_admin());

create policy "room_items_own" on public.room_items for all to authenticated
  using (exists (select 1 from public.rooms r where r.id = room_items.room_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.rooms r where r.id = room_items.room_id and r.user_id = auth.uid()));
create policy "room_items_admin_read" on public.room_items for select to authenticated using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Economy (read own; writes only via functions)
-- -----------------------------------------------------------------------------
create policy "user_balances_select_own" on public.user_balances for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "currency_transactions_select_own" on public.currency_transactions for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- -----------------------------------------------------------------------------
-- Engagement (read own; writes only via functions)
-- -----------------------------------------------------------------------------
create policy "game_scores_select_own"          on public.game_scores          for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "user_quests_select_own"          on public.user_quests          for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "user_achievements_select_own"    on public.user_achievements    for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "user_daily_claims_select_own"    on public.user_daily_claims    for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "user_location_visits_select_own" on public.user_location_visits for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- Views inherit RLS through security_invoker; grant select explicitly.
grant select on public.user_series_progress to authenticated;
