import { MibbiAvatar } from "./mibbi-avatar";
import { ToyLink } from "@/components/ui/toy-button";
import { routes } from "@/lib/routes";
import type { CharacterSummary } from "@/lib/data/characters";

/**
 * A character card styled like collectible toy packaging: coloured box,
 * a "window" showing the Mibbi, a name plate and a rarity sticker.
 */
export function CollectibleCard({ character, index = 0 }: { character: CharacterSummary; index?: number }) {
  const tilt = ["-rotate-1", "rotate-1", "-rotate-[0.5deg]", "rotate-[0.5deg]"][index % 4];
  return (
    <article
      className={`chunky group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-paper transition-transform duration-200 hover:-translate-y-1.5 hover:rotate-0 ${tilt}`}
      style={{ backgroundColor: `color-mix(in oklab, ${character.placeholder_color} 18%, var(--color-paper))` }}
    >
      {/* Box top band */}
      <div className="flex items-center justify-between border-b-[3px] border-chocolate px-4 py-2" style={{ backgroundColor: character.placeholder_color }}>
        <span className="font-display text-lg font-bold text-chocolate lowercase">mibbi</span>
        <span className="sticker rotate-3 bg-paper px-2 py-0.5 text-[10px] text-chocolate" aria-label={`Rarity: ${character.rarity.name}`}>
          {character.rarity.name}
        </span>
      </div>

      {/* Window */}
      <div className="relative mx-4 mt-4 flex aspect-[4/3] items-end justify-center overflow-hidden rounded-2xl border-[3px] border-chocolate bg-gradient-to-b from-sky to-cream">
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-grass" aria-hidden="true" />
        <div className="relative mb-2 transition-transform duration-200 group-hover:animate-wiggle">
          <MibbiAvatar name={character.name} color={character.placeholder_color} shape={character.placeholder_shape} personalityKey={character.personality_key} imageUrl={character.image_url} size="clamp(88px, 40%, 120px)" />
        </div>
      </div>

      {/* Name plate */}
      <div className="flex flex-1 flex-col items-center px-4 pt-3 pb-4 text-center">
        <h3 className="font-display text-2xl font-bold text-chocolate">{character.name}</h3>
        <p className="font-display text-sm font-semibold text-brand">{character.personality_label}</p>
        {character.tagline ? <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{character.tagline}</p> : null}
        <div className="mt-3">
          <ToyLink href={routes.character(character.slug)} color="paper" ariaLabel={`Meet ${character.name}`}>
            Meet me
          </ToyLink>
        </div>
      </div>
    </article>
  );
}
