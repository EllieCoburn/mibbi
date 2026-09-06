import Link from "next/link";
import { MibbiAvatar } from "./mibbi-avatar";
import { RarityBadge } from "./rarity-badge";
import { routes } from "@/lib/routes";
import type { CharacterSummary } from "@/lib/data/characters";

/**
 * Card used on the homepage grid and the Meet the Mibbis page.
 * Links to the character profile.
 */
export function CharacterCard({ character }: { character: CharacterSummary }) {
  return (
    <Link
      href={routes.character(character.slug)}
      className="group border-line bg-paper shadow-soft hover:shadow-lift flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-[transform,box-shadow] hover:-translate-y-1"
    >
      <div className="group-hover:animate-wiggle transition-transform">
        <MibbiAvatar
          name={character.name}
          color={character.placeholder_color}
          shape={character.placeholder_shape}
          personalityKey={character.personality_key}
          imageUrl={character.thumbnail_url ?? character.image_url}
          size={104}
        />
      </div>
      <div>
        <h3 className="text-2xl">{character.name}</h3>
        <p className="font-display text-brand text-sm">{character.personality_label}</p>
      </div>
      {character.tagline ? <p className="text-ink-soft text-sm">{character.tagline}</p> : null}
      <RarityBadge name={character.rarity.name} color={character.rarity.color_hex} />
    </Link>
  );
}
