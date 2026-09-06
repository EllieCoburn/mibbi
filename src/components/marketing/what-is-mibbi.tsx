import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import type { CharacterSummary } from "@/lib/data/characters";
import { copy } from "@/lib/content/copy";

export function WhatIsMibbi({ characters }: { characters: CharacterSummary[] }) {
  return (
    <section aria-labelledby="what-heading" className="py-12 sm:py-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
        <h2 id="what-heading" className="font-display text-ink-mute text-sm font-bold tracking-[0.25em] uppercase">
          What is Mibbi?
        </h2>
        <p className="font-display text-chocolate mt-4 text-2xl leading-snug font-semibold sm:text-3xl">{copy.whatIs}</p>
        <ul className="mt-8 flex items-end gap-2 sm:gap-4" aria-label="Some of the Mibbis">
          {characters.slice(0, 5).map((c, i) => (
            <li key={c.id} className="animate-bob" style={{ animationDelay: `${i * 0.35}s` }}>
              <MibbiAvatar
                name={c.name}
                color={c.placeholder_color}
                shape={c.placeholder_shape}
                personalityKey={c.personality_key}
                imageUrl={c.thumbnail_url}
                size={i === 2 ? 72 : 56}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
