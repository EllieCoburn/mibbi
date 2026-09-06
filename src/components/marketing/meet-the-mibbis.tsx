import { CollectibleCard } from "@/components/characters/collectible-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ToyLink } from "@/components/ui/toy-button";
import type { CharacterSummary } from "@/lib/data/characters";
import { routes } from "@/lib/routes";

export function MeetTheMibbis({ characters, limit, standalone }: { characters: CharacterSummary[]; limit?: number; standalone?: boolean }) {
  const shown = limit ? characters.slice(0, limit) : characters;
  return (
    <section aria-labelledby="meet-heading" className={standalone ? "pt-28 pb-16 sm:pt-32" : "py-16 sm:py-20"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 id="meet-heading" className="text-4xl sm:text-5xl">
            Meet the Mibbis
          </h2>
          <p className="mt-2 font-display text-lg text-ink-soft">Different feelings. Same big friendship.</p>
        </div>
        {shown.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="The Mibbis are on their way.">Check back soon.</EmptyState>
          </div>
        ) : (
          <ul className="mt-12 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-3 xl:grid-cols-6">
            {shown.map((c, i) => (
              <li key={c.id}>
                <CollectibleCard character={c} index={i} />
              </li>
            ))}
          </ul>
        )}
        {limit && characters.length > limit ? (
          <div className="mt-10 text-center">
            <ToyLink href={routes.characters} color="butter" size="lg">
              See everyone
            </ToyLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
