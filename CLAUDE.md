@AGENTS.md

# Mibbi — working notes for AI assistants and new engineers

- Read `docs/ARCHITECTURE.md` before changing structure. Decisions there are deliberate; update the doc in the same change if one must change.
- Schema lives in `supabase/migrations`. Never edit an applied migration; add a new one. Run `pnpm db:test` after any SQL change (needs a local Postgres; see README).
- `src/types/database.ts` is generated (`pnpm db:types`). Do not hand-edit.
- Anything that moves value (codes, coins, items, ownership) goes through a SQL function, not a direct table write.
- Child safety is a hard constraint: no chat, DMs, public profiles, trading or free-text visible to other users.
- Voice: warm, slightly weird, never corporate or babyish. Copy lives in `src/lib/content`.
- Verify with `pnpm lint && pnpm typecheck && pnpm test && pnpm build` before committing.
