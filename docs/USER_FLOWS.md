# Mibbi — Core user flows

Each flow lists the screens, the server work behind them, and the failure paths. Phase numbers refer to [ROADMAP.md](./ROADMAP.md).

## 1. Discover → Adopt (the business mechanic)

`BUY → OPEN → SCAN → ADOPT → NAME → PLAY → COLLECT → RETURN`

| Step         | Screen                                                                  | Behind the scenes                                                                       |
| ------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Buy          | Retail / Amazon / Shopify                                               | Packaging CTA: _"Your Mibbi has a secret life. Adopt yours at mibbi.com."_              |
| Open         | Card with QR + printed code                                             | QR encodes `https://mibbi.com/adopt?code=XXXX-XXXX-XXXX`                                |
| Scan         | `/adopt` (Phase 2), code pre-filled from the URL                        | Proxy sends anonymous users to `/login?next=/adopt?code=…` so the code survives sign-up |
| Sign up / in | `/signup`, `/login` (Phase 1 ✅)                                        | Supabase Auth; profile + room + balance created by DB trigger                           |
| Adopt        | `/adopt` — one big input, auto-formats as you type, works one-handed    | Server action → `redeem_adoption_code()`                                                |
| Name         | Same screen after success: "You found someone new." → optional nickname | Nickname validated (1–20 chars); stored on `user_mibbis`                                |
| Play         | `/home` — the Mibbi is in the room with a personality line              | `rooms.active_mibbi_id` set on first adoption                                           |
| Collect      | `/collection` shows owned + silhouettes + series %                      | `user_series_progress` view                                                             |
| Return       | Daily gift, quests, moods (Phase 4)                                     |                                                                                         |

**Failure paths** (all copy in `REDEMPTION_ERRORS`): wrong format (caught before the DB), unknown code, already redeemed (by you / by someone else), disabled, rate-limited, character not yet released, account suspended.

## 2. Sign up (Phase 1 ✅)

1. `/signup`: display name, guardian email, password (≥10 chars), guardian checkbox.
2. Server action validates with zod → `supabase.auth.signUp` with `display_name` in user metadata.
3. Redirect to `/check-email`. Supabase sends a confirmation link to `/auth/callback?code=…` (PKCE) or `/auth/confirm?token_hash=…`.
4. Link exchanges for a session → `/home`. The `handle_new_user()` trigger has already created profile, balance and room.

Errors: invalid name (reserved words, characters), existing email ("try signing in"), weak password, rate limits. Messages are friendly and never leak whether an email exists beyond what Supabase itself reveals.

## 3. Sign in / out / reset (Phase 1 ✅)

- `/login` → `signInWithPassword` → `?next=` honoured only for same-origin paths (`safeNextPath`).
- Sign out from `/profile` → clears cookies → `/`.
- `/forgot-password` always reports success (no account enumeration) → email → `/auth/callback?next=/reset-password` → `/reset-password` (requires the recovery session) → `updateUser({password})` → `/home?updated=password`.

## 4. Home / room (Phase 1 shell ✅, Phase 3 full)

- Header: coin balance, admin link (admins only), profile avatar.
- Room: active Mibbi with a daily personality line; empty state invites adoption.
- Stats: Mibbis, coins, quests. Recent activity from `activity_log`.
- Phase 3: place/move/remove owned items on the grid, change background, switch active Mibbi, feed/play interactions.

## 5. Collection (Phase 2)

- Tabs: All · by Series · Rares. Owned cards in colour, missing as silhouettes.
- Per series: `owned/total` and a progress ring; completion triggers the reward (item + location unlock) once.
- Tap a Mibbi → its page: nickname (editable), personality, traits, adopted date, rarity, unlocked items/achievements.
- "Missing one?" → `product_skus.purchase_url` when set (Shopify later).

## 6. Economy loop (Phase 4)

Earn: daily gift (`claim_daily_reward()`), quests (`claim_quest_reward()`), game payouts (`record_game_score()` — capped per play and per day), achievements.
Spend: `/shop` → `purchase_item()` → `/inventory` → place in room.
Every change is a `currency_transactions` row; the UI reads `user_balances`.

## 7. World (Phase 6)

`/world` renders `locations` on the illustrated map. Each location's tiers come from `location_unlocks`; the evaluator returns the highest unlocked tier for the user. Locked tiers show what unlocks them ("Own 3 Bakery Mibbis"). Visiting records `user_location_visits`.

## 8. Admin (Phase 1 gate ✅, Phase 7 tools)

- `/admin` requires an `admin_users` row (checked server-side; non-admins are redirected, not shown a 403).
- Phase 7: CRUD for characters, series, items, quests, achievements, locations; code generation → CSV export (plaintext shown once); code search by hash of a customer-supplied code; disable codes; user lookup, suspend; analytics. All mutations write `audit_logs`.
