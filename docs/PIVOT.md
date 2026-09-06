# Mibbi pivot: from collectible world to the story of everything

**New product statement.** Mibbi is an interactive, gamified timeline of the story of everything. Children explore the universe, Earth, life, humanity, civilizations, science, culture and the modern world by moving through time itself. The timeline is the product.

This document is the audit that preceded the restructure: what existed, what we kept, what we retired, and what is new. Architecture details live in [ARCHITECTURE.md](./ARCHITECTURE.md); the schema in [DATABASE.md](./DATABASE.md).

## 1. What existed before the pivot

| Area                                                                                                           | State                                             | Verdict                                                                                             |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Next.js 16 + TypeScript + Tailwind v4 project, Vercel deploy, env handling, setup notice                       | Working, deployed                                 | **Preserve**                                                                                        |
| Supabase Auth: sign-up, confirmation, sign-in, reset, profile; proxy + route gating; admin gate                | Working                                           | **Preserve**                                                                                        |
| Design tokens (cream / chocolate / terracotta / pastels), Fredoka + Nunito, ToyButton, chunky panels, stickers | Working, on brand                                 | **Preserve**                                                                                        |
| `MibbiAvatar` data-driven placeholder art with personality faces                                               | Working                                           | **Preserve** (companions)                                                                           |
| Illustrated `WorldScene`, `DestinationTile`, homepage sections                                                 | Working                                           | **Repurpose**: scene primitives reused in the journey hero; tiles retired                           |
| Characters, variants, series, rarities, SKUs; adoption codes with HMAC hashing; `redeem_adoption_code()`       | Working, tested                                   | **Preserve**: physical Mibbis become portals that unlock adventures                                 |
| Coin economy, shop, inventory, rooms, room items, games, quests, daily rewards, location unlocks               | Schema + SQL functions only; UI were placeholders | **Dormant**: tables stay (cosmetics and rewards may return), UI and navigation removed              |
| `/home` room with the active Mibbi, bottom tab bar (Home / Collection / Adopt / Map / Quests)                  | Working shell                                     | **Remove**: virtual-pet framing. `/home` now goes to the timeline                                   |
| `/world` illustrated map hub                                                                                   | Placeholder                                       | **Repurpose** → `/atlas` (time and place together)                                                  |
| `/store`, `/news` public pages, bulletin content                                                               | Working                                           | **Reduce**: store demoted to footer as "Collectibles"; bulletin re-written as news from inside time |
| Admin overview, audit logs                                                                                     | Working                                           | **Preserve** (timeline content CMS is the next admin milestone)                                     |

## 2. What is old-concept and why it went

- **The room, coins, shop, inventory, quests, games nav.** These made Mibbi read as a virtual pet with a store. They were not deleted from the database, because rewards and cosmetics could return as museum decorations, but nothing in the UI points at them.
- **"Enter Mibbi World" as the only door.** It implied a place to hang out. The door is now the timeline.
- **Location unlock tiers and the map-as-hub.** Geography now lives inside the Atlas as another view of the timeline, not as a separate hub.

## 3. What was repurposed

- **Mibbis → companions with curiosities.** Each character now carries a `curiosity_key`: fossil, sprout, wonder, story, maker, muse, explorer. Timeline entries carry the same key, so different Mibbis "notice" different things in the same era.
- **Adoption codes → portals.** Owning a physical Mibbi unlocks that companion's adventures (for example Crumb unlocks _The Missing Bone_). The redemption path is unchanged.
- **Collection → Museum memory.** The collection page remains the list of Mibbis; the Museum is the child's growing record of discoveries, every one anchored on the timeline.
- **Bulletin → dispatches from time.** Same component, new voice.

## 4. New core systems

| System                       | What it is                                                                                                                                                                                                   | Where                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| **The Mibbi Timeline**       | Proportional, zoomable, draggable timeline from 13.8 billion years ago to today. Nested era bands, level-of-detail markers, a scale bar, jump chips and a permanent _You are here_.                          | `/timeline`, `src/components/timeline`, `src/lib/timeline` |
| **What else was happening?** | From any entry, widen the view to the same moment everywhere else, grouped by region. Also opens the Atlas at that year.                                                                                     | Timeline detail panel                                      |
| **Mibbi Atlas**              | Pick a year and see the world at that moment; pick a place and move through its history. Built on the same entries.                                                                                          | `/atlas`                                                   |
| **Mibbi Museum**             | Personal discoveries with What / When / Where / Why it matters, each with a place on a personal timeline. Grows as the child explores.                                                                       | `/museum`                                                  |
| **Mibbi Adventures**         | Story-driven expeditions that start at a point in time and move the child through the timeline with a companion. Some are unlocked by physical Mibbis.                                                       | `/adventures`                                              |
| **Timeline play**            | _Which came first?_ and _How far apart?_ run on the timeline itself; answers zoom to show the real gap.                                                                                                      | Timeline                                                   |
| **Invisible assessment**     | `concept_signals` records ordering, scale and simultaneity judgements quietly. No grades, no score screens.                                                                                                  | Database                                                   |
| **Content model**            | `regions`, `timeline_entries` (eras, events, organisms, civilizations, people, inventions, artworks, discoveries), `entry_relations`, `adventures`. Seeded with about 130 dated entries across every region. | `supabase/migrations/…_timeline.sql`, `supabase/seed.sql`  |

## 5. Design rules carried forward

1. Does it improve the timeline? If not, it is secondary.
2. Time is proportional. Never give eras equal widths.
3. Time is also spatial. Every entry has a region and coordinates.
4. Companions warm the experience; they never lecture.
5. No grades, no worksheets, no dashboards. Learning happens because the child keeps exploring.
6. The same world deepens with age: `age_band` on every entry gates detail, not access.
