-- =============================================================================
-- 0700 ENGAGEMENT
-- games, quests, achievements, daily rewards, events, world unlocks.
-- Also wires deferred FKs and attaches the new-user trigger now that every
-- table it touches exists.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- games: registry of modular mini-games. The game itself is a React component
-- looked up by slug; everything tunable lives here.
-- -----------------------------------------------------------------------------
create table public.games (
  id                 uuid primary key default gen_random_uuid(),
  slug               citext not null unique,              -- 'bakery-catch'
  name               text not null,
  tagline            text,
  description        text,
  thumbnail_url      text,
  placeholder_color  text not null default '#F6D68A',
  location_id        uuid references public.locations (id) on delete set null,
  coins_per_point    numeric(6,3) not null default 0.1,   -- payout formula: floor(score * coins_per_point)
  max_coins_per_play int not null default 25,
  max_coins_per_day  int not null default 100,            -- caps grinding
  min_play_seconds   int not null default 5,              -- reject impossibly fast sessions
  supports_touch     boolean not null default true,
  sort_order         int not null default 0,
  status             public.content_status not null default 'draft',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger games_set_updated_at before update on public.games
  for each row execute function public.set_updated_at();

create table public.game_scores (
  id             bigint generated always as identity primary key,
  user_id        uuid not null references auth.users (id) on delete cascade,
  game_id        uuid not null references public.games (id) on delete cascade,
  score          int  not null check (score >= 0),
  coins_awarded  int  not null default 0 check (coins_awarded >= 0),
  duration_ms    int  check (duration_ms is null or duration_ms >= 0),
  played_on      date not null default (now() at time zone 'utc')::date,
  created_at     timestamptz not null default now()
);

create index game_scores_user_game_idx  on public.game_scores (user_id, game_id, score desc);
create index game_scores_game_score_idx on public.game_scores (game_id, score desc);
create index game_scores_daily_idx      on public.game_scores (user_id, game_id, played_on);

-- -----------------------------------------------------------------------------
-- events: seasonal campaigns that scope quests, shop items and map changes.
-- -----------------------------------------------------------------------------
create table public.events (
  id           uuid primary key default gen_random_uuid(),
  slug         citext not null unique,
  name         text not null,
  description  text,
  banner_url   text,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  config       jsonb not null default '{}'::jsonb,       -- theme, map overlay, etc.
  status       public.content_status not null default 'draft',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint events_dates check (ends_at > starts_at)
);

create trigger events_set_updated_at before update on public.events
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- quests
-- -----------------------------------------------------------------------------
create table public.quests (
  id                  uuid primary key default gen_random_uuid(),
  slug                citext not null unique,
  name                text not null,
  description         text,
  flavor_text         text,                              -- Mibbi-voice line: "Crumb is worried you forgot snack time."
  requirement_type    public.requirement_type not null,
  requirement_config  jsonb not null default '{}'::jsonb,
  target_count        int not null default 1 check (target_count >= 1),
  reward_coins        int not null default 0 check (reward_coins >= 0),
  reward_item_id      uuid references public.items (id) on delete set null,
  series_id           uuid references public.series (id) on delete set null,
  event_id            uuid references public.events (id) on delete set null,
  giver_character_id  uuid references public.characters (id) on delete set null,  -- who "asks"
  repeat_interval     public.repeat_interval not null default 'none',
  starts_at           timestamptz,
  ends_at             timestamptz,
  sort_order          int not null default 0,
  status              public.content_status not null default 'draft',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger quests_set_updated_at before update on public.quests
  for each row execute function public.set_updated_at();

create index quests_active_idx on public.quests (status, starts_at, ends_at);

-- user_quests: progress per user per quest per period (daily quests reset by period_key).
create table public.user_quests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  quest_id      uuid not null references public.quests (id) on delete cascade,
  period_key    text not null default 'once',            -- 'once' | '2026-09-06' | '2026-W36'
  progress      int  not null default 0 check (progress >= 0),
  status        public.user_quest_status not null default 'active',
  completed_at  timestamptz,
  claimed_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, quest_id, period_key)
);

create trigger user_quests_set_updated_at before update on public.user_quests
  for each row execute function public.set_updated_at();

create index user_quests_user_idx on public.user_quests (user_id, status);

-- -----------------------------------------------------------------------------
-- achievements
-- -----------------------------------------------------------------------------
create table public.achievements (
  id                  uuid primary key default gen_random_uuid(),
  slug                citext not null unique,
  name                text not null,
  description         text,
  icon_key            text not null default 'star',      -- maps to an icon component / uploaded image
  icon_url            text,
  requirement_type    public.requirement_type not null,
  requirement_config  jsonb not null default '{}'::jsonb,
  target_count        int not null default 1 check (target_count >= 1),
  reward_coins        int not null default 0 check (reward_coins >= 0),
  reward_item_id      uuid references public.items (id) on delete set null,
  is_secret           boolean not null default false,    -- hidden until earned
  sort_order          int not null default 0,
  status              public.content_status not null default 'draft',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger achievements_set_updated_at before update on public.achievements
  for each row execute function public.set_updated_at();

create table public.user_achievements (
  user_id         uuid not null references auth.users (id) on delete cascade,
  achievement_id  uuid not null references public.achievements (id) on delete cascade,
  earned_at       timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- -----------------------------------------------------------------------------
-- daily rewards: a 7-day (configurable) streak ladder.
-- -----------------------------------------------------------------------------
create table public.daily_rewards (
  day_index       int primary key check (day_index >= 1),
  label           text not null,
  reward_coins    int not null default 0 check (reward_coins >= 0),
  reward_item_id  uuid references public.items (id) on delete set null,
  status          public.content_status not null default 'active'
);

create table public.user_daily_claims (
  id             bigint generated always as identity primary key,
  user_id        uuid not null references auth.users (id) on delete cascade,
  claimed_on     date not null,
  streak         int  not null check (streak >= 1),
  day_index      int  not null references public.daily_rewards (day_index),
  reward_coins   int  not null default 0,
  reward_item_id uuid references public.items (id) on delete set null,
  created_at     timestamptz not null default now(),
  unique (user_id, claimed_on)
);

create index user_daily_claims_user_idx on public.user_daily_claims (user_id, claimed_on desc);

-- -----------------------------------------------------------------------------
-- location unlocks: rules that tie physical ownership to the digital world.
-- A location with no rules is always open. Rules are OR-ed: satisfying any
-- rule unlocks the tier it names.
-- -----------------------------------------------------------------------------
create table public.location_unlocks (
  id            uuid primary key default gen_random_uuid(),
  location_id   uuid not null references public.locations (id) on delete cascade,
  tier          int  not null default 1 check (tier >= 1),  -- 1 = visible/partial, 2 = game, 3 = full interior...
  tier_label    text,                                        -- 'Bakery mini-game'
  requirement_type    public.requirement_type not null,
  requirement_config  jsonb not null default '{}'::jsonb,
  target_count  int not null default 1 check (target_count >= 1),
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index location_unlocks_location_idx on public.location_unlocks (location_id, tier);

create table public.user_location_visits (
  user_id           uuid not null references auth.users (id) on delete cascade,
  location_id       uuid not null references public.locations (id) on delete cascade,
  first_visited_at  timestamptz not null default now(),
  last_visited_at   timestamptz not null default now(),
  visit_count       int not null default 1,
  primary key (user_id, location_id)
);

-- -----------------------------------------------------------------------------
-- Deferred foreign keys on series (tables now exist).
-- -----------------------------------------------------------------------------
alter table public.series
  add constraint series_completion_reward_item_fk
    foreign key (completion_reward_item_id) references public.items (id) on delete set null,
  add constraint series_completion_unlock_location_fk
    foreign key (completion_unlock_location_id) references public.locations (id) on delete set null;

-- -----------------------------------------------------------------------------
-- Attach the new-user bootstrap trigger to auth.users.
-- -----------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Collection helper views (read-only, respect RLS of underlying tables via
-- security_invoker so users only see their own ownership rows).
-- -----------------------------------------------------------------------------

-- How many distinct required characters of each series a user owns.
create or replace view public.user_series_progress
with (security_invoker = true)
as
select
  um.user_id,
  s.id   as series_id,
  s.slug as series_slug,
  count(distinct sc.character_id) filter (where sc.required_for_completion) as owned_required,
  (select count(*) from public.series_characters x
     where x.series_id = s.id and x.required_for_completion)               as total_required
from public.series s
join public.series_characters sc on sc.series_id = s.id
join public.user_mibbis um on um.character_id = sc.character_id
group by um.user_id, s.id, s.slug;
