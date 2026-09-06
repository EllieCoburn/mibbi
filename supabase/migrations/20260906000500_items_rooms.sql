-- =============================================================================
-- 0500 ITEMS, INVENTORY, ROOMS
-- Digital items, what each user owns, and the customizable 2D room.
-- Trading is intentionally NOT implemented; `is_tradeable` and the
-- per-row inventory design leave the door open.
-- =============================================================================

create table public.item_categories (
  slug        citext primary key,                        -- 'bed', 'chair', 'rug', 'plant', 'wall-art', 'background', 'food', 'lighting', 'toy', 'seasonal'
  name        text not null,
  sort_order  int  not null default 0,
  is_background boolean not null default false           -- backgrounds are applied to the room, not placed
);

create table public.items (
  id                 uuid primary key default gen_random_uuid(),
  slug               citext not null unique,
  name               text not null,
  description        text,
  category_slug      citext not null references public.item_categories (slug) on update cascade,
  rarity_slug        citext not null references public.rarities (slug) on update cascade default 'common',
  image_url          text,
  placeholder_color  text not null default '#D9C7B8',
  coin_price         int check (coin_price is null or coin_price >= 0),  -- null = not purchasable
  coin_value         int not null default 0,             -- "worth" shown in inventory
  is_shop_available  boolean not null default false,
  is_limited_edition boolean not null default false,
  is_tradeable       boolean not null default false,     -- MVP: always false
  unlock_method      public.acquisition_source not null default 'purchase',
  series_id          uuid references public.series (id) on delete set null,
  collection_tag     text,                               -- free grouping label: 'Bakery Set', 'Halloween 2026'
  width_units        int not null default 2,             -- footprint on the room grid
  height_units       int not null default 2,
  max_per_user       int,                                -- null = unlimited quantity
  shop_starts_at     timestamptz,
  shop_ends_at       timestamptz,
  sort_order         int not null default 0,
  status             public.content_status not null default 'draft',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger items_set_updated_at before update on public.items
  for each row execute function public.set_updated_at();

create index items_shop_idx     on public.items (is_shop_available, status, sort_order);
create index items_category_idx on public.items (category_slug);

-- -----------------------------------------------------------------------------
-- user_inventory: quantity of each item a user owns.
-- -----------------------------------------------------------------------------
create table public.user_inventory (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  item_id           uuid not null references public.items (id) on delete restrict,
  quantity          int  not null default 1 check (quantity >= 0),
  acquired_via      public.acquisition_source not null,
  first_acquired_at timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, item_id)
);

create trigger user_inventory_set_updated_at before update on public.user_inventory
  for each row execute function public.set_updated_at();

create index user_inventory_user_idx on public.user_inventory (user_id);

-- -----------------------------------------------------------------------------
-- rooms: each user has one primary room in the MVP; the model allows more.
-- -----------------------------------------------------------------------------
create table public.rooms (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  name                text not null default 'My Room',
  is_primary          boolean not null default false,
  background_item_id  uuid references public.items (id) on delete set null,
  active_mibbi_id     uuid references public.user_mibbis (id) on delete set null,  -- which Mibbi is "in" the room
  grid_columns        int not null default 12,
  grid_rows           int not null default 8,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint rooms_name_length check (char_length(name) between 1 and 30)
);

create trigger rooms_set_updated_at before update on public.rooms
  for each row execute function public.set_updated_at();

-- Exactly one primary room per user.
create unique index rooms_one_primary_per_user on public.rooms (user_id) where is_primary;
create index rooms_user_idx on public.rooms (user_id);

-- -----------------------------------------------------------------------------
-- room_items: placed furniture/decor. Position is grid-based (no physics).
-- -----------------------------------------------------------------------------
create table public.room_items (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.rooms (id) on delete cascade,
  item_id     uuid not null references public.items (id) on delete cascade,
  grid_x      int not null default 0 check (grid_x >= 0),
  grid_y      int not null default 0 check (grid_y >= 0),
  z_index     int not null default 0,
  flipped     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger room_items_set_updated_at before update on public.room_items
  for each row execute function public.set_updated_at();

create index room_items_room_idx on public.room_items (room_id);

-- A user may only place items they own, and no more copies than they own.
-- Enforced in the DB so no client bug (or client tampering) can bypass it.
create or replace function public.check_room_item_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user   uuid;
  v_owned  int;
  v_placed int;
begin
  select user_id into v_user from public.rooms where id = new.room_id;

  select coalesce(quantity, 0) into v_owned
  from public.user_inventory
  where user_id = v_user and item_id = new.item_id;

  if coalesce(v_owned, 0) = 0 then
    raise exception 'ITEM_NOT_OWNED' using errcode = 'P0001';
  end if;

  select count(*) into v_placed
  from public.room_items ri
  join public.rooms r on r.id = ri.room_id
  where r.user_id = v_user and ri.item_id = new.item_id
    and ri.id is distinct from new.id;

  if v_placed >= v_owned then
    raise exception 'ITEM_QUANTITY_EXCEEDED' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger room_items_check_ownership
  before insert or update of item_id, room_id on public.room_items
  for each row execute function public.check_room_item_ownership();
