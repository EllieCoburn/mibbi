import Link from "next/link";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { curiosityOf } from "@/lib/timeline/types";
import type { CharacterSummary } from "@/lib/data/characters";
import { routes } from "@/lib/routes";

/** The Mibbis as companions: each one notices something different. */
export function Companions({ characters }: { characters: CharacterSummary[] }) {
  if (characters.length === 0) return null;
  return (
    <section aria-labelledby="companions-heading" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 id="companions-heading" className="text-4xl sm:text-5xl">
            Companions through time
          </h2>
          <p className="font-display text-ink-soft mt-2 text-lg">
            Different Mibbis notice different things in the same place. Crumb finds the bone. Peach finds the painting.
          </p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {characters.slice(0, 6).map((c, i) => {
            const cur = curiosityOf(c.curiosity_key);
            return (
              <li key={c.id}>
                <Link href={routes.character(c.slug)} className="group flex flex-col items-center text-center">
                  <div className="animate-bob transition-transform group-hover:-translate-y-1" style={{ animationDelay: `${i * 0.3}s` }}>
                    <MibbiAvatar
                      name={c.name}
                      color={c.placeholder_color}
                      shape={c.placeholder_shape}
                      personalityKey={c.personality_key}
                      imageUrl={c.image_url}
                      size={96}
                    />
                  </div>
                  <p className="font-display text-chocolate mt-2 text-xl font-bold">{c.name}</p>
                  <p className="sticker bg-paper text-chocolate mt-1 px-2 py-0.5 text-[10px]">{cur.label}</p>
                  <p className="text-ink-soft mt-1 text-xs">Loves {cur.blurb}.</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
