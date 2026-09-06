"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: routes.app, label: "Home", icon: HomeIcon },
  { href: routes.collection, label: "Collection", icon: CollectionIcon },
  { href: routes.adopt, label: "Adopt", icon: PlusIcon, primary: true },
  { href: routes.world, label: "Map", icon: MapIcon },
  { href: routes.quests, label: "Quests", icon: QuestIcon },
] as const;

/**
 * App navigation: a bottom tab bar on phones, a left rail on larger screens.
 * Feels like an app without needing one.
 */
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App"
      className="border-line bg-paper/95 pb-safe fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur sm:inset-y-0 sm:left-0 sm:w-20 sm:border-t-0 sm:border-r sm:pb-0 lg:w-56"
    >
      <ul className="flex items-stretch justify-around sm:mt-20 sm:flex-col sm:justify-start sm:gap-1 sm:px-2">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1 sm:flex-none">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "font-display flex flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-semibold transition-colors sm:flex-row sm:gap-3 sm:rounded-md sm:px-3 sm:py-2.5 sm:text-sm",
                  "primary" in item && item.primary
                    ? "text-brand"
                    : active
                      ? "text-brand sm:bg-brand-soft/60"
                      : "text-ink-soft hover:text-chocolate sm:hover:bg-cream-deep",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full sm:size-8",
                    "primary" in item && item.primary && "bg-brand text-paper shadow-lift -mt-5 size-12 sm:mt-0 sm:size-8",
                  )}
                >
                  <Icon />
                </span>
                <span className="sm:sr-only lg:inline">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function CollectionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 sm:size-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function MapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}
function QuestIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="m4 6 1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />
    </svg>
  );
}
