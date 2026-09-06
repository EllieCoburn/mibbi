import Link from "next/link";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { routes } from "@/lib/routes";
import { copy } from "@/lib/content/copy";
import { getActiveCharacters } from "@/lib/data/characters";

/** Footer: a grassy edge with a Mibbi asleep on it. */
export async function SiteFooter() {
  const characters = await getActiveCharacters();
  const sleeper = characters.find((c) => c.personality_key === "sleepy") ?? characters[2] ?? null;

  return (
    <footer className="relative mt-16 overflow-hidden bg-hill-near text-chocolate">
      {/* Grass edge */}
      <svg viewBox="0 0 1600 60" preserveAspectRatio="none" aria-hidden="true" className="absolute -top-px left-0 h-8 w-full sm:h-12">
        <path d="M0 60 C 200 10, 400 50, 600 20 C 800 -5, 1000 45, 1200 20 C 1400 0, 1500 40, 1600 25 L1600 0 L0 0z" fill="var(--color-cream)" />
      </svg>
      {sleeper ? (
        <div aria-hidden="true" className="absolute top-2 right-[8%] flex flex-col items-center sm:top-4">
          <span className="mb-1 font-display text-xs font-bold text-chocolate/70">zzz</span>
          <MibbiAvatar name={sleeper.name} color={sleeper.placeholder_color} shape={sleeper.placeholder_shape} personalityKey="sleepy" imageUrl={sleeper.thumbnail_url} size={64} />
        </div>
      ) : null}

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-20 pb-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-3xl font-bold text-brand lowercase drop-shadow-[0_3px_0_rgb(255_255_255_/_0.7)]">mibbi</p>
          <p className="mt-1 font-display text-sm font-semibold">{copy.tagline}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2 font-display text-sm font-bold tracking-wide uppercase">
          <Link href={routes.characters} className="hover:text-brand">Mibbis</Link>
          <Link href={routes.adopt} className="hover:text-brand">Got a Mibbi?</Link>
          <Link href={routes.news} className="hover:text-brand">News</Link>
          <Link href={routes.parents} className="hover:text-brand">Parents</Link>
          <Link href={routes.store} className="hover:text-brand">Shop</Link>
          <Link href={routes.login} className="hover:text-brand">Log in</Link>
        </nav>
        <p className="text-xs text-chocolate/70 sm:max-w-xs sm:text-right">
          © {new Date().getFullYear()} Mibbi. No chat, no ads, no real-money purchases inside the world. Made for curious hearts of all ages.
        </p>
      </div>
    </footer>
  );
}
