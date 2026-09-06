import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Any CSS colour; used as a tinted background with dark text. */
  color?: string;
}

export function Badge({ color, className, style, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "font-display inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase",
        !color && "bg-cream-deep text-ink-soft",
        className,
      )}
      style={color ? { backgroundColor: `color-mix(in oklab, ${color} 28%, white)`, color: "var(--color-chocolate)", ...style } : style}
      {...rest}
    />
  );
}
