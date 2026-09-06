import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { CharacterCard } from "@/components/characters/character-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { CharacterSummary } from "@/lib/data/characters";
import { routes } from "@/lib/routes";

export function MeetTheMibbis({ characters, limit }: { characters: CharacterSummary[]; limit?: number }) {
  const shown = limit ? characters.slice(0, limit) : characters;
  return (
    <section aria-labelledby="meet-heading" className="py-16 sm:py-20">
      <Container width="wide">
        <div className="text-center">
          <h2 id="meet-heading" className="text-3xl sm:text-4xl">
            Meet the Mibbis
          </h2>
          <p className="text-ink-soft mt-2">Different feelings. Same big friendship.</p>
        </div>
        {shown.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="The Mibbis are on their way.">Check back soon.</EmptyState>
          </div>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {shown.map((c) => (
              <li key={c.id}>
                <CharacterCard character={c} />
              </li>
            ))}
          </ul>
        )}
        {limit && characters.length > limit ? (
          <div className="mt-8 text-center">
            <LinkButton href={routes.characters} variant="secondary">
              See everyone
            </LinkButton>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
