# Mibbi

**Explore the story of everything.** Mibbi is an interactive, gamified timeline from the first stars to right now. Children explore the universe, Earth, life, people, ideas and inventions by moving through time itself, with collectible Mibbi companions riding along. Physical Mibbis are portals that unlock adventures.

This repository is the web platform: the timeline, the Atlas, the Museum, Adventures, accounts, adoption codes and the admin dashboard.

- **Docs:** [Pivot audit](docs/PIVOT.md) · [Architecture](docs/ARCHITECTURE.md) · [Database](docs/DATABASE.md) · [User flows](docs/USER_FLOWS.md) · [Security & child safety](docs/SECURITY.md) · [Roadmap](docs/ROADMAP.md)
- **Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage) · Vercel

## Getting started

### 1. Prerequisites

- Node 20.9+ (22 recommended) and [pnpm](https://pnpm.io) (`corepack enable`)
- A Supabase project (free tier is fine) **or** Docker for a fully local Supabase
- For the SQL test-suite without Docker: any local Postgres 16 with `pgcrypto`

### 2. Install

```bash
pnpm install
cp .env.example .env.local
```

Fill `.env.local` with your Supabase URL and anon key (Project Settings → API). Keep `ADOPTION_CODE_PEPPER=dev-pepper-change-me` locally so the seeded demo codes work.

### 3. Database

**Option A — hosted Supabase project**

```bash
pnpm dlx supabase login
pnpm dlx supabase link --project-ref <your-project-ref>
pnpm dlx supabase db push          # applies supabase/migrations
psql "$SUPABASE_DB_URL" -f supabase/seed.sql            # companions, items, demo codes
psql "$SUPABASE_DB_URL" -f supabase/seeds/01-timeline.sql  # the story of everything (~150 entries)
```

**Option B — local Supabase (Docker)**

```bash
pnpm supabase:start                 # applies migrations + seed, prints local URL/keys
```

Put the printed URL and anon key in `.env.local`.

Then, in Supabase Auth settings, confirm the Site URL is your app URL and add `http://localhost:3000/**` to redirect URLs (already set for local in `supabase/config.toml`).

### 4. Run

```bash
pnpm dev                            # http://localhost:3000
```

### 5. Make yourself an admin

After signing up and confirming your email, run in the SQL editor:

```sql
insert into public.admin_users (user_id, role)
select id, 'owner' from auth.users where email = 'you@example.com';
```

`/admin` will now be available.

### 6. Try adoption (from Phase 2)

Seeded codes such as `CRUM-BDEV-AAAA` redeem Crumb. The full list is in [docs/DATABASE.md](docs/DATABASE.md#working-with-the-schema).

## Scripts

| Command                                  | What it does                                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js                                                                                                                                                |
| `pnpm lint`                              | ESLint                                                                                                                                                 |
| `pnpm typecheck`                         | Generates route types, then `tsc --noEmit`                                                                                                             |
| `pnpm test`                              | Vitest unit tests                                                                                                                                      |
| `pnpm db:test`                           | Applies migrations + seed to a scratch Postgres and runs SQL integration tests (`DATABASE_URL`, default `postgres://postgres@localhost:5432/postgres`) |
| `pnpm db:types`                          | Regenerates `src/types/database.ts` from `DATABASE_URL` without Docker                                                                                 |
| `pnpm db:types:supabase`                 | Same, via the Supabase CLI against a running local stack                                                                                               |
| `pnpm check`                             | lint + typecheck + unit + db tests                                                                                                                     |
| `pnpm format`                            | Prettier                                                                                                                                               |

## Project layout (short version)

```
supabase/migrations   schema, RLS, SQL functions (source of truth)
supabase/seed.sql     demo characters, items, quests, dev codes
src/app               routes: (marketing) (auth) (app) admin
src/components        ui · characters · marketing · layout · app · auth
src/lib               env · supabase · auth · adoption · data · content · routes
src/types             generated database types + helpers
tests/db, tests/unit  SQL integration tests, Vitest
docs/                 architecture, database, flows, security, roadmap
```

Full tree and rationale: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Deploying to Vercel

1. Import the repo; framework preset is detected automatically.
2. Set the environment variables from `.env.example` (generate a strong `ADOPTION_CODE_PEPPER` for production and store it safely; changing it invalidates every printed code).
3. Set `NEXT_PUBLIC_SITE_URL` to the production URL and add it to Supabase Auth redirect URLs.

## Status

Phase 1 (Foundation) is complete. See [docs/ROADMAP.md](docs/ROADMAP.md) for what comes next.
