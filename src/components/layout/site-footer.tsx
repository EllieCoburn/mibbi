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
    <footer className="bg-hill-near text-chocolate relative mt-16 overflow-hidden">
      <svg viewBox="0 0 1600 60" preserveAspectRatio="none" aria-hidden="true" className="absolute -top-px left-0 h-8 w-full sm:h-12">
        <path d="M0 60 C 200 10, 400 50, 600 20 C 800 -5, 1000 45, 1200 20 C 1400 0, 1500 40, 1600 25 L1600 0 L0 0z" fill="var(--color-cream)" />
      </svg>
      {sleeper ? (
        <div aria-hidden="true" className="absolute top-2 right-[8%] flex flex-col items-center sm:top-4">
          <span className="font-display text-chocolate/70 mb-1 text-xs font-bold">zzz</span>
          <MibbiAvatar
            name={sleeper.name}
            color={sleeper.placeholder_color}
            shape={sleeper.placeholder_shape}
            personalityKey="sleepy"
            imageUrl={sleeper.thumbnail_url}
            size={64}
          />
        </div>
      ) : null}

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-20 pb-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-brand text-3xl font-bold lowercase drop-shadow-[0_3px_0_rgb(255_255_255_/_0.7)]">mibbi</p>
          <p className="font-display mt-1 text-sm font-semibold">{copy.headline}</p>
          <p className="text-chocolate/70 text-xs">{copy.tagline}</p>
        </div>
        <nav aria-label="Footer" className="font-display grid grid-cols-3 gap-x-8 gap-y-2 text-sm font-bold tracking-wide uppercase">
          <Link href={routes.timeline} className="hover:text-brand">
            Timeline
          </Link>
          <Link href={routes.atlas} className="hover:text-brand">
            Atlas
          </Link>
          <Link href={routes.adventures} className="hover:text-brand">
            Adventures
          </Link>
          <Link href={routes.museum} className="hover:text-brand">
            Museum
          </Link>
          <Link href={routes.characters} className="hover:text-brand">
            Mibbis
          </Link>
          <Link href={routes.store} className="hover:text-brand">
            Collectibles
          </Link>
          <Link href={routes.news} className="hover:text-brand">
            News
          </Link>
          <Link href={routes.parents} className="hover:text-brand">
            Parents
          </Link>
          <Link href={routes.login} className="hover:text-brand">
            Log in
          </Link>
        </nav>
        <p className="text-chocolate/70 text-xs sm:max-w-xs sm:text-right">
          © {new Date().getFullYear()} Mibbi. No chat, no ads, no grades. Made for curious hearts of all ages.
        </p>
      </div>
    </footer>
  );
}
