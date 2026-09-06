import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { routes } from "@/lib/routes";
import { copy } from "@/lib/content/copy";

export function SiteFooter() {
  return (
    <footer className="border-line bg-cream-deep/60 mt-auto border-t">
      <Container width="wide" className="flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Logo size="sm" />
          <p className="text-ink-soft mt-1 text-sm">{copy.tagline}</p>
        </div>
        <nav aria-label="Footer" className="text-chocolate grid grid-cols-2 gap-x-10 gap-y-2 text-sm font-semibold">
          <Link href={routes.characters} className="hover:text-brand">
            Meet the Mibbis
          </Link>
          <Link href={routes.adopt} className="hover:text-brand">
            Adopt a Mibbi
          </Link>
          <Link href={routes.parents} className="hover:text-brand">
            For parents
          </Link>
          <Link href={routes.login} className="hover:text-brand">
            Sign in
          </Link>
        </nav>
        <p className="text-ink-mute text-xs sm:max-w-xs sm:text-right">© {new Date().getFullYear()} Mibbi. Made for curious hearts of all ages.</p>
      </Container>
    </footer>
  );
}
