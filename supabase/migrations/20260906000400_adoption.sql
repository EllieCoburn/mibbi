-- =============================================================================
-- 0400 ADOPTION
-- The physical → digital bridge. Adoption codes are treated as assets:
-- only an HMAC hash of each code is stored, redemption is a single atomic
-- SECURITY DEFINER function (0900), and every attempt is logged for
-- rate limiting and support.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- code_batches: one row per manufacturing run / export.
-- -----------------------------------------------------------------------------
create table public.code_batches (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,                            -- 'S01 Crumb – Run 1 – Sep 2026'
  sku_id       uuid not null references public.product_skus (id) on delete restrict,
  quantity     int  not null check (quantity > 0),
  notes        text,
  created_by   uuid references auth.users (id) on delete set null,
  exported_at  timestamptz,                              -- plaintext CSV handed to manufacturer
  created_at   timestamptz not null default now()
);

create index code_batches_sku_idx on public.code_batches (sku_id);

-- -----------------------------------------------------------------------------
-- adoption_codes: one row per printed code. Plaintext is NEVER stored.
-- code_hash = hex(HMAC-SHA256(pepper, normalized_code)); pepper lives only in
-- server env (ADOPTION_CODE_PEPPER), so a leaked table is not a leaked code list.
-- -----------------------------------------------------------------------------
create table public.adoption_codes (
  id              uuid primary key default gen_random_uuid(),
  code_hash       text not null unique,
  code_hint       text not null,                         -- last 4 chars, for support conversations only
  batch_id        uuid references public.code_batches (id) on delete set null,
  sku_id          uuid not null references public.product_skus (id) on delete restrict,
  status          public.code_status not null default 'active',
  redeemed_by     uuid references auth.users (id) on delete set null,
  redeemed_at     timestamptz,
  disabled_at     timestamptz,
  disabled_reason text,
  created_at      timestamptz not null default now(),
  constraint adoption_codes_hash_format check (code_hash ~ '^[0-9a-f]{64}$'),
  constraint adoption_codes_redeemed_consistent check (
    (status = 'redeemed') = (redeemed_by is not null and redeemed_at is not null)
  )
);

create index adoption_codes_sku_status_idx on public.adoption_codes (sku_id, status);
create index adoption_codes_batch_idx      on public.adoption_codes (batch_id);
create index adoption_codes_redeemed_by_idx on public.adoption_codes (redeemed_by) where redeemed_by is not null;

-- -----------------------------------------------------------------------------
-- user_mibbis: the digital counterpart a user owns. One row per adopted code.
-- -----------------------------------------------------------------------------
create table public.user_mibbis (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  character_id     uuid not null references public.characters (id) on delete restrict,
  variant_id       uuid references public.character_variants (id) on delete restrict,
  adoption_code_id uuid unique references public.adoption_codes (id) on delete set null,
  nickname         text,
  is_favorite      boolean not null default false,
  mood             text not null default 'content',      -- daily mood, set by system
  last_fed_at      timestamptz,
  last_played_at   timestamptz,
  adopted_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint user_mibbis_nickname_length  check (nickname is null or char_length(nickname) between 1 and 20),
  constraint user_mibbis_nickname_charset check (nickname is null or nickname ~ '^[A-Za-z0-9][A-Za-z0-9 ''\-]*$')
);

create trigger user_mibbis_set_updated_at before update on public.user_mibbis
  for each row execute function public.set_updated_at();

create index user_mibbis_user_idx      on public.user_mibbis (user_id, adopted_at desc);
create index user_mibbis_character_idx on public.user_mibbis (character_id);

comment on column public.user_mibbis.adoption_code_id is
  'Null only for Mibbis granted by admins/support (e.g. replacement for a damaged code).';

-- -----------------------------------------------------------------------------
-- adoption_attempts: every redemption attempt, success or not. Drives the
-- brute-force limiter inside redeem_adoption_code() and support lookups.
-- -----------------------------------------------------------------------------
create table public.adoption_attempts (
  id            bigint generated always as identity primary key,
  user_id       uuid references auth.users (id) on delete set null,
  ip_hash       text,                                    -- sha256 of IP, never the raw IP
  result        text not null,                           -- 'success' | 'invalid' | 'already_redeemed' | 'disabled' | 'rate_limited' | 'inactive_character' | 'suspended'
  code_id       uuid references public.adoption_codes (id) on delete set null,
  attempted_at  timestamptz not null default now()
);

create index adoption_attempts_user_time_idx on public.adoption_attempts (user_id, attempted_at desc);
create index adoption_attempts_ip_time_idx   on public.adoption_attempts (ip_hash, attempted_at desc) where ip_hash is not null;
