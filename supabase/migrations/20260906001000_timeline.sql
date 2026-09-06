-- =============================================================================
-- 1000 TIMELINE
-- The product. A proportional, zoomable timeline of everything from the
-- beginning of the universe to today, plus the systems that hang off it:
-- regions (time is spatial), adventures (story expeditions), the personal
-- museum (discoveries), and quiet concept signals (invisible assessment).
--
-- Time representation: `start_year` / `end_year` are years as double
-- precision. Negative numbers are BCE years as written (-753 = 753 BCE);
-- deep time is the same idea (-66000000 = 66 million years ago); 2026 = today.
-- One axis covers 13.8 billion years and the year 1215 without special cases.
-- =============================================================================

create type public.timeline_kind as enum (
  'era',           -- a span that contains other things (Universe, Jurassic, Bronze Age)
  'event',         -- something that happened
  'organism',      -- a life form or group of life forms
  'civilization',  -- a society occupying a span of time and a place
  'person',        -- a historical person (span = lifetime)
  'invention',     -- a technology or technique
  'artwork',       -- art, music, writing, architecture
  'discovery',     -- a scientific idea or finding
  'place',         -- a site or structure
  'extinction'     -- a mass extinction
);

-- Regions of the world (plus the cosmos and the whole Earth). lat/lng place
-- a pin on the Atlas; entries can override with their own coordinates.
create table public.regions (
  slug        citext primary key,
  name        text not null,
  lat         numeric(6,2) not null default 0,
  lng         numeric(6,2) not null default 0,
  sort_order  int not null default 0,
  color_hex   text not null default '#B9C9DB'
);

create table public.timeline_entries (
  id              uuid primary key default gen_random_uuid(),
  slug            citext not null unique,
  kind            public.timeline_kind not null,
  name            text not null,
  tagline         text,                          -- one line a child reads first
  start_year      double precision not null,     -- astronomical year
  end_year        double precision,              -- null = a moment
  is_ongoing      boolean not null default false,-- true = continues to today
  precision       text not null default 'approx' check (precision in ('exact','year','decade','century','approx','deep')),
  parent_slug     citext references public.timeline_entries (slug) on delete set null,  -- era nesting
  level           int not null default 0,        -- 0 broadest era row … 2 detailed; ignored for non-eras
  region_slug     citext references public.regions (slug) on update cascade,
  lat             numeric(6,2),
  lng             numeric(6,2),
  importance      int not null default 2 check (importance between 1 and 3),  -- 3 = shows at any zoom
  min_span_years  double precision,              -- optional hard gate: show only when viewport span <= this
  age_band        int not null default 1 check (age_band between 1 and 4),    -- 1: 5–7, 2: 7–9, 3: 9–12, 4: older
  curiosity_key   text,                          -- fossil | sprout | wonder | story | maker | muse | explorer
  what            text,                          -- WHAT (2–3 sentences max)
  where_text      text,                          -- WHERE in words
  why             text,                          -- WHY IT MATTERS
  color_hex       text,
  icon_key        text not null default 'dot',
  image_url       text,
  status          public.content_status not null default 'active',
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint timeline_entries_span check (end_year is null or end_year >= start_year)
);

create trigger timeline_entries_set_updated_at before update on public.timeline_entries
  for each row execute function public.set_updated_at();

create index timeline_entries_time_idx   on public.timeline_entries (start_year, end_year);
create index timeline_entries_kind_idx   on public.timeline_entries (kind, status);
create index timeline_entries_region_idx on public.timeline_entries (region_slug);
create index timeline_entries_parent_idx on public.timeline_entries (parent_slug);

-- Relationships between entries: the connective tissue of the story.
create table public.entry_relations (
  from_slug  citext not null references public.timeline_entries (slug) on delete cascade,
  to_slug    citext not null references public.timeline_entries (slug) on delete cascade,
  relation   text not null check (relation in ('led_to', 'caused', 'overlapped', 'part_of', 'inspired', 'ended')),
  note       text,
  primary key (from_slug, to_slug, relation)
);

-- Companions: which Mibbi notices what.
alter table public.characters add column if not exists curiosity_key text;
comment on column public.characters.curiosity_key is 'fossil | sprout | wonder | story | maker | muse | explorer';

-- -----------------------------------------------------------------------------
-- Adventures: story-driven expeditions through the timeline. Steps are a
-- JSON list of { title, text, entry_slug, companion_line } so new adventures
-- are content, not code. `unlock_character_slug` ties an adventure to a
-- physical Mibbi: owning that character (via adoption) unlocks it.
-- -----------------------------------------------------------------------------
create table public.adventures (
  id                     uuid primary key default gen_random_uuid(),
  slug                   citext not null unique,
  name                   text not null,
  tagline                text,
  description            text,
  curiosity_key          text,
  companion_character_slug citext,               -- who guides it
  unlock_character_slug  citext,                 -- null = free for everyone
  start_entry_slug       citext references public.timeline_entries (slug) on delete set null,
  steps                  jsonb not null default '[]'::jsonb,
  age_band               int not null default 1,
  sort_order             int not null default 0,
  status                 public.content_status not null default 'active',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger adventures_set_updated_at before update on public.adventures
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- The personal museum: what a child has discovered. One row per entry.
-- -----------------------------------------------------------------------------
create table public.user_discoveries (
  user_id        uuid not null references auth.users (id) on delete cascade,
  entry_id       uuid not null references public.timeline_entries (id) on delete cascade,
  discovered_via text not null default 'timeline' check (discovered_via in ('timeline','atlas','adventure','game','adoption')),
  discovered_at  timestamptz not null default now(),
  primary key (user_id, entry_id)
);

create index user_discoveries_user_idx on public.user_discoveries (user_id, discovered_at desc);

create table public.user_adventure_progress (
  user_id       uuid not null references auth.users (id) on delete cascade,
  adventure_id  uuid not null references public.adventures (id) on delete cascade,
  step_index    int not null default 0 check (step_index >= 0),
  completed_at  timestamptz,
  updated_at    timestamptz not null default now(),
  primary key (user_id, adventure_id)
);

-- -----------------------------------------------------------------------------
-- Invisible assessment. Each row is one judgement the child made while
-- playing (which came first, how far apart, what overlapped). Never shown
-- as a grade; used to choose what the world offers next.
-- -----------------------------------------------------------------------------
create table public.concept_signals (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  concept     text not null,        -- 'ordering' | 'scale' | 'simultaneity' | 'bce_ce' | 'century' | 'cause' | 'geography'
  correct     boolean not null,
  context     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index concept_signals_user_idx on public.concept_signals (user_id, concept, created_at desc);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.regions enable row level security;
alter table public.timeline_entries enable row level security;
alter table public.entry_relations enable row level security;
alter table public.adventures enable row level security;
alter table public.user_discoveries enable row level security;
alter table public.user_adventure_progress enable row level security;
alter table public.concept_signals enable row level security;

create policy "regions_public_read" on public.regions for select to anon, authenticated using (true);
create policy "regions_admin_write" on public.regions for all to authenticated using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

create policy "timeline_entries_public_read" on public.timeline_entries for select to anon, authenticated using (status = 'active' or public.is_admin());
create policy "timeline_entries_admin_write" on public.timeline_entries for all to authenticated using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

create policy "entry_relations_public_read" on public.entry_relations for select to anon, authenticated using (true);
create policy "entry_relations_admin_write" on public.entry_relations for all to authenticated using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

create policy "adventures_public_read" on public.adventures for select to anon, authenticated using (status = 'active' or public.is_admin());
create policy "adventures_admin_write" on public.adventures for all to authenticated using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

-- A child owns their discoveries and progress outright (no value moves).
create policy "user_discoveries_own" on public.user_discoveries for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "user_discoveries_admin_read" on public.user_discoveries for select to authenticated using (public.is_admin());

create policy "user_adventure_progress_own" on public.user_adventure_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "concept_signals_insert_own" on public.concept_signals for insert to authenticated with check (user_id = auth.uid());
create policy "concept_signals_select_own" on public.concept_signals for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- -----------------------------------------------------------------------------
-- Helper: what was happening around a year. Used by the Atlas and by
-- "What else was happening?". Tolerance widens with distance from today so
-- deep-time moments still find neighbours.
-- -----------------------------------------------------------------------------
create or replace function public.entries_around_year(p_year double precision, p_tolerance double precision default null)
returns setof public.timeline_entries
language sql
stable
security invoker
set search_path = public
as $$
  with t as (
    select coalesce(p_tolerance, greatest(50, abs(2026 - p_year) * 0.05)) as tol
  )
  select e.*
  from public.timeline_entries e, t
  where e.status = 'active'
    and e.kind <> 'era'
    and (
      (e.end_year is not null and e.start_year <= p_year + t.tol and coalesce(e.end_year, 2026) >= p_year - t.tol)
      or (e.is_ongoing and e.start_year <= p_year + t.tol)
      or (e.end_year is null and not e.is_ongoing and abs(e.start_year - p_year) <= t.tol)
    )
  order by e.importance desc, e.start_year;
$$;

grant execute on function public.entries_around_year(double precision, double precision) to anon, authenticated;
