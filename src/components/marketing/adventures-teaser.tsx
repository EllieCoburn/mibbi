import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { ToyLink } from "@/components/ui/toy-button";
import type { Adventure } from "@/lib/timeline/types";
import type { CharacterSummary } from "@/lib/data/characters";
import { routes } from "@/lib/routes";

/** Physical Mibbis are portals: each unlocks an expedition. */
export function AdventuresTeaser({ adventures, characters }: { adventures: Adventure[]; characters: CharacterSummary[] }) {
  if (adventures.length === 0) return null;
  const bySlug = new Map(characters.map((c) => [c.slug, c]));
  return (
    <section aria-labelledby="adv-heading" className="bg-paper py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 id="adv-heading" className="text-4xl sm:text-5xl">
            Got a Mibbi? It’s a portal.
          </h2>
          <p className="font-display text-ink-soft mt-2 text-lg">Every real Mibbi unlocks an expedition through time with that companion.</p>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adventures.slice(0, 6).map((a, i) => {
            const c = a.companion_character_slug ? bySlug.get(a.companion_character_slug) : undefined;
            return (
              <li key={a.id} className={`chunky-sm bg-cream flex items-center gap-3 rounded-2xl p-4 ${["-rotate-1", "rotate-[0.5deg]", "rotate-1"][i % 3]}`}>
                {c ? (
                  <MibbiAvatar
                    name={c.name}
                    color={c.placeholder_color}
                    shape={c.placeholder_shape}
                    personalityKey={c.personality_key}
                    imageUrl={c.thumbnail_url}
                    size={56}
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="font-display text-chocolate text-lg leading-tight font-bold">{a.name}</p>
                  <p className="text-ink-soft text-xs">{a.tagline}</p>
                  <p className="text-ink-mute mt-1 text-[10px] font-bold tracking-wider uppercase">
                    {a.unlock_character_slug ? `Unlocked by a real ${c?.name ?? "Mibbi"}` : "Free for everyone"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ToyLink href={routes.adventures} size="lg" color="pistachio">
            See all adventures
          </ToyLink>
          <ToyLink href={routes.characters} size="lg" color="paper">
            Meet the companions
          </ToyLink>
        </div>
      </div>
    </section>
  );
}
