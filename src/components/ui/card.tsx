import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/** Warm paper card. The default surface for everything that isn't the page. */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-line bg-paper shadow-soft rounded-xl border", className)} {...rest} />;
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...rest} />;
}
