-- =============================================================================
-- 0200 ACCOUNTS
-- profiles, admin_users, audit_logs, activity_log and the new-user bootstrap.
-- Supabase Auth owns auth.users; we never store passwords ourselves.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles: one row per auth user. Deliberately minimal (child privacy):
-- no real names, no birthdays, no free-text bios, no location.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  display_name   text not null default 'New Friend',
  avatar_key     text not null default 'default',          -- preset avatar or 'mibbi:<character_slug>'
  status         public.account_status not null default 'active',
  suspended_reason text,
  onboarding_completed_at timestamptz,
  last_seen_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  -- Display names are shown only to the user themselves in the MVP, but we
  -- still constrain them so a future (moderated) social feature is safe.
  constraint profiles_display_name_length check (char_length(display_name) between 2 and 20),
  constraint profiles_display_name_charset check (display_name ~ '^[A-Za-z0-9][A-Za-z0-9 ]*[A-Za-z0-9]$')
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

comment on table public.profiles is 'Public-facing account data. Intentionally minimal for child privacy.';

-- -----------------------------------------------------------------------------
-- admin_users: separate from profiles so admin rights are never a user-editable
-- column. Only owners (or the service role) can add rows.
-- -----------------------------------------------------------------------------
create table public.admin_users (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  role        public.admin_role not null default 'support',
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

comment on table public.admin_users is 'Membership = admin access. Role governs what an admin may do.';

-- -----------------------------------------------------------------------------
-- audit_logs: every important admin / system action.
-- -----------------------------------------------------------------------------
create table public.audit_logs (
  id             bigint generated always as identity primary key,
  actor_user_id  uuid references auth.users (id) on delete set null,
  action         text not null,                 -- e.g. 'codes.generate', 'user.suspend'
  target_table   text,
  target_id      text,
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

create index audit_logs_actor_idx   on public.audit_logs (actor_user_id, created_at desc);
create index audit_logs_target_idx  on public.audit_logs (target_table, target_id);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- -----------------------------------------------------------------------------
-- Admin helpers (need admin_users / audit_logs to exist).
-- -----------------------------------------------------------------------------
-- True when the calling user is in admin_users. SECURITY DEFINER so it can be
-- used inside RLS policies on admin_users itself without recursion.
-- (admin_users is created in 0200; Postgres resolves the reference at call time.)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = auth.uid()
  );
$$;

-- True when the calling user holds a specific admin role or higher.
-- Order: owner > admin > support.
create or replace function public.has_admin_role(p_role public.admin_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
      and case p_role
            when 'support' then true
            when 'admin'   then a.role in ('admin', 'owner')
            when 'owner'   then a.role = 'owner'
          end
  );
$$;

-- Writes an audit row. Called from SECURITY DEFINER functions and server code.
create or replace function public.write_audit_log(
  p_action      text,
  p_target_table text,
  p_target_id   text,
  p_metadata    jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_user_id, action, target_table, target_id, metadata)
  values (auth.uid(), p_action, p_target_table, p_target_id, coalesce(p_metadata, '{}'::jsonb));
end;
$$;

comment on function public.is_admin() is 'True if auth.uid() is present in admin_users.';
comment on function public.has_admin_role(public.admin_role) is 'Role check with owner > admin > support hierarchy.';

-- -----------------------------------------------------------------------------
-- activity_log: user-visible "recent activity" feed (adopted Crumb, earned
-- 50 coins, completed a quest). Separate from audit_logs on purpose.
-- -----------------------------------------------------------------------------
create table public.activity_log (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  kind        text not null,                    -- 'adoption', 'coins', 'quest', 'achievement', 'purchase', 'game'
  title       text not null,                    -- short human line, written in Mibbi voice
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index activity_log_user_idx on public.activity_log (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- New-user bootstrap. Runs when Supabase Auth inserts into auth.users.
-- Creates the profile, a zero coin balance and the primary room. Later
-- migrations (0600 economy, 0500 rooms) create those tables; this trigger is
-- attached in 0700 after they exist.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '');

  -- Fall back to a safe default if the name is missing or invalid.
  if v_name is null
     or char_length(v_name) not between 2 and 20
     or v_name !~ '^[A-Za-z0-9][A-Za-z0-9 ]*[A-Za-z0-9]$' then
    v_name := 'New Friend';
  end if;

  insert into public.profiles (id, display_name) values (new.id, v_name)
  on conflict (id) do nothing;

  insert into public.user_balances (user_id, currency_slug, balance)
  values (new.id, 'coins', 0)
  on conflict do nothing;

  insert into public.rooms (user_id, name, is_primary)
  values (new.id, 'My Room', true)
  on conflict do nothing;

  return new;
end;
$$;
