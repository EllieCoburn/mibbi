import Link from "next/link";
import { ToyLink } from "@/components/ui/toy-button";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { routes } from "@/lib/routes";
import { getCurrentUser } from "@/lib/data/profile";
import { getActiveCharacters } from "@/lib/data/characters";

const NAV = [
  { href: routes.timeline, label: "Timeline" },
  { href: routes.atlas, label: "Atlas" },
  { href: routes.adventures, label: "Adventures" },
  { href: routes.characters, label: "Mibbis" },
  { href: routes.parents, label: "Parents" },
];

/**
 * Floating chunky pill that feels like part of the world. A Mibbi peeks out
 * from behind it now and then. Signed-in visitors get their museum and
 * profile; everyone else gets Log in.
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
              <MibbiAvatar
                name={peeker.name}
                color={peeker.placeholder_color}
                shape={peeker.placeholder_shape}
                personalityKey={peeker.personality_key}
                imageUrl={peeker.thumbnail_url}
                size={52}
              />
            </div>
          </div>
        ) : null}

        <nav
          aria-label="Primary"
          className="chunky bg-paper/95 pointer-events-auto flex items-center gap-1 rounded-full py-1.5 pr-1.5 pl-2 backdrop-blur sm:gap-2 sm:pl-3"
        >
          <Link href={routes.home} className="font-display text-brand mr-1 text-2xl font-bold lowercase sm:mr-2" aria-label="Mibbi home">
            mibbi
          </Link>
          <ul className="hidden items-center gap-0.5 md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-display text-chocolate hover:bg-butter/70 focus-visible:bg-butter/70 rounded-full px-3 py-1.5 text-sm font-bold tracking-wide uppercase transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <details className="relative md:hidden">
            <summary
              className="bg-cream-deep font-display text-chocolate flex size-9 cursor-pointer list-none items-center justify-center rounded-full text-lg font-bold"
              aria-label="Menu"
            >
              ☰
            </summary>
            <ul className="chunky bg-paper absolute top-12 left-0 z-50 flex w-48 flex-col rounded-2xl p-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-display text-chocolate hover:bg-butter/70 block rounded-xl px-3 py-2 text-sm font-bold tracking-wide uppercase"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {user ? (
                <li>
                  <Link
                    href={routes.museum}
                    className="font-display text-chocolate hover:bg-butter/70 block rounded-xl px-3 py-2 text-sm font-bold tracking-wide uppercase"
                  >
                    Museum
                  </Link>
                </li>
              ) : null}
            </ul>
          </details>
          {user ? (
            <>
              <ToyLink href={routes.museum} color="pistachio" className="ml-1">
                Museum
              </ToyLink>
              <Link
                href={routes.profile}
                aria-label="Profile"
                className="chunky-sm bg-lavender/70 font-display text-chocolate hover:bg-lavender ml-1 flex size-10 items-center justify-center rounded-full text-sm font-bold"
              >
                {user.profile.display_name.slice(0, 1).toUpperCase()}
              </Link>
            </>
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
