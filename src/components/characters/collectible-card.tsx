import { MibbiAvatar } from "./mibbi-avatar";
import { ToyLink } from "@/components/ui/toy-button";
import { routes } from "@/lib/routes";
import type { CharacterSummary } from "@/lib/data/characters";
import { curiosityOf } from "@/lib/timeline/types";

/**
 * A character card styled like collectible toy packaging: coloured box,
 * a "window" showing the Mibbi, a name plate and a rarity sticker.
 */
export function CollectibleCard({ character, index = 0 }: { character: CharacterSummary; index?: number }) {
  const tilt = ["-rotate-1", "rotate-1", "-rotate-[0.5deg]", "rotate-[0.5deg]"][index % 4];
  return (
    <article
      className={`chunky group bg-paper relative flex flex-col overflow-hidden rounded-[1.75rem] transition-transform duration-200 hover:-translate-y-1.5 hover:rotate-0 ${tilt}`}
      style={{ backgroundColor: `color-mix(in oklab, ${character.placeholder_color} 18%, var(--color-paper))` }}
    >
      {/* Box top band */}
      <div className="border-chocolate flex items-center justify-between border-b-[3px] px-4 py-2" style={{ backgroundColor: character.placeholder_color }}>
        <span className="font-display text-chocolate text-lg font-bold lowercase">mibbi</span>
        <span className="sticker bg-paper text-chocolate rotate-3 px-2 py-0.5 text-[10px]" aria-label={`Rarity: ${character.rarity.name}`}>
          {character.rarity.name}
        </span>
      </div>

      {/* Window */}
      <div className="border-chocolate from-sky to-cream relative mx-4 mt-4 flex aspect-[4/3] items-end justify-center overflow-hidden rounded-2xl border-[3px] bg-gradient-to-b">
        <div className="bg-grass absolute inset-x-0 bottom-0 h-1/3" aria-hidden="true" />
        <div className="group-hover:animate-wiggle relative mb-2 transition-transform duration-200">
          <MibbiAvatar
            name={character.name}
            color={character.placeholder_color}
            shape={character.placeholder_shape}
            personalityKey={character.personality_key}
            imageUrl={character.image_url}
            size="clamp(88px, 40%, 120px)"
          />
        </div>
      </div>

      {/* Name plate */}
      <div className="flex flex-1 flex-col items-center px-4 pt-3 pb-4 text-center">
        <h3 className="font-display text-chocolate text-2xl font-bold">{character.name}</h3>
        <p className="font-display text-brand text-sm font-semibold">{character.personality_label}</p>
        <p className="text-ink-mute mt-0.5 text-[11px] font-semibold">Loves {curiosityOf(character.curiosity_key).blurb}</p>
        {character.tagline ? <p className="text-ink-soft mt-1 line-clamp-2 text-xs">{character.tagline}</p> : null}
        <div className="mt-3">
          <ToyLink href={routes.character(character.slug)} color="paper" ariaLabel={`Meet ${character.name}`}>
            Meet me
          </ToyLink>
        </div>
      </div>
    </article>
  );
}
