-- Timeline content integrity + helper behaviour.
begin;

do $$
declare v_count int; v_bad int; v_orphans int;
begin
  select count(*) into v_count from public.timeline_entries where status = 'active';
  assert v_count >= 120, 'seeded at least 120 entries, got ' || v_count;

  select count(*) into v_bad from public.timeline_entries where end_year is not null and end_year < start_year;
  assert v_bad = 0, 'no entry ends before it starts';

  select count(*) into v_orphans from public.timeline_entries e
  where e.parent_slug is not null and not exists (select 1 from public.timeline_entries p where p.slug = e.parent_slug);
  assert v_orphans = 0, 'every parent exists';

  select count(*) into v_bad from public.timeline_entries where kind <> 'era' and region_slug is null;
  assert v_bad = 0, 'every non-era entry has a region (time is spatial)';

  select count(*) into v_bad from public.timeline_entries where kind <> 'era' and (what is null or why is null);
  assert v_bad = 0, 'every non-era entry has WHAT and WHY IT MATTERS';

  -- Ordering sanity: the story reads in the right order.
  assert (select start_year from public.timeline_entries where slug = 'big-bang') < (select start_year from public.timeline_entries where slug = 'earth-forms'), 'Big Bang before Earth';
  assert (select start_year from public.timeline_entries where slug = 't-rex') < (select start_year from public.timeline_entries where slug = 'homo-sapiens'), 'T. rex before humans';
  assert (select start_year from public.timeline_entries where slug = 'writing') < (select start_year from public.timeline_entries where slug = 'alphabet'), 'writing before alphabet';
  assert (select start_year from public.timeline_entries where slug = 'movable-type') < (select start_year from public.timeline_entries where slug = 'gutenberg'), 'Chinese movable type before Gutenberg';

  -- Every adventure step points at a real entry, and physical unlocks point at real characters.
  select count(*) into v_bad
  from public.adventures a, jsonb_array_elements(a.steps) s
  where not exists (select 1 from public.timeline_entries e where e.slug = (s->>'entry_slug'));
  assert v_bad = 0, 'adventure steps reference existing entries';

  select count(*) into v_bad from public.adventures a
  where a.unlock_character_slug is not null and not exists (select 1 from public.characters c where c.slug = a.unlock_character_slug);
  assert v_bad = 0, 'adventure unlocks reference existing characters';

  -- Companions all have a curiosity.
  select count(*) into v_bad from public.characters where curiosity_key is null;
  assert v_bad = 0, 'every character has a curiosity_key';
end $$;

-- "What else was happening?" around 1215 finds the Mongols and Angkor-era Cambodia, not the Romans.
do $$
declare v_slugs text[];
begin
  select array_agg(slug::text) into v_slugs from public.entries_around_year(1215);
  assert 'magna-carta' = any(v_slugs), 'finds Magna Carta itself';
  assert 'mongol-empire' = any(v_slugs), 'finds the Mongol Empire (span covers 1215)';
  assert 'mali-empire' = any(v_slugs), 'finds the Mali Empire (starts 1235, within tolerance)';
  assert not ('roman-empire' = any(v_slugs)), 'does not find Rome';
end $$;

-- Around 66 million years ago the tolerance widens to millions of years.
do $$
declare v_slugs text[];
begin
  select array_agg(slug::text) into v_slugs from public.entries_around_year(-66000000);
  assert 't-rex' = any(v_slugs) and 'asteroid-impact' = any(v_slugs), 'deep-time neighbours found';
  assert not ('lucy' = any(v_slugs)), 'Lucy is not a neighbour of T. rex';
end $$;

-- Anonymous users can read entries; discoveries are private.
do $$
declare v_count int;
begin
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('role', 'anon', true);
  select count(*) into v_count from public.timeline_entries;
  assert v_count > 100, 'anon can read the timeline';
  select count(*) into v_count from public.user_discoveries;
  assert v_count = 0, 'anon sees no discoveries';
end $$;

rollback;
select 'timeline tests passed' as result;
