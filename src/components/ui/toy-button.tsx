import Link from "next/link";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ToyColor = "brand" | "butter" | "pistachio" | "dusty" | "peach" | "paper";
type ToySize = "md" | "lg" | "xl";

/** Face / side colours per variant. Kept in one place so every toy button matches. */
const COLORS: Record<ToyColor, CSSProperties> = {
  brand: { "--toy": "var(--color-brand)", "--toy-deep": "var(--color-brand-deep)", "--toy-ink": "var(--color-paper)" } as CSSProperties,
  butter: { "--toy": "var(--color-butter)", "--toy-deep": "var(--color-butter-deep)", "--toy-ink": "var(--color-chocolate)" } as CSSProperties,
  pistachio: { "--toy": "var(--color-pistachio)", "--toy-deep": "var(--color-pistachio-deep)", "--toy-ink": "var(--color-paper)" } as CSSProperties,
  dusty: { "--toy": "var(--color-dusty)", "--toy-deep": "#5f7fa8", "--toy-ink": "var(--color-paper)" } as CSSProperties,
  peach: { "--toy": "var(--color-peach)", "--toy-deep": "#d9807a", "--toy-ink": "var(--color-chocolate)" } as CSSProperties,
  paper: { "--toy": "var(--color-paper)", "--toy-deep": "var(--color-line)", "--toy-ink": "var(--color-chocolate)" } as CSSProperties,
};

const SIZES: Record<ToySize, string> = {
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
  xl: "h-16 px-10 text-lg sm:h-[4.5rem] sm:px-12 sm:text-xl",
};

const base = "toy-btn hover:toy-btn-hover active:toy-btn-press focus-visible:toy-btn-hover disabled:pointer-events-none disabled:opacity-60";

interface CommonProps {
  color?: ToyColor;
  size?: ToySize;
  className?: string;
  children: ReactNode;
}

/** A chunky, dimensional button that compresses when pressed. */
export function ToyButton({ color = "brand", size = "md", className, children, style, ...rest }: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, SIZES[size], className)} style={{ ...COLORS[color], ...style }} {...rest}>
      {children}
    </button>
  );
}

/** Same look, renders a Next link. */
export function ToyLink({ href, color = "brand", size = "md", className, children, ariaLabel }: CommonProps & { href: string; ariaLabel?: string }) {
  return (
    <Link href={href} aria-label={ariaLabel} className={cn(base, SIZES[size], className)} style={COLORS[color]}>
      {children}
    </Link>
  );
}
