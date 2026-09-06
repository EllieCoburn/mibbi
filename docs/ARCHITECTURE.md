# Mibbi — Architecture

This document is the technical map of the Mibbi platform: what we decided, why, and where things live. It is written for the founder first and the next engineer second. Companion documents:

- [DATABASE.md](./DATABASE.md) — every table, function and policy
- [USER_FLOWS.md](./USER_FLOWS.md) — the core journeys, step by step
- [SECURITY.md](./SECURITY.md) — threat model, child-safety and privacy posture
- [ROADMAP.md](./ROADMAP.md) — the eight phases and what "done" means for each

## 1. What we are building

**Mibbi is an interactive, gamified timeline of the story of everything.** Children explore the universe, Earth, life, humanity, civilizations, science, culture and the modern world by moving through time itself. The timeline is the product; the Atlas, Museum, Adventures and the Mibbi companions all open from it and return to it. See [PIVOT.md](./PIVOT.md) for how we got here from the original collectible-world concept.

Every design decision follows from four principles:

1. **The timeline is the product.** If a feature does not improve the timeline or the child's understanding of time, it is secondary.
2. **Time is proportional and spatial.** Never equal-width eras. Every entry has a region and coordinates.
3. **Build systems, not content.** New eras, events, people, adventures and companions are rows, not deploys.
4. **Children may use this.** No chat, no public profiles, no trading, no grades, minimal data, calm engagement.

## 2. Architectural decisions

Each decision is listed with the alternative we rejected and why. Nothing here should change silently; if it needs to, update this file in the same PR.

| #   | Decision                                                                                                                                                    | Alternative rejected                                  | Why                                                                                                                                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Next.js 16 (App Router) + React 19 + TypeScript**, deployed on Vercel                                                                                     | Separate SPA + API server                             | One codebase, server components keep secrets on the server, zero-config on Vercel, easy hand-over.                                                                                                                                                                |
| 2   | **Supabase (Postgres + Auth + Storage)**                                                                                                                    | Custom Node API + Prisma, Firebase                    | Postgres is the right model for a relational collectible system; Row Level Security gives defence-in-depth; Auth is battle-tested so we never store passwords. Firebase's document model fights against "series completion" style queries.                        |
| 3   | **Business rules that move value live in Postgres functions** (`redeem_adoption_code`, `apply_currency_transaction`, `purchase_item`)                       | Rules in TypeScript with a service-role client        | Atomic, transactional, and impossible to bypass from any client. A bug in UI code cannot double-award coins or redeem a code twice. TypeScript orchestrates; SQL decides.                                                                                         |
| 4   | **Adoption codes are stored only as HMAC-SHA256 hashes** with a server-side pepper                                                                          | Plaintext codes in the DB, or encrypted with a DB key | A leaked database is not a leaked pile of free toys. The pepper (`ADOPTION_CODE_PEPPER`) never touches Postgres, so hashes cannot be brute-forced offline even at ~59 bits. Trade-off: codes must be exported at generation time; we cannot re-print a lost list. |
| 5   | **Ledger-first currency** (`currency_transactions` is the truth; `user_balances` is a cache)                                                                | A single `coins` column on profiles                   | Auditable, supports refunds and idempotent retries, makes analytics trivial.                                                                                                                                                                                      |
| 6   | **Admin rights live in `admin_users`, not on the profile**                                                                                                  | `is_admin` boolean on profiles                        | Users can edit their own profile; they must never be able to reach the admin flag. Column-level grants enforce this even if a policy is mis-written.                                                                                                              |
| 7   | **Content is data with a `status` lifecycle** (`draft → active → archived`)                                                                                 | Feature flags in code                                 | Admin can stage a Halloween series in `draft`, see it themselves (admins bypass the `active` filter) and flip it live without a deploy.                                                                                                                           |
| 8   | **Variants, not duplicate characters, for chase/secret editions** (Golden Crumb is a variant of Crumb)                                                      | Golden Crumb as a seventh character                   | Series 01 stays "six Mibbis" for completion; a variant carries its own rarity, art and unlock rules, and ownership records both.                                                                                                                                  |
| 9   | **Physical SKUs are a first-class table** between codes and characters                                                                                      | Codes pointing straight at characters                 | Manufacturing, Shopify and Amazon think in SKUs. A SKU maps to character + variant + series, and later to `shopify_product_id`.                                                                                                                                   |
| 10  | **Requirement engine is data-driven** (`requirement_type` enum + JSON config) used by quests, achievements and location unlocks alike                       | Separate hard-coded checks per feature                | One evaluator, three features. Adding "own three Bakery Mibbis → unlock the game" is a row, not a deploy.                                                                                                                                                         |
| 11  | **2D grid room** (`grid_x`, `grid_y`, `z_index`)                                                                                                            | Free-form pixel coordinates / physics                 | Charming, touch-friendly and trivially responsive. Physics adds nothing to attachment.                                                                                                                                                                            |
| 12  | **No user-to-user trading, ever in the MVP**; `is_tradeable` + per-row inventory keep the option open                                                       | Building trading now                                  | Child-safety and scope. The schema won't need to change if it is ever added under moderation.                                                                                                                                                                     |
| 13  | **Tailwind v4 with a custom token set**, no component library                                                                                               | shadcn/ui, MUI                                        | Generic libraries look generic. Our tokens (cream, chocolate, terracotta, pastel character palette; Fredoka + Nunito) are the brand.                                                                                                                              |
| 14  | **Placeholder art is generated from data** (`MibbiAvatar` draws a blob + personality face from `placeholder_color`, `placeholder_shape`, `personality_key`) | Static placeholder PNGs                               | The site feels alive before final art exists; final art drops in by setting `image_url`.                                                                                                                                                                          |
| 15  | **Mobile-first, app-like shell** (bottom tab bar on phones, rail on desktop)                                                                                | Desktop nav collapsed into a hamburger                | Most adoptions will start from a QR code on a phone.                                                                                                                                                                                                              |
| 16  | **No real-money purchases in the digital world**; no third-party analytics SDK in the MVP                                                                   | Coin packs, GA4                                       | Brief: physical is the revenue engine; privacy-conscious analytics come from our own tables (`activity_log`, `game_scores`, `adoption_attempts`).                                                                                                                 |

| 17 | **One time axis for everything**: `start_year`/`end_year` as doubles, negative = BCE, deep time as large negatives; viewports in "years ago" with linear scale and zoom | Log scale, or per-era sub-timelines | Linear + zoom is what makes scale _felt_: human history is invisibly thin at the universe view until you zoom. A log scale would lie about proportion. |
| 18 | **Level of detail by collision culling** (importance first; overlapping markers fold into a "+n" until there is room) | Hard zoom thresholds per entry | Detail reveals itself naturally as the child zooms, everywhere, with no per-row tuning. `min_span_years` remains as an optional hard gate. |
| 19 | **"What else was happening?" is computed from the same entries** with a tolerance that widens with distance from today (5% of years-ago, min 50 years) | A separate "simultaneity" table | One rule serves the timeline panel, the Atlas and the SQL helper `entries_around_year()`, so they can never disagree. |
| 20 | **Companions are data**: `characters.curiosity_key` matches `timeline_entries.curiosity_key` | Scripted per-character dialogue | Any Mibbi can "notice" any entry with a matching curiosity; adding a companion is a row. |
| 21 | **Invisible assessment in `concept_signals`**, never surfaced as a grade | Score screens, badges for correctness | The brief is explicit: the child should forget they are learning. Signals inform what the world offers next. |

### Things deliberately deferred

- **Shopify**: `product_skus.shopify_product_id/variant_id` and `purchase_url` exist; the sync job does not. Nothing else needs to change to add it.
- **QR scanning**: the QR simply encodes `https://mibbi.com/adopt?code=XXXX-XXXX-XXXX`; the phone's camera app does the scanning. An in-page camera scanner is a Phase 8 nicety.
- **Native app**: the web app is installable as a PWA later (manifest + icons); the layout already respects safe areas.
- **Rate limiting at the edge**: the brute-force limiter lives in the database (cannot be bypassed). An edge limiter (Vercel WAF / Upstash) is an additional layer for Phase 8.

## 3. System overview

```
Browser (phone-first)
   │  HTTPS
   ▼
Vercel ── Next.js 16 ─────────────────────────────────────────────┐
   │  src/proxy.ts        refresh session cookie, gate /home /admin │
   │  Server Components   read via user-scoped Supabase client (RLS)│
   │  Server Actions      validate (zod) → call SQL functions       │
   │  Route Handlers      auth callbacks, future webhooks           │
   └────────────────────────────────────────────────────────────────┘
   │  supabase-js (anon key + user JWT)          service role (admin only)
   ▼
Supabase
   ├─ Auth        email + password, confirmations, resets
   ├─ Postgres    schema in supabase/migrations, RLS on every table,
   │              SECURITY DEFINER functions for value-moving operations
   └─ Storage     character art, item art (Phase 3+)
```

**Trust boundaries.** The browser is untrusted. Server code is trusted but uses the _user's_ session for reads so RLS is always in force. Only admin tooling uses the service role, and only on the server. The database is the final authority on anything that moves value.

## 4. Folder structure

```
mibbi/
├── docs/                          This folder
├── supabase/
│   ├── config.toml                Local Supabase config (auth redirects, email confirmations)
│   ├── migrations/                Ordered SQL migrations — the schema's source of truth
│   │   ├── 20260906000100_foundation.sql    extensions, enums, helpers
│   │   ├── 20260906000200_accounts.sql      profiles, admin_users, audit_logs, activity_log
│   │   ├── 20260906000300_catalog.sql       rarities, series, locations, characters, variants, SKUs
│   │   ├── 20260906000400_adoption.sql      code_batches, adoption_codes, user_mibbis, attempts
│   │   ├── 20260906000500_items_rooms.sql   items, inventory, rooms, room_items
│   │   ├── 20260906000600_economy.sql       currencies, balances, ledger, purchase_item()
│   │   ├── 20260906000700_engagement.sql    games, quests, achievements, daily rewards, events, unlocks
│   │   ├── 20260906000800_rls.sql           every RLS policy and column grant
│   │   └── 20260906000900_redeem.sql        redeem_adoption_code()
│   └── seed.sql                   Demo content: Bakery series, items, quests, dev codes
├── scripts/
│   └── gen-types.mjs              Docker-free TypeScript type generator (pnpm db:types)
├── tests/
│   ├── db/                        SQL integration tests + runner (pnpm db:test)
│   └── unit/                      Vitest unit tests (pnpm test)
├── public/                        Static assets (icon.svg; final art goes to Supabase Storage)
└── src/
    ├── proxy.ts                   Session refresh + route gating (Next 16 "proxy", formerly middleware)
    ├── app/                       Routes (App Router)
    │   ├── layout.tsx             Fonts, metadata, <html>
    │   ├── globals.css            Design tokens (Tailwind v4 @theme)
    │   ├── (marketing)/           Public: /, /mibbis, /mibbis/[slug], /parents, /news, /store
    │   ├── (explore)/             The product: /timeline, /atlas, /museum, /adventures, /adventures/[slug]
    │   ├── (auth)/                /login /signup /forgot-password /reset-password /check-email
    │   ├── auth/                  /auth/callback, /auth/confirm route handlers
    │   ├── (app)/                 Account pages: /adopt /collection /profile (/home and /world redirect)
    │   └── admin/                 Admin dashboard (gated by admin_users)
    ├── components/
    │   ├── ui/                    Button, Card, Field, Badge, Alert, Logo, EmptyState, ComingSoon…
    │   ├── characters/            MibbiAvatar (placeholder art), CharacterCard, RarityBadge
    │   ├── marketing/             Homepage sections
    │   ├── layout/                Public header/footer
    │   ├── app/                   App nav + header
    │   └── auth/                  FormShell / FormField (server-action forms)
    ├── lib/
    │   ├── env/                   Validated env access (public vs server-only)
    │   ├── supabase/              client.ts (browser), server.ts (RSC/actions), admin.ts (service role), proxy.ts
    │   ├── auth/                  zod schemas + server actions (signUp, signIn, signOut, reset, updateProfile)
    │   ├── timeline/              time.ts (viewport + formatting math, tested), lod.ts (marker placement), types.ts, actions.ts
    │   ├── adoption/              Code format, generation, normalisation (codes.ts) and server-only hashing (hash.ts)
    │   ├── data/                  Read models: timeline (entries, regions, adventures, discoveries, companion), characters, profile, admin
    │   ├── content/               Personalities (faces, voice lines), brand copy
    │   ├── routes.ts              Route map + protected-route logic
    │   └── utils/                 cn()
    └── types/
        ├── database.ts            GENERATED from Postgres — never edit by hand
        └── supabase.ts            Tables<>, Enums<> helpers
```

**Rules of the folder structure**

- `app/` contains routing and page composition only. Data fetching goes through `lib/data`, mutations through server actions in `lib/*/actions.ts`.
- Anything importing `server-only` cannot be bundled for the browser; the build fails if it is. Use it for every file touching secrets or the service role.
- Games (Phase 5) go in `src/games/<slug>/` with a shared `src/games/engine/`, registered by slug so the `games` table can point at them.

## 5. Request lifecycle

1. **Proxy** (`src/proxy.ts`) runs on every non-asset request: refreshes the Supabase session cookie, redirects anonymous users away from `/home`, `/admin` etc. (remembering `?next=`), and signed-in users away from `/login`.
2. **Layouts** re-check auth on the server (`getCurrentUser()`), because layouts must never trust the proxy alone. `/admin/layout.tsx` additionally requires an `admin_users` row.
3. **Server Components** read through `lib/data/*` with the user's session. RLS filters rows; drafts are invisible to non-admins.
4. **Server Actions** validate input with zod, then call Supabase. Value-moving actions call a SQL function and return a typed `ActionState` consumed by `useActionState` in the form.
5. **Errors** bubble to `app/error.tsx` (friendly, in brand voice) with a digest for support.

## 6. Data flow for the core mechanic (adoption)

```
Phone camera → /adopt?code=CRUM-BDEV-AAAA
   → server action redeemAdoptionCode(form)        [Phase 2]
       1. normalise + format-check the code (lib/adoption/codes.ts)   — no DB hit for garbage
       2. hash = HMAC(pepper, code)                 (lib/adoption/hash.ts, server-only)
       3. supabase.rpc('redeem_adoption_code', { p_code_hash, p_nickname, p_ip_hash })
          └─ Postgres, single transaction:
               auth check → suspended check → per-user & per-IP failure limits →
               SELECT … FOR UPDATE on the code → status checks → resolve SKU → character/variant →
               INSERT user_mibbis → UPDATE code → log attempt → activity_log → JSON result
       4. map result to UI copy (REDEMPTION_ERRORS) → redirect to the new Mibbi
```

## 7. Environments

| Environment              | Database                                                        | Auth emails           | Codes                                                                         |
| ------------------------ | --------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------- |
| Local                    | `supabase start` (Docker) or any Postgres via `tests/db/run.sh` | Inbucket (local)      | Seeded dev codes, pepper `dev-pepper-change-me`                               |
| Staging (Vercel preview) | Supabase staging project                                        | Real SMTP, test inbox | Test batches only                                                             |
| Production               | Supabase prod project                                           | Real SMTP             | Real batches; pepper generated once and stored in Vercel + a password manager |

## 8. Conventions

- **Migrations are append-only.** Never edit a migration that has been applied anywhere. Add a new one.
- **Types are generated**, not written: `pnpm db:types` (Docker-free) or `pnpm db:types:supabase` (with local Supabase running).
- **Every list has an empty state**, every action has a loading state, every error speaks in the brand voice.
- **Copy lives in `lib/content`**, not inline, once it is reused.
- **Slugs are `citext`** (case-insensitive) and immutable once public; they appear in URLs and QR codes.
