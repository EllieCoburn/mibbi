import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Wrapper for inner public pages: clears the floating header and centres content. */
export function PageTop({ children, className, width = "max-w-5xl" }: { children: ReactNode; className?: string; width?: string }) {
  return <div className={cn("mx-auto w-full px-4 pt-28 pb-16 sm:px-6 sm:pt-32", width, className)}>{children}</div>;
}
