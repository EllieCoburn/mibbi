import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Width = "narrow" | "default" | "wide";
const widths: Record<Width, string> = { narrow: "max-w-md", default: "max-w-5xl", wide: "max-w-7xl" };

export function Container({ width = "default", className, ...rest }: HTMLAttributes<HTMLDivElement> & { width?: Width }) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6", widths[width], className)} {...rest} />;
}
