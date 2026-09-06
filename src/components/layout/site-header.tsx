import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { LinkButton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { routes } from "@/lib/routes";
import { getCurrentUser } from "@/lib/data/profile";

/** Public site header. Shows "Go to my room" when signed in. */
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-line/70 bg-cream/85 sticky top-0 z-30 border-b backdrop-blur">
      <Container width="wide" className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Primary" className="font-display text-chocolate hidden items-center gap-6 font-semibold sm:flex">
          <Link href={routes.characters} className="hover:text-brand">
            Meet the Mibbis
          </Link>
          <Link href={routes.parents} className="hover:text-brand">
            For parents
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <LinkButton href={routes.app} size="sm">
              My room
            </LinkButton>
          ) : (
            <>
              <LinkButton href={routes.login} variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign in
              </LinkButton>
              <LinkButton href={routes.adopt} size="sm">
                Adopt a Mibbi
              </LinkButton>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
