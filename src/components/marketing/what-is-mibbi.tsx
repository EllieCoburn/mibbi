import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import type { CharacterSummary } from "@/lib/data/characters";

export function WhatIsMibbi({ characters }: { characters: CharacterSummary[] }) {
  return (
    <section aria-labelledby="what-heading" className="py-12 sm:py-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
        <h2 id="what-heading" className="font-display text-sm font-bold tracking-[0.25em] text-ink-mute uppercase">
          What is Mibbi?
        </h2>
        <p className="mt-4 font-display text-2xl leading-snug font-semibold text-chocolate sm:text-3xl">
          Mibbi is a world of collectible characters you can squish, collect, unlock, and bring to life online.
        </p>
        <ul className="mt-8 flex items-end gap-2 sm:gap-4" aria-label="Some of the Mibbis">
          {characters.slice(0, 5).map((c, i) => (
            <li key={c.id} className="animate-bob" style={{ animationDelay: `${i * 0.35}s` }}>
              <MibbiAvatar name={c.name} color={c.placeholder_color} shape={c.placeholder_shape} personalityKey={c.personality_key} imageUrl={c.thumbnail_url} size={i === 2 ? 72 : 56} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
