-- =============================================================================
-- 0100 FOUNDATION
-- Extensions, shared enums and helper functions used by every later migration.
-- =============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid(), hmac()
create extension if not exists "citext";     -- case-insensitive slugs / emails

-- -----------------------------------------------------------------------------
-- Enums
-- Fixed, code-meaningful sets live in enums. Anything the founder should be
-- able to change from the admin dashboard (rarities, categories...) lives in
-- a table instead.
-- -----------------------------------------------------------------------------

-- Lifecycle for admin-managed content (characters, series, items, quests...).
create type public.content_status as enum ('draft', 'active', 'archived');

-- Lifecycle for a physical adoption code.
create type public.code_status as enum ('active', 'redeemed', 'disabled');

-- Account standing. Suspended users can sign in but cannot play.
create type public.account_status as enum ('active', 'suspended');

-- Admin roles. `owner` can manage other admins; `support` is read + support tools.
create type public.admin_role as enum ('owner', 'admin', 'support');

-- How a user came to own an item / coins. Used for analytics and audit.
create type public.acquisition_source as enum (
  'purchase',          -- bought in the digital shop with coins
  'quest',             -- quest reward
  'adoption',          -- unlocked by adopting a character
  'series_completion', -- unlocked by completing a series
  'event',             -- seasonal event
  'achievement',       -- achievement reward
  'daily_reward',      -- daily gift / streak
  'game',              -- mini-game payout
  'promo',             -- promotional code
  'admin',             -- granted manually by an admin (support)
  'starter'            -- given on account creation
);

-- What a world-map location opens when clicked.
create type public.location_link_type as enum ('none', 'game', 'shop', 'quest', 'character', 'event', 'page');

-- Quest / achievement requirement kinds. Each has a JSON config; the
-- evaluator lives in application code (src/lib/progress) and in SQL helpers.
create type public.requirement_type as enum (
  'adopt_count',            -- own N Mibbis                  {count}
  'adopt_character',        -- own a specific character      {character_slug}
  'adopt_rarity',           -- own a Mibbi of rarity         {rarity_slug}
  'series_owned_count',     -- own N distinct in a series    {series_slug, count}
  'series_complete',        -- complete a series             {series_slug}
  'play_game_count',        -- play any/specific game N times{game_slug?, count}
  'game_score',             -- reach score in a game         {game_slug, score}
  'earn_coins',             -- earn N coins (lifetime/period){amount}
  'spend_coins',            -- spend N coins                 {amount}
  'room_items_placed',      -- place N items in a room       {count}
  'login_days',             -- log in N distinct days        {count}
  'login_streak',           -- reach a streak of N days      {count}
  'visit_locations',        -- visit N distinct locations    {count}
  'visit_location',         -- visit a specific location     {location_slug}
  'feed_mibbi',             -- feed a Mibbi N times          {count}
  'own_items',              -- own N distinct items          {count}
  'custom'                  -- evaluated by named code hook  {hook}
);

-- Repeat cadence for quests.
create type public.repeat_interval as enum ('none', 'daily', 'weekly');

-- User quest lifecycle.
create type public.user_quest_status as enum ('active', 'completed', 'claimed');

-- -----------------------------------------------------------------------------
-- Helper functions
-- -----------------------------------------------------------------------------

-- Keeps `updated_at` fresh on any table that has the column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- is_admin(), has_admin_role() and write_audit_log() live in 0200 because
-- `language sql` bodies are validated against tables at creation time.
