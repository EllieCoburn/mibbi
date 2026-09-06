-- =============================================================================
-- 1100 TIMELINE REFINEMENT
-- Honest dates, categories, hidden discoveries and companion reactions.
-- =============================================================================

-- Uncertainty in years (±). Rendered as "c. 300,000 years ago" or
-- "c. 10,000–8,000 BCE" instead of implying false precision.
alter table public.timeline_entries
  add column if not exists start_uncertainty double precision,
  add column if not exists end_uncertainty double precision,
  -- Optional hand-written date label that overrides formatting entirely.
  add column if not exists date_label text,
  -- Broad category for icons, colour and filters (kind stays as the shape).
  add column if not exists category text not null default 'history'
    check (category in ('cosmos','earth','life','humans','civilizations','science','technology','art','culture','migration','invention','exploration','ideas','history')),
  -- Hidden discoveries appear as "?" mounds until a child (or their Mibbi) digs them up.
  add column if not exists is_hidden boolean not null default false,
  -- A short line a companion can say when this entry is opened.
  add column if not exists companion_line text;

create index if not exists timeline_entries_category_idx on public.timeline_entries (category);

-- Backfill categories from kind for existing rows (seed refines these).
update public.timeline_entries set category = case
  when region_slug = 'cosmos' then 'cosmos'
  when kind in ('organism','extinction') then 'life'
  when kind = 'invention' then 'invention'
  when kind = 'artwork' then 'art'
  when kind = 'discovery' then 'science'
  when kind = 'civilization' then 'civilizations'
  when kind = 'era' and start_year < -1000000 then 'earth'
  when start_year < -1000000 then 'earth'
  else 'history' end
where category = 'history';
