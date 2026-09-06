import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * Wordmark. Text-based for now so it scales and stays crisp; swap for the
 * final SVG logo when brand artwork lands.
 */
export function Logo({ className, href = "/", size = "md" }: { className?: string; href?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = { sm: "text-2xl", md: "text-3xl", lg: "text-5xl", xl: "text-7xl sm:text-8xl" };
  return (
    <Link
      href={href}
      aria-label="Mibbi home"
      className={cn("font-display text-brand inline-flex items-baseline font-bold tracking-tight lowercase", sizes[size], className)}
    >
      mibbi
    </Link>
  );
}
