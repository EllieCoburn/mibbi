# Mibbi — Database

Postgres on Supabase. Source of truth is `supabase/migrations/*.sql`, applied in filename order. This page explains the model; the SQL has the details and inline comments.

Run `pnpm db:test` to apply every migration + seed to a scratch database and execute the SQL integration tests (no Docker needed; any Postgres 16 works).

## Entity map

```
auth.users ──1:1── profiles            admin_users (separate; membership = admin)
    │                                   audit_logs (admin/system actions)
    │                                   activity_log (user-visible feed)
    │
    ├──< user_mibbis >── characters ──< character_variants
    │        │               │  ▲
    │        │               │  └── series_characters >── series
    │        │               └── home_location → locations ──< location_unlocks
    │        └── adoption_codes ── product_skus ── (character, variant, series, shopify ids)
    │                 └── code_batches
    │
    ├──< user_inventory >── items ── item_categories
    ├──< rooms ──< room_items → items
    │
    ├──  user_balances ── currencies
    ├──< currency_transactions
    │
    ├──< game_scores → games
    ├──< user_quests → quests → (events, series, items)
    ├──< user_achievements → achievements
    ├──< user_daily_claims → daily_rewards
    └──< user_location_visits → locations
```

## Tables by migration

### 0100 Foundation

Enums (fixed sets the code depends on):

- `content_status` draft | active | archived — lifecycle of every admin-managed row
- `code_status` active | redeemed | disabled
- `account_status` active | suspended
- `admin_role` owner | admin | support
- `acquisition_source` purchase | quest | adoption | series_completion | event | achievement | daily_reward | game | promo | admin | starter
- `location_link_type` none | game | shop | quest | character | event | page
- `requirement_type` the vocabulary of the requirement engine (see below)
- `repeat_interval` none | daily | weekly
- `user_quest_status` active | completed | claimed

Helpers: `set_updated_at()` trigger.

### 0200 Accounts

| Table          | Purpose                         | Notes                                                                                                                                                                                                                                                 |
| -------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`     | Public-facing account data      | 1:1 with `auth.users`. Only `display_name`, `avatar_key`, `onboarding_completed_at`, `last_seen_at` are user-updatable (column grants). `status` is admin-only. Display names are validated by CHECK constraint (2–20 chars, letters/numbers/spaces). |
| `admin_users`  | Who is an admin, and their role | Deliberately not a column on profiles. Only owners (or service role) can insert.                                                                                                                                                                      |
| `audit_logs`   | Important admin/system actions  | Written via `write_audit_log()`. Admin-readable only.                                                                                                                                                                                                 |
| `activity_log` | "Recent activity" feed          | Written by SQL functions in brand voice. User reads own.                                                                                                                                                                                              |

Functions: `is_admin()`, `has_admin_role(role)` (owner > admin > support), `write_audit_log()`, `handle_new_user()` (trigger on `auth.users` insert → creates profile, zero coin balance, primary room).

### 0300 Catalog (admin-managed content)

| Table                | Purpose                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `rarities`           | Configurable rarity tiers with colour and marketing odds label. Seeded: common, uncommon, rare, chase, secret.                  |
| `series`             | A wave of characters (S01 The Bakery). Holds completion rewards (`completion_reward_item_id`, `completion_unlock_location_id`). |
| `locations`          | World-map nodes with `map_x/map_y` (percent) and what clicking them opens.                                                      |
| `characters`         | The product. Personality, copy, art URLs, placeholder colour/shape for generated art, rarity, status.                           |
| `character_variants` | Alternate editions (Golden Crumb). Own rarity/art/status; inherits personality.                                                 |
| `series_characters`  | Membership + `required_for_completion`. A character can appear in several series.                                               |
| `product_skus`       | Physical products. `sku` → character (+variant, series). Shopify IDs and `purchase_url` for later integration.                  |

### 0400 Adoption

| Table               | Purpose                                                                                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `code_batches`      | One row per manufacturing run. `exported_at` records when plaintext was handed to the factory.                                                                                                              |
| `adoption_codes`    | One row per printed code. Stores `code_hash` (HMAC-SHA256 hex, unique) and `code_hint` (last 4 chars, for support). Never plaintext. Status + redemption columns are kept consistent by a CHECK constraint. |
| `user_mibbis`       | A Mibbi someone owns. `adoption_code_id` is unique (one code → one Mibbi). Nullable only for admin-granted replacements. Users may update `nickname` and `is_favorite` only.                                |
| `adoption_attempts` | Every attempt, with result and hashed IP. Feeds the brute-force limiter and support.                                                                                                                        |

### 0500 Items & rooms

| Table             | Purpose                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `item_categories` | Configurable categories; `is_background` marks room backgrounds.                                                                                                                            |
| `items`           | Digital items: price (null = not purchasable), shop availability window, limited edition, `is_tradeable` (always false for now), footprint on the room grid, `max_per_user`, unlock method. |
| `user_inventory`  | Quantity per user per item. Written only by `grant_item()`.                                                                                                                                 |
| `rooms`           | One primary room per user (partial unique index). `active_mibbi_id` = who is in the room; `background_item_id`.                                                                             |
| `room_items`      | Placed items on a grid. Trigger `check_room_item_ownership()` prevents placing items you don't own or more copies than you own, regardless of client behaviour.                             |

### 0600 Economy

| Table                   | Purpose                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `currencies`            | `coins` = Mibbi Coins. Multi-currency ready.                     |
| `user_balances`         | Cached balance (CHECK ≥ 0) + lifetime earned/spent.              |
| `currency_transactions` | Immutable ledger. `idempotency_key` (unique) makes retries safe. |

Functions:

- `apply_currency_transaction(user, amount, source, ref_type, ref_id, note, idempotency_key, currency)` → new balance. Locks the balance row, refuses overdrafts (`INSUFFICIENT_FUNDS`), replays idempotently. **Not callable by users**; only by other definer functions / service role.
- `grant_item(user, item, qty, source)` — upserts inventory. Not user-callable.
- `purchase_item(item, qty)` — user-callable. Checks availability window, per-user limit, spends coins, grants item, writes activity. Atomic.

### 0700 Engagement

| Table                  | Purpose                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `games`                | Registry of mini-games (looked up by slug in code). Payout tuning: `coins_per_point`, `max_coins_per_play`, `max_coins_per_day`, `min_play_seconds`. |
| `game_scores`          | One row per play. High score and daily participation are derived.                                                                                    |
| `events`               | Seasonal campaigns with a date window and JSON config.                                                                                               |
| `quests`               | Requirement (type + JSON config + target), rewards, optional giver character, series/event scope, repeat interval, active window.                    |
| `user_quests`          | Progress per user per quest per `period_key` (`once`, `2026-09-06`, `2026-W36`).                                                                     |
| `achievements`         | Same requirement engine; `is_secret` hides until earned.                                                                                             |
| `user_achievements`    | Earned set.                                                                                                                                          |
| `daily_rewards`        | Ladder by `day_index`.                                                                                                                               |
| `user_daily_claims`    | One claim per user per day with streak.                                                                                                              |
| `location_unlocks`     | Tiered rules per location. Physical ownership → digital unlock.                                                                                      |
| `user_location_visits` | First/last visit + count (World Traveler).                                                                                                           |

View: `user_series_progress` (security_invoker) — owned vs required characters per series for the caller.

### 0800 Row Level Security

Every table has RLS enabled. Pattern:

- **Catalog tables** (series, locations, characters, variants, items, games, events, quests, achievements, daily_rewards): anyone reads `status = 'active'`; admins read everything; `admin` role writes.
- **User tables**: `user_id = auth.uid()` (or admin) to read. Users can write only: profile cosmetic columns, `user_mibbis.nickname/is_favorite`, their own `rooms` and `room_items`. Everything else is written by SECURITY DEFINER functions.
- **Codes, batches, attempts, audit logs**: admin only.
- **Service role** bypasses RLS and is used only by server-side admin tooling.

### 0900 Redemption

`redeem_adoption_code(p_code_hash, p_nickname, p_ip_hash)` → jsonb. Single transaction:

1. Requires `auth.uid()`; refuses suspended profiles.
2. Rate limit: ≥10 failed attempts per user per hour, or ≥30 per IP hash per hour → `rate_limited` (a valid code is refused too, so guessing cannot continue).
3. `SELECT … FOR UPDATE` the code by hash. Missing → `invalid`. Redeemed → `already_redeemed` / `already_yours`. Disabled → `disabled`.
4. Resolves SKU → character (+variant); inactive content → `unavailable`.
5. Inserts `user_mibbis`, marks the code redeemed, logs the attempt and an activity line, puts a first Mibbi into the room.
6. Returns `{ ok, user_mibbi_id, character_slug, variant_slug, display_name, rarity_slug, is_first, owned_count, … }`.

## The requirement engine

Quests, achievements and location unlocks all describe _what must be true_ with `requirement_type` + `requirement_config` + `target_count`:

| type                                 | config                                 | meaning                                         |
| ------------------------------------ | -------------------------------------- | ----------------------------------------------- |
| `adopt_count`                        | —                                      | own N Mibbis                                    |
| `adopt_character`                    | `{character_slug}` or `{variant_slug}` | own a specific one                              |
| `adopt_rarity`                       | `{rarity_slug}` or `{min_rarity_sort}` | own one at least this rare                      |
| `series_owned_count`                 | `{series_slug}`                        | own N distinct required characters in a series  |
| `series_complete`                    | `{series_slug}`                        | own all required characters                     |
| `play_game_count`                    | `{game_slug?}`                         | play N times                                    |
| `game_score`                         | `{game_slug, score}`                   | reach a score                                   |
| `earn_coins` / `spend_coins`         | `{amount}`                             | lifetime totals                                 |
| `room_items_placed`                  | —                                      | items placed in any room                        |
| `login_days` / `login_streak`        | —                                      | distinct days / streak                          |
| `visit_locations` / `visit_location` | — / `{location_slug}`                  | world map visits                                |
| `feed_mibbi`                         | —                                      | feed actions                                    |
| `own_items`                          | —                                      | distinct items owned                            |
| `custom`                             | `{hook}`                               | named evaluator in code, for the rare exception |

The evaluator (`src/lib/progress`, Phase 4) recomputes progress from source tables, so it is always correct and never drifts.

## Adoption codes: lifecycle

```
admin generates batch ──► plaintext CSV exported once (exported_at set)
        │                          │
        ▼                          ▼
adoption_codes(code_hash, hint)   printed on cards inside packaging
        │
        ▼ user enters code → HMAC on server → redeem_adoption_code()
   status: active ─► redeemed (redeemed_by, redeemed_at, user_mibbis row)
        └──────────► disabled (compromised batch, admin action, audited)
```

Code format: 12 characters from `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (no 0/O/1/I/L), displayed `XXXX-XXXX-XXXX`. See `src/lib/adoption/codes.ts`.

## Working with the schema

```bash
pnpm db:test            # apply everything to a scratch DB + run SQL tests (needs a local Postgres)
pnpm db:types           # regenerate src/types/database.ts from DATABASE_URL (no Docker)
pnpm supabase:start     # full local Supabase (needs Docker) — applies migrations + seed
pnpm supabase:reset     # wipe + re-apply
pnpm dlx supabase db push        # apply new migrations to the linked remote project
```

Seed demo codes (only valid with `ADOPTION_CODE_PEPPER=dev-pepper-change-me`):

| Code                               | Unlocks                       |
| ---------------------------------- | ----------------------------- |
| `CRUM-BDEV-AAAA`, `CRUM-BDEV-BBBB` | Crumb                         |
| `MOCH-DEV2-AAAA`                   | Mochi                         |
| `TOAS-TDEV-AAAA`                   | Toast                         |
| `PEAC-HDEV-AAAA`                   | Peach                         |
| `PCKL-DEV2-AAAA`                   | Pickle                        |
| `BTTR-DEV2-AAAA`                   | Butter                        |
| `GCRM-BDEV-AAAA`                   | Golden Crumb (secret variant) |
