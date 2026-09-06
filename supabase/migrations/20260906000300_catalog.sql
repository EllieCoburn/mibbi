-- =============================================================================
-- 0300 CATALOG
-- The admin-managed "content" of the Mibbi universe: rarities, series,
-- locations, characters, variants and the physical SKUs that map to them.
-- Everything here is data, not code: new characters need no deploy.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- rarities: configurable from the admin dashboard.
-- -----------------------------------------------------------------------------
create table public.rarities (
  slug         citext primary key,                      -- 'common', 'uncommon', 'rare', 'chase', 'secret'
  name         text not null,
  description  text,
  sort_order   int  not null default 0,                 -- low = most common
  color_hex    text not null default '#B8A48E',         -- badge colour in UI
  odds_label   text,                                    -- e.g. '1 in 72' (marketing copy only)
  created_at   timestamptz not null default now(),
  constraint rarities_color_hex check (color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

-- -----------------------------------------------------------------------------
-- series: a collection / wave of characters (Series 01 — The Bakery).
-- -----------------------------------------------------------------------------
create table public.series (
  id              uuid primary key default gen_random_uuid(),
  slug            citext not null unique,
  code            text not null unique,                 -- 'S01' – printed on packaging
  name            text not null,                        -- 'The Bakery'
  tagline         text,                                 -- 'Six Mibbis. Endless stories.'
  description     text,
  cover_image_url text,
  sort_order      int not null default 0,
  status          public.content_status not null default 'draft',
  release_date    date,
  -- Completion rewards are resolved by slug at runtime so the row can be
  -- created before the reward item/location exists. FK added in 0700.
  completion_reward_item_id uuid,
  completion_unlock_location_id uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger series_set_updated_at before update on public.series
  for each row execute function public.set_updated_at();

create index series_status_idx on public.series (status, sort_order);

-- -----------------------------------------------------------------------------
-- locations: nodes on the illustrated world map.
-- -----------------------------------------------------------------------------
create table public.locations (
  id            uuid primary key default gen_random_uuid(),
  slug          citext not null unique,
  name          text not null,
  tagline       text,
  description   text,
  image_url     text,
  map_x         numeric(5,2) not null default 50,       -- % from left on the map illustration
  map_y         numeric(5,2) not null default 50,       -- % from top
  series_id     uuid references public.series (id) on delete set null,
  link_type     public.location_link_type not null default 'none',
  link_target   text,                                   -- slug or path the link resolves to
  sort_order    int not null default 0,
  status        public.content_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint locations_map_x check (map_x between 0 and 100),
  constraint locations_map_y check (map_y between 0 and 100)
);

create trigger locations_set_updated_at before update on public.locations
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- characters: the product. One row per Mibbi.
-- -----------------------------------------------------------------------------
create table public.characters (
  id                 uuid primary key default gen_random_uuid(),
  slug               citext not null unique,
  name               text not null,
  species            text not null default 'Mibbi',      -- 'Croissant', 'Peach', 'Pickle'
  personality_key    text not null,                      -- 'worrier', 'optimist' – used for "Which Mibbi are you?"
  personality_label  text not null,                      -- 'The Worrier'
  tagline            text,                               -- 'Overthinks everything. But always shows up.'
  description        text,
  catchphrase        text,
  favorite_food      text,
  favorite_activity  text,
  trait              text,                               -- 'Overthinker'
  home_location_id   uuid references public.locations (id) on delete set null,
  rarity_slug        citext not null references public.rarities (slug) on update cascade,
  -- Art. All nullable so placeholder art renders until final artwork lands.
  image_url          text,                               -- hero illustration
  thumbnail_url      text,
  sprite_url         text,                               -- room sprite
  placeholder_color  text not null default '#F4B183',    -- blob colour for placeholder avatar
  placeholder_shape  text not null default 'blob',       -- 'blob' | 'round' | 'tall' | 'square'
  sort_order         int not null default 0,
  status             public.content_status not null default 'draft',
  release_date       date,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint characters_placeholder_color check (placeholder_color ~ '^#[0-9A-Fa-f]{6}$')
);

create trigger characters_set_updated_at before update on public.characters
  for each row execute function public.set_updated_at();

create index characters_status_idx  on public.characters (status, sort_order);
create index characters_rarity_idx  on public.characters (rarity_slug);

-- -----------------------------------------------------------------------------
-- character_variants: alternate editions of a character (Golden Crumb).
-- A variant shares the character's personality but has its own rarity, art
-- and unlocks. Ownership records point at character + optional variant.
-- -----------------------------------------------------------------------------
create table public.character_variants (
  id             uuid primary key default gen_random_uuid(),
  character_id   uuid not null references public.characters (id) on delete cascade,
  slug           citext not null unique,                 -- 'golden-crumb'
  name           text not null,                          -- 'Golden Crumb'
  description    text,
  rarity_slug    citext not null references public.rarities (slug) on update cascade,
  image_url      text,
  thumbnail_url  text,
  sprite_url     text,
  placeholder_color text not null default '#E3B341',
  status         public.content_status not null default 'draft',
  release_date   date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger character_variants_set_updated_at before update on public.character_variants
  for each row execute function public.set_updated_at();

create index character_variants_character_idx on public.character_variants (character_id);

-- -----------------------------------------------------------------------------
-- series_characters: membership of characters in series. A character can be
-- re-released in a later series; completion is computed per series.
-- -----------------------------------------------------------------------------
create table public.series_characters (
  series_id     uuid not null references public.series (id) on delete cascade,
  character_id  uuid not null references public.characters (id) on delete cascade,
  sort_order    int not null default 0,
  required_for_completion boolean not null default true,  -- secrets/chases can be optional
  primary key (series_id, character_id)
);

create index series_characters_character_idx on public.series_characters (character_id);

-- -----------------------------------------------------------------------------
-- product_skus: the physical products. Adoption codes belong to a SKU, which
-- resolves to a character (+ optional variant). Shopify IDs live here so the
-- integration can be added later without a schema change.
-- -----------------------------------------------------------------------------
create table public.product_skus (
  id                 uuid primary key default gen_random_uuid(),
  sku                citext not null unique,              -- 'MIB-S01-CRUMB'
  name               text not null,
  series_id          uuid references public.series (id) on delete set null,
  character_id       uuid not null references public.characters (id) on delete restrict,
  variant_id         uuid references public.character_variants (id) on delete restrict,
  shopify_product_id text,
  shopify_variant_id text,
  purchase_url       text,                               -- "buy the one you're missing"
  status             public.content_status not null default 'active',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger product_skus_set_updated_at before update on public.product_skus
  for each row execute function public.set_updated_at();

create index product_skus_character_idx on public.product_skus (character_id, variant_id);
