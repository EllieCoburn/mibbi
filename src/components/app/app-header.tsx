import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { routes } from "@/lib/routes";
import type { CurrentUser } from "@/lib/data/profile";

/** Top bar for the signed-in app: wordmark, coin balance and profile link. */
export function AppHeader({ user, coins }: { user: CurrentUser; coins: number }) {
  return (
    <header className="border-line/70 bg-cream/85 sticky top-0 z-20 border-b backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Logo href={routes.app} size="sm" />
        <div className="flex items-center gap-2">
          <span
            className="bg-butter/70 font-display text-chocolate inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold"
            aria-label={`${coins} Mibbi Coins`}
          >
            <CoinIcon />
            {coins.toLocaleString()}
          </span>
          {user.isAdmin ? (
            <Link
              href={routes.admin}
              className="border-line bg-paper font-display text-ink-soft hover:text-brand rounded-full border px-3 py-1 text-xs font-semibold"
            >
              Admin
            </Link>
          ) : null}
          <Link
            href={routes.profile}
            aria-label="Profile and settings"
            className="bg-lavender/60 font-display text-chocolate hover:bg-lavender flex size-9 items-center justify-center rounded-full text-sm font-bold"
          >
            {user.profile.display_name.slice(0, 1).toUpperCase()}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function CoinIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--color-butter-deep)" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="var(--color-paper)" strokeWidth="1.8" />
      <path d="M12 8.5v7M9.8 10.5h3.4M9.8 13.5h3.4" stroke="var(--color-chocolate)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
