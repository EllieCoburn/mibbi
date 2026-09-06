import { BulletinCard } from "@/components/ui/bulletin-card";
import { BULLETIN } from "@/lib/content/bulletin";
import type { CharacterSummary } from "@/lib/data/characters";

export function Bulletin({ characters, limit = 4 }: { characters: CharacterSummary[]; limit?: number }) {
  const bySlug = new Map(characters.map((c) => [c.slug, c]));
  const items = BULLETIN.slice(0, limit);
  return (
    <section aria-labelledby="bulletin-heading" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Masthead */}
        <div className="chunky bg-paper mx-auto max-w-2xl rounded-2xl px-6 py-4 text-center">
          <p className="font-display text-ink-mute text-xs font-bold tracking-[0.3em] uppercase">News from inside the world</p>
          <h2 id="bulletin-heading" className="font-display text-chocolate mt-1 text-4xl font-bold tracking-tight uppercase sm:text-5xl">
            The Mibbi Bulletin
          </h2>
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <li key={item.id}>
              <BulletinCard item={item} reporter={item.reporter ? bySlug.get(item.reporter) : undefined} index={i} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
