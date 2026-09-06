-- =============================================================================
-- SEED — demo content for local development and staging.
-- Safe to re-run: every insert is keyed on a slug and upserts.
-- Character copy follows the brand moodboard; art is placeholder until final
-- illustrations land (swap image_url / thumbnail_url / sprite_url).
-- =============================================================================

-- ---------------------------------------------------------------- rarities
insert into public.rarities (slug, name, description, sort_order, color_hex, odds_label) values
  ('common',   'Common',   'Found in every box.',                          10, '#B8A48E', null),
  ('uncommon', 'Uncommon', 'A little harder to find.',                     20, '#8FAE8B', null),
  ('rare',     'Rare',     'Rare friends make brighter worlds.',           30, '#7E9BC2', '1 in 24'),
  ('chase',    'Chase',    'The one everyone is looking for.',             40, '#E0685A', '1 in 48'),
  ('secret',   'Secret',   'Nobody is supposed to know about this one.',   50, '#E3B341', '1 in 72')
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  sort_order = excluded.sort_order, color_hex = excluded.color_hex, odds_label = excluded.odds_label;

-- ---------------------------------------------------------------- currencies
insert into public.currencies (slug, name, icon) values ('coins', 'Mibbi Coins', 'coin')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- series
insert into public.series (slug, code, name, tagline, description, sort_order, status, release_date) values
  ('the-bakery', 'S01', 'The Bakery', 'Six Mibbis. Endless stories.',
   'Series 01 opens the doors of the Bakery: warm ovens, questionable decisions and a pickle who should not be here.',
   1, 'active', '2026-10-01'),
  ('cozy-town', 'S02', 'Cozy Town', 'Down the road from the Bakery.',
   'Series 02 heads into town. Quieter friends, bigger adventures.',
   2, 'draft', null)
on conflict (slug) do update set code = excluded.code, name = excluded.name, tagline = excluded.tagline,
  description = excluded.description, sort_order = excluded.sort_order, status = excluded.status,
  release_date = excluded.release_date;

-- ---------------------------------------------------------------- locations
insert into public.locations (slug, name, tagline, description, map_x, map_y, series_id, link_type, link_target, sort_order, status) values
  ('mibbi-home',   'Mibbi Home',   'Your room. Your rules.',              'Where your Mibbis live, nap and wait for you.',  18, 70, null, 'page', '/home', 1, 'active'),
  ('the-bakery',   'The Bakery',   'Something smells amazing.',           'Home of Series 01. Warm, floury, slightly anxious.', 30, 30, (select id from public.series where slug = 'the-bakery'), 'page', '/world/the-bakery', 2, 'active'),
  ('cozy-town',    'Cozy Town',    'Everyone knows everyone.',            'A small town with a big heart and a very slow bus.', 55, 45, (select id from public.series where slug = 'cozy-town'), 'page', '/world/cozy-town', 3, 'active'),
  ('mibbi-forest', 'Mibbi Forest', 'Mind the mushrooms.',                 'Tall trees, soft moss and a few surprises.', 78, 22, null, 'none', null, 4, 'active'),
  ('sunny-beach',  'Sunny Beach',  'Bring snacks.',                       'Sand, waves and the world''s laziest crab.', 22, 92, null, 'none', null, 5, 'active'),
  ('night-market', 'Night Market', 'Open late. Very late.',               'Lanterns, noodles and things that glow.', 82, 84, null, 'none', null, 6, 'active'),
  ('mibbi-market', 'Mibbi Market', 'Treat yourself.',                     'The digital shop. Furniture, decorations and snacks.', 50, 78, null, 'shop', '/shop', 7, 'active')
on conflict (slug) do update set name = excluded.name, tagline = excluded.tagline, description = excluded.description,
  map_x = excluded.map_x, map_y = excluded.map_y, series_id = excluded.series_id, link_type = excluded.link_type,
  link_target = excluded.link_target, sort_order = excluded.sort_order, status = excluded.status;

-- ---------------------------------------------------------------- characters
insert into public.characters
  (slug, name, species, personality_key, personality_label, tagline, description, catchphrase, favorite_food, favorite_activity, trait, home_location_id, rarity_slug, placeholder_color, placeholder_shape, sort_order, status, release_date)
values
  ('crumb', 'Crumb', 'Croissant', 'worrier', 'The Worrier',
   'Overthinks everything. But always shows up.',
   'Crumb worries about almost everything: the oven, the weather, whether you remembered snack time. Crumb also never, ever lets a friend down.',
   'Are we sure about this?', 'Warm pastries', 'Making lists of things that might go wrong', 'Overthinker',
   (select id from public.locations where slug = 'the-bakery'), 'common', '#F2A65A', 'blob', 1, 'active', '2026-10-01'),

  ('mochi', 'Mochi', 'Mochi', 'optimist', 'The Optimist',
   'Sees the good in every day.',
   'Mochi wakes up happy and stays that way. Rain is just sky confetti. Burnt toast is just very toasty toast.',
   'Good things ahead!', 'Sweet red bean', 'Sunrise walks', 'Sunny',
   (select id from public.locations where slug = 'the-bakery'), 'common', '#F5EDE2', 'round', 2, 'active', '2026-10-01'),

  ('toast', 'Toast', 'Toast', 'sleepy', 'The Sleepy One',
   'Tired. Always. Still lovable.',
   'Toast has never once been fully awake. Toast is also the best listener in the Bakery, mostly because Toast is too tired to interrupt.',
   'Five more minutes.', 'Butter. Just butter.', 'Napping in warm places', 'Cozy',
   (select id from public.locations where slug = 'the-bakery'), 'common', '#C98A4B', 'square', 3, 'active', '2026-10-01'),

  ('peach', 'Peach', 'Peach', 'dramatic', 'The Drama',
   'Everything is a big deal. (And that''s okay.)',
   'Peach feels everything at full volume. A small win is a parade. A small setback is a tragedy in three acts. Peach also gives the best hugs.',
   'I cannot believe this is happening.', 'Peach cobbler, obviously', 'Retelling the day in dramatic detail', 'Big feelings',
   (select id from public.locations where slug = 'the-bakery'), 'common', '#F7A8A0', 'round', 4, 'active', '2026-10-01'),

  ('pickle', 'Pickle', 'Pickle', 'chaotic', 'The Chaos',
   'Questionable decisions. Great vibes.',
   'Nobody knows why there is a pickle in the Bakery. Pickle does not know either. Pickle has made another questionable decision and it is somehow working out.',
   'Watch this.', 'Anything on a stick', 'Trying things nobody asked for', 'Unpredictable',
   (select id from public.locations where slug = 'the-bakery'), 'uncommon', '#7FA36B', 'tall', 5, 'active', '2026-10-01'),

  ('butter', 'Butter', 'Butter', 'supportive', 'The Supporter',
   'Soft, sensitive, and always cheering you on.',
   'Butter believes in you more than you believe in you. Butter remembers everyone''s favourite things and melts a little when you say thank you.',
   'You''ve got this.', 'Warm bread', 'Cheering from the front row', 'Kind',
   (select id from public.locations where slug = 'the-bakery'), 'common', '#F6D68A', 'square', 6, 'active', '2026-10-01'),

  ('noodle', 'Noodle', 'Bunny', 'adventurous', 'The Adventurer',
   'Always down for a new idea.',
   'Noodle has a map, a snack and no plan. Noodle will find the thing before anyone else knows the thing is missing.',
   'Let''s go find out.', 'Trail mix', 'Exploring somewhere new', 'Curious',
   (select id from public.locations where slug = 'cozy-town'), 'common', '#F1E6D6', 'tall', 7, 'draft', null),

  ('berri', 'Berri', 'Blueberry', 'shy', 'The Shy One',
   'Quieter than most. But so much inside.',
   'Berri takes a while to warm up. Once Berri trusts you, you will have a friend for life and a very good listener.',
   '...hi.', 'Blueberry muffins', 'Reading in a quiet corner', 'Gentle',
   (select id from public.locations where slug = 'cozy-town'), 'common', '#8E8BC2', 'round', 8, 'draft', null)
on conflict (slug) do update set
  name = excluded.name, species = excluded.species, personality_key = excluded.personality_key,
  personality_label = excluded.personality_label, tagline = excluded.tagline, description = excluded.description,
  catchphrase = excluded.catchphrase, favorite_food = excluded.favorite_food, favorite_activity = excluded.favorite_activity,
  trait = excluded.trait, home_location_id = excluded.home_location_id, rarity_slug = excluded.rarity_slug,
  placeholder_color = excluded.placeholder_color, placeholder_shape = excluded.placeholder_shape,
  sort_order = excluded.sort_order, status = excluded.status, release_date = excluded.release_date;

-- ---------------------------------------------------------------- variants
insert into public.character_variants (character_id, slug, name, description, rarity_slug, placeholder_color, status, release_date) values
  ((select id from public.characters where slug = 'crumb'), 'golden-crumb', 'Golden Crumb',
   'Nobody knows where Golden Crumb came from. Crumb is worried about it. Golden Crumb is mysteriously calm.',
   'secret', '#E3B341', 'active', '2026-10-01')
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  rarity_slug = excluded.rarity_slug, placeholder_color = excluded.placeholder_color, status = excluded.status;

-- ---------------------------------------------------------------- series membership
insert into public.series_characters (series_id, character_id, sort_order, required_for_completion)
select s.id, c.id, c.sort_order, true
from public.series s, public.characters c
where s.slug = 'the-bakery' and c.slug in ('crumb','mochi','toast','peach','pickle','butter')
on conflict do nothing;

insert into public.series_characters (series_id, character_id, sort_order, required_for_completion)
select s.id, c.id, c.sort_order, true
from public.series s, public.characters c
where s.slug = 'cozy-town' and c.slug in ('noodle','berri')
on conflict do nothing;

-- ---------------------------------------------------------------- SKUs
insert into public.product_skus (sku, name, series_id, character_id, variant_id, status)
select 'MIB-S01-' || upper(c.slug::text), 'Mibbi Series 01 – ' || c.name, s.id, c.id, null, 'active'
from public.characters c, public.series s
where s.slug = 'the-bakery' and c.slug in ('crumb','mochi','toast','peach','pickle','butter')
on conflict (sku) do nothing;

insert into public.product_skus (sku, name, series_id, character_id, variant_id, status)
select 'MIB-S01-CRUMB-GOLD', 'Mibbi Series 01 – Golden Crumb', s.id, c.id, v.id, 'active'
from public.characters c
join public.character_variants v on v.character_id = c.id and v.slug = 'golden-crumb'
cross join public.series s
where s.slug = 'the-bakery' and c.slug = 'crumb'
on conflict (sku) do nothing;

-- ---------------------------------------------------------------- item categories & items
insert into public.item_categories (slug, name, sort_order, is_background) values
  ('background', 'Backgrounds', 1, true),
  ('bed',        'Beds',        2, false),
  ('chair',      'Chairs',      3, false),
  ('rug',        'Rugs',        4, false),
  ('table',      'Tables',      5, false),
  ('plant',      'Plants',      6, false),
  ('wall-art',   'Wall Art',    7, false),
  ('toy',        'Toys',        8, false),
  ('food',       'Food',        9, false),
  ('lighting',   'Lighting',   10, false),
  ('seasonal',   'Seasonal',   11, false)
on conflict (slug) do nothing;

insert into public.items (slug, name, description, category_slug, rarity_slug, placeholder_color, coin_price, coin_value, is_shop_available, unlock_method, width_units, height_units, sort_order, status) values
  ('bg-cream-room',      'Cream Room',        'A soft, sunny room to start in.',                 'background', 'common',   '#FBF3E6', null, 0,  false, 'starter',  0, 0, 1, 'active'),
  ('bg-dusty-blue-room', 'Dusty Blue Room',   'Calm walls, evening light.',                      'background', 'common',   '#B9C9DB', 120,  60, true,  'purchase', 0, 0, 2, 'active'),
  ('bg-bakery-kitchen',  'Bakery Kitchen',    'Flour on the floor and warmth in the air.',       'background', 'rare',     '#F2C9A0', null, 300, false, 'series_completion', 0, 0, 3, 'active'),
  ('cushion-butter',     'Butter Cushion',    'Extremely squishable. Butter approved.',          'chair',      'common',   '#F6D68A', 0,   10, false, 'starter',  2, 2, 10, 'active'),
  ('rug-round-peach',    'Round Peach Rug',   'Soft on the feet, big on the drama.',             'rug',        'common',   '#F7A8A0', 40,  20, true,  'purchase', 4, 3, 11, 'active'),
  ('bed-toast-loaf',     'Loaf Bed',          'Toast has slept here. Toast recommends it.',      'bed',        'uncommon', '#C98A4B', 150, 75, true,  'purchase', 4, 3, 12, 'active'),
  ('plant-pistachio',    'Pistachio Plant',   'Low maintenance. Pickle keeps trying to eat it.', 'plant',      'common',   '#8FAE8B', 60,  30, true,  'purchase', 2, 3, 13, 'active'),
  ('lamp-mushroom',      'Mushroom Lamp',     'A gentle glow from Mibbi Forest.',                'lighting',   'uncommon', '#B9C9DB', 90,  45, true,  'purchase', 2, 3, 14, 'active'),
  ('art-bakery-sign',    'Bakery Sign',       'The original. Slightly crooked.',                 'wall-art',   'rare',     '#E0685A', null, 120, false, 'adoption', 3, 2, 15, 'active'),
  ('snack-croissant',    'Warm Croissant',    'Crumb''s favourite. Feed it to any Mibbi.',       'food',       'common',   '#F2A65A', 15,  5,  true,  'purchase', 1, 1, 16, 'active'),
  ('toy-pickle-ball',    'Pickle Ball',       'It is a ball. It is also a pickle.',              'toy',        'common',   '#7FA36B', 35,  15, true,  'purchase', 2, 2, 17, 'active'),
  ('art-golden-frame',   'Golden Frame',      'For those who found the one nobody talks about.','wall-art',   'secret',   '#E3B341', null, 500, false, 'adoption', 3, 2, 18, 'active')
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  category_slug = excluded.category_slug, rarity_slug = excluded.rarity_slug, placeholder_color = excluded.placeholder_color,
  coin_price = excluded.coin_price, coin_value = excluded.coin_value, is_shop_available = excluded.is_shop_available,
  unlock_method = excluded.unlock_method, width_units = excluded.width_units, height_units = excluded.height_units,
  sort_order = excluded.sort_order, status = excluded.status;

-- Series completion reward for the Bakery: unlock the kitchen background + full Bakery interior.
update public.series
set completion_reward_item_id = (select id from public.items where slug = 'bg-bakery-kitchen'),
    completion_unlock_location_id = (select id from public.locations where slug = 'the-bakery')
where slug = 'the-bakery';

-- ---------------------------------------------------------------- games
insert into public.games (slug, name, tagline, description, placeholder_color, location_id, coins_per_point, max_coins_per_play, max_coins_per_day, sort_order, status) values
  ('bakery-catch', 'Bakery Catch', 'Catch the good ones. Dodge the burnt ones.',
   'Pastries are falling out of the oven again. Catch as many as you can and avoid anything that looks a bit too crispy.',
   '#F2C9A0', (select id from public.locations where slug = 'the-bakery'), 0.5, 25, 100, 1, 'active'),
  ('mibbi-match', 'Mibbi Match', 'Find the pairs before Toast falls asleep.',
   'A calm matching game. Flip cards, find pairs, remember where Pickle went.',
   '#B9C9DB', (select id from public.locations where slug = 'cozy-town'), 1.0, 20, 80, 2, 'draft')
on conflict (slug) do update set name = excluded.name, tagline = excluded.tagline, description = excluded.description,
  location_id = excluded.location_id, status = excluded.status;

-- ---------------------------------------------------------------- daily rewards (7-day ladder)
insert into public.daily_rewards (day_index, label, reward_coins) values
  (1, 'Day 1', 10), (2, 'Day 2', 10), (3, 'Day 3', 15), (4, 'Day 4', 15),
  (5, 'Day 5', 20), (6, 'Day 6', 20), (7, 'Day 7', 50)
on conflict (day_index) do update set label = excluded.label, reward_coins = excluded.reward_coins;

-- ---------------------------------------------------------------- quests
insert into public.quests (slug, name, description, flavor_text, requirement_type, requirement_config, target_count, reward_coins, giver_character_id, series_id, repeat_interval, sort_order, status) values
  ('first-friend-home',  'Welcome Home',      'Adopt your first Mibbi.',                   'Someone has been waiting for you.',                       'adopt_count',        '{}', 1, 50,  null, null, 'none', 1, 'active'),
  ('play-once',          'Warm Up',           'Play any mini-game once.',                  'Pickle bets you can''t catch a single croissant.',        'play_game_count',    '{}', 1, 20,  (select id from public.characters where slug = 'pickle'), null, 'none', 2, 'active'),
  ('decorate-room',      'Getting Comfy',     'Place three items in your room.',           'Butter thinks your room could use a cushion. Or three.',  'room_items_placed',  '{}', 3, 30,  (select id from public.characters where slug = 'butter'), null, 'none', 3, 'active'),
  ('earn-100',           'Pocket Money',      'Earn 100 coins.',                           'Mochi is sure good things are ahead. Coins, specifically.','earn_coins',         '{"amount": 100}', 100, 25, (select id from public.characters where slug = 'mochi'), null, 'none', 4, 'active'),
  ('bakery-two',         'Bakery Regulars',   'Own two Bakery Mibbis.',                    'Crumb feels safer in pairs.',                             'series_owned_count', '{"series_slug": "the-bakery"}', 2, 75, (select id from public.characters where slug = 'crumb'), (select id from public.series where slug = 'the-bakery'), 'none', 5, 'active'),
  ('daily-play',         'Daily Bake',        'Play a mini-game today.',                   'Toast would do it but Toast is asleep.',                  'play_game_count',    '{}', 1, 10,  (select id from public.characters where slug = 'toast'), null, 'daily', 6, 'active'),
  ('daily-feed',         'Snack Time',        'Feed one of your Mibbis today.',            'Crumb is worried you forgot about snack time.',           'feed_mibbi',         '{}', 1, 10,  (select id from public.characters where slug = 'crumb'), null, 'daily', 7, 'active'),
  ('login-three',        'Regular',           'Log in on three different days.',           'Peach counted. Peach always counts.',                     'login_days',         '{}', 3, 30,  (select id from public.characters where slug = 'peach'), null, 'none', 8, 'active')
on conflict (slug) do update set name = excluded.name, description = excluded.description, flavor_text = excluded.flavor_text,
  requirement_type = excluded.requirement_type, requirement_config = excluded.requirement_config, target_count = excluded.target_count,
  reward_coins = excluded.reward_coins, giver_character_id = excluded.giver_character_id, series_id = excluded.series_id,
  repeat_interval = excluded.repeat_interval, sort_order = excluded.sort_order, status = excluded.status;

-- ---------------------------------------------------------------- achievements
insert into public.achievements (slug, name, description, icon_key, requirement_type, requirement_config, target_count, reward_coins, reward_item_id, is_secret, sort_order, status) values
  ('first-friend',   'First Friend',    'Adopt your first Mibbi.',            'heart',   'adopt_count',        '{}', 1, 25, (select id from public.items where slug = 'art-bakery-sign'), false, 1, 'active'),
  ('getting-cozy',   'Getting Cozy',    'Decorate your room.',                'home',    'room_items_placed',  '{}', 1, 15, null, false, 2, 'active'),
  ('collector',      'Collector',       'Own five Mibbis.',                   'star',    'adopt_count',        '{}', 5, 100, null, false, 3, 'active'),
  ('bakery-bestie',  'Bakery Bestie',   'Complete the Bakery set.',           'cake',    'series_complete',    '{"series_slug": "the-bakery"}', 1, 250, null, false, 4, 'active'),
  ('rare-find',      'Rare Find',       'Adopt a rare Mibbi.',                'sparkle', 'adopt_rarity',       '{"min_rarity_sort": 30}', 1, 50, null, false, 5, 'active'),
  ('world-traveler', 'World Traveler',  'Visit five Mibbi locations.',        'map',     'visit_locations',    '{}', 5, 40, null, false, 6, 'active'),
  ('golden-hour',    'Golden Hour',     'You found the one nobody talks about.', 'crown', 'adopt_character',   '{"variant_slug": "golden-crumb"}', 1, 500, (select id from public.items where slug = 'art-golden-frame'), true, 7, 'active')
on conflict (slug) do update set name = excluded.name, description = excluded.description, icon_key = excluded.icon_key,
  requirement_type = excluded.requirement_type, requirement_config = excluded.requirement_config, target_count = excluded.target_count,
  reward_coins = excluded.reward_coins, reward_item_id = excluded.reward_item_id, is_secret = excluded.is_secret,
  sort_order = excluded.sort_order, status = excluded.status;

-- ---------------------------------------------------------------- location unlock tiers (physical → digital)
insert into public.location_unlocks (location_id, tier, tier_label, requirement_type, requirement_config, target_count, sort_order)
select l.id, x.tier, x.label, x.req::public.requirement_type, x.cfg::jsonb, x.target, x.tier
from public.locations l
cross join (values
  (1, 'The Bakery appears on the map',      'series_owned_count', '{"series_slug": "the-bakery"}', 1),
  (2, 'Bakery Catch mini-game',             'series_owned_count', '{"series_slug": "the-bakery"}', 3),
  (3, 'Full Bakery interior',               'series_complete',    '{"series_slug": "the-bakery"}', 1),
  (4, 'Secret Golden Bakery',               'adopt_character',    '{"variant_slug": "golden-crumb"}', 1)
) as x(tier, label, req, cfg, target)
where l.slug = 'the-bakery'
  and not exists (select 1 from public.location_unlocks u where u.location_id = l.id and u.tier = x.tier);

-- ---------------------------------------------------------------- demo adoption codes (LOCAL / STAGING ONLY)
-- Plaintext codes below only work when ADOPTION_CODE_PEPPER=dev-pepper-change-me.
-- Code format: 12 chars from the alphabet ABCDEFGHJKMNPQRSTUVWXYZ23456789 (no 0/O/1/I/L),
-- displayed as XXXX-XXXX-XXXX. Never seed real codes this way.
do $$
declare
  v_pepper constant text := 'dev-pepper-change-me';
  v_batch  uuid;
  r record;
begin
  for r in
    select * from (values
      ('MIB-S01-CRUMB',      'CRUMBDEVAAAA'),
      ('MIB-S01-CRUMB',      'CRUMBDEVBBBB'),
      ('MIB-S01-MOCHI',      'MOCHDEV2AAAA'),
      ('MIB-S01-TOAST',      'TOASTDEVAAAA'),
      ('MIB-S01-PEACH',      'PEACHDEVAAAA'),
      ('MIB-S01-PICKLE',     'PCKLDEV2AAAA'),
      ('MIB-S01-BUTTER',     'BTTRDEV2AAAA'),
      ('MIB-S01-CRUMB-GOLD', 'GCRMBDEVAAAA')
    ) as v(sku, code)
  loop
    select b.id into v_batch from public.code_batches b
    join public.product_skus s on s.id = b.sku_id
    where s.sku = r.sku and b.name = 'DEV seed batch';

    if v_batch is null then
      insert into public.code_batches (name, sku_id, quantity, notes)
      values ('DEV seed batch', (select id from public.product_skus where sku = r.sku), 2, 'Local development codes')
      returning id into v_batch;
    end if;

    insert into public.adoption_codes (code_hash, code_hint, batch_id, sku_id)
    values (encode(hmac(r.code, v_pepper, 'sha256'), 'hex'), right(r.code, 4), v_batch,
            (select id from public.product_skus where sku = r.sku))
    on conflict (code_hash) do nothing;
  end loop;
end $$;
