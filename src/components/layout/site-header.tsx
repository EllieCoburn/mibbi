import Link from "next/link";
import { ToyLink } from "@/components/ui/toy-button";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { routes } from "@/lib/routes";
import { getCurrentUser } from "@/lib/data/profile";
import { getActiveCharacters } from "@/lib/data/characters";

const NAV = [
  { href: routes.characters, label: "Mibbis" },
  { href: routes.world, label: "World" },
  { href: routes.store, label: "Shop" },
  { href: routes.news, label: "News" },
  { href: routes.parents, label: "Parents" },
];

/**
 * Public header: a floating chunky pill that feels like part of the world.
 * A Mibbi peeks out from behind it now and then.
 */
export async function SiteHeader() {
  const [user, characters] = await Promise.all([getCurrentUser(), getActiveCharacters()]);
  const peeker = characters[4] ?? characters[0] ?? null;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="relative">
        {peeker ? (
          <div aria-hidden="true" className="absolute -top-8 left-6 -z-10 overflow-hidden sm:left-10" style={{ height: 44, width: 56 }}>
            <div className="animate-peek">
              <MibbiAvatar name={peeker.name} color={peeker.placeholder_color} shape={peeker.placeholder_shape} personalityKey={peeker.personality_key} imageUrl={peeker.thumbnail_url} size={52} />
            </div>
          </div>
        ) : null}

        <nav aria-label="Primary" className="pointer-events-auto chunky flex items-center gap-1 rounded-full bg-paper/95 py-1.5 pr-1.5 pl-2 backdrop-blur sm:gap-2 sm:pl-3">
          <Link href={routes.home} className="mr-1 font-display text-2xl font-bold text-brand lowercase sm:mr-2" aria-label="Mibbi home">
            mibbi
          </Link>
          <ul className="hidden items-center gap-0.5 md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3 py-1.5 font-display text-sm font-bold tracking-wide text-chocolate uppercase transition-colors hover:bg-butter/70 focus-visible:bg-butter/70"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <details className="relative md:hidden">
            <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full bg-cream-deep font-display text-lg font-bold text-chocolate" aria-label="Menu">
              ☰
            </summary>
            <ul className="chunky absolute top-12 left-0 z-50 flex w-44 flex-col rounded-2xl bg-paper p-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-xl px-3 py-2 font-display text-sm font-bold tracking-wide text-chocolate uppercase hover:bg-butter/70">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
          {user ? (
            <ToyLink href={routes.app} color="pistachio" className="ml-1">
              My room
            </ToyLink>
          ) : (
            <ToyLink href={routes.login} color="butter" className="ml-1">
              Log in
            </ToyLink>
          )}
        </nav>
      </div>
    </header>
  );
}
