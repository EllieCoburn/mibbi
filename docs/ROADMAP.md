# Mibbi — Roadmap

The timeline is the product. Phases below are ordered by how much they improve the timeline and the child's understanding of time. Each leaves the project runnable and deployable.

## Done

- **Foundation**: Next.js 16, Supabase Auth, schema + RLS, design system, deployment, setup notice (see git history and [ARCHITECTURE.md](./ARCHITECTURE.md)).
- **The pivot** ([PIVOT.md](./PIVOT.md)): timeline data model and seed (~150 entries, 13 regions, 6 adventures), the interactive timeline (proportional zoom/pan, nested era bands, level-of-detail markers, You Are Here, jump chips, entry panel with What/When/Where/Why, _What else was happening?_, _Which came first?_, companions, Add to museum, shareable URLs), the Atlas (time → world, place → history), the Museum (discoveries + nested personal timeline), Adventures (list, runner, physical-Mibbi unlocks), the homepage as a journey through time, and removal of the virtual-pet surfaces.

## Next: Milestone A — Adoption as portals

- `/adopt`: mobile-first code entry calling the tested `redeem_adoption_code()`; success reveals the companion and its adventure.
- `/collection`: the child's Mibbis, each with the adventure it unlocks and a "ride along" switch that sets the timeline companion.
- **Done when:** a seeded dev code unlocks _The Missing Bone_ and Crumb rides along on the timeline.

## Milestone B — Timeline depth

- More play on the timeline: _How far apart?_ (estimate, then see), _What existed together?_ (pick the overlaps), _Place it in time_ (drag a museum card onto the axis).
- Entry relations shown as gentle threads (led to / overlapped) when an entry is open.
- Age bands: a parent-area switch that reveals `age_band` 2–4 detail; default shows band 1 + 2.
- Content growth to ~400 entries with balanced regions; second seed file per region.
- **Done when:** a child can play three different games without leaving the timeline, and every region has at least 20 entries.

## Milestone C — Atlas depth

- Illustrated map layers per era (ice sheets, Pangaea, empires as soft regions) keyed by year ranges.
- Region history strips (mini timeline per region) and "same moment" comparison of two regions.
- **Done when:** choosing 1200 and 1500 visibly changes the map, not just the pins.

## Milestone D — Companions and adventures

- Companion reactions driven by `concept_signals` (a Mibbi offers the next experience when a concept wobbles).
- Adventure authoring in the admin; branching steps; rewards that are museum exhibits, never scores.
- **Done when:** an adventure can be written in the admin and played the same day.

## Milestone E — Admin CMS for the story

- CRUD for entries, regions, relations, adventures, companions; bulk import from CSV; preview in the timeline before publishing.
- Code generation and support tools (already designed in the schema).
- Analytics: which eras are explored, which concepts wobble, which adventures finish. No per-child grades.
- **Done when:** the founder can publish a new era without a developer.

## Milestone F — Polish and launch

- Accessibility audit (keyboard timeline, screen-reader summaries, reduced motion), performance budget, PWA install.
- Privacy and legal review for children, account deletion, parent area.
- Final illustration swapped in layer by layer (journey scene, world map, companions).
- **Done when:** the launch checklist in [SECURITY.md](./SECURITY.md) is complete.
