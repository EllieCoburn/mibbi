# Mibbi — Roadmap

Eight phases. Each leaves the project runnable and deployable. "Done" is defined per phase so nothing is half-built.

## Phase 1 — Foundation ✅ (this milestone)

- [x] Next.js 16 + TypeScript + Tailwind v4 project with pnpm
- [x] Design tokens, typography, core UI components, generated placeholder character art
- [x] Full relational schema (9 migrations), RLS, SQL functions, seed data
- [x] Docker-free SQL test runner + type generator; 2 SQL suites, 17 unit tests
- [x] Supabase Auth: sign-up, confirmation, sign-in, sign-out, password reset, profile edit
- [x] Session proxy, protected routes, admin gate
- [x] Public homepage, Meet the Mibbis, character pages, parent information
- [x] Signed-in shell with app navigation; placeholder pages for every core route
- [x] Documentation: architecture, database, flows, security, roadmap, README

## Phase 2 — Adoption

- `/adopt`: mobile-first code entry with auto-formatting, `?code=` prefill, server action calling `redeem_adoption_code()`
- Success ceremony: reveal animation, naming, "go to your room"
- `/collection`: owned + silhouettes, per-series progress, rarity filter
- `/collection/[id]`: individual Mibbi page with nickname editing
- Series-completion rewards (item + location unlock) applied once, idempotently
- Vitest integration tests against a local Supabase for the server action
- **Done when:** a seeded dev code can be scanned on a phone, adopted, named and seen in the collection; duplicate/invalid codes show the right message.

## Phase 3 — Character experience

- Room editor: grid placement, move/remove, backgrounds, switch active Mibbi, save
- Inventory page with categories
- Feed / play interactions (cooldowns, mood, activity lines)
- Supabase Storage buckets + upload path for final artwork; `image_url` swap
- **Done when:** a user can decorate their room on a phone and it persists.

## Phase 4 — Engagement

- Progress evaluator for the requirement engine (`src/lib/progress`)
- Quests list, progress, claim; daily/weekly resets by `period_key`
- Daily gift + streak (`claim_daily_reward()`)
- Achievements with rewards and secret entries
- Shop with rotating availability windows; purchase flow using `purchase_item()`
- **Done when:** a new user can earn coins, complete a quest and buy an item without touching real money.

## Phase 5 — Gameplay

- `src/games/engine`: loop, input (touch + keyboard), scoring, result submission
- Bakery Catch (first game), `record_game_score()` with per-play/day caps and minimum duration
- High scores, daily participation, game achievements
- **Done when:** Bakery Catch is playable on a phone and pays out coins within caps.

## Phase 6 — World

- Illustrated map with location pins (already positioned by `map_x/map_y`)
- Location pages, tier unlock display, visit tracking
- Physical → digital unlock rules live (Bakery tiers 1–4)
- **Done when:** owning three Bakery Mibbis visibly unlocks the Bakery game on the map.

## Phase 7 — Admin

- CMS for characters, variants, series, locations, items, quests, achievements, events
- Code generation: batch → plaintext CSV (shown once) → hashes stored; disable; search by customer-supplied code; redemption history
- User lookup, collection view, suspend; manual grants (audited)
- Analytics: totals, actives, redemptions, most-owned, most-played, quest/series completion, retention
- Role-aware UI (owner/admin/support)
- **Done when:** the founder can launch Series 02 end-to-end without a developer.

## Phase 8 — Polish & launch

- Accessibility audit (keyboard, screen reader, reduced motion), performance budget, image optimisation
- Edge rate limiting, security review of policies, dependency audit
- Account deletion, privacy policy links, legal review sign-off
- Error monitoring, uptime checks, backups verified
- Shopify catalogue sync (optional): SKUs ↔ products, "buy the missing one"
- PWA manifest, install prompt
- **Done when:** the launch checklist in SECURITY.md is complete.
