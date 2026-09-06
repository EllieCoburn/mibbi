import { LinkButton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { copy } from "@/lib/content/copy";
import { routes } from "@/lib/routes";
import type { CharacterSummary } from "@/lib/data/characters";

export function Hero({ characters }: { characters: CharacterSummary[] }) {
  const lineup = characters.slice(0, 6);
  return (
    <section className="bg-grain relative overflow-hidden">
      <Container width="wide" className="grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <p className="font-display text-brand text-7xl font-bold tracking-tight lowercase sm:text-8xl">mibbi</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">{copy.tagline}</h1>
          <p className="text-ink-soft mx-auto mt-5 max-w-md text-lg lg:mx-0">
            {copy.heroLine1} {copy.heroLine2}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <LinkButton href={routes.characters} size="lg" variant="secondary">
              Meet the Mibbis
            </LinkButton>
            <LinkButton href={routes.adopt} size="lg">
              Adopt a Mibbi
            </LinkButton>
          </div>
          <p className="font-display text-ink-mute mt-6 text-sm font-semibold tracking-[0.2em] uppercase">{copy.motto}</p>
        </div>

        <ul aria-label="The Mibbis" className="grid grid-cols-3 gap-4 sm:gap-6">
          {lineup.map((c, i) => (
            <li key={c.id} className="flex justify-center" style={{ animationDelay: `${i * 0.4}s` }}>
              <MibbiAvatar
                name={c.name}
                color={c.placeholder_color}
                shape={c.placeholder_shape}
                personalityKey={c.personality_key}
                imageUrl={c.image_url}
                size="100%"
                animate
                className="max-w-[140px]"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
