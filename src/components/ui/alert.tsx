import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "info" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  info: "bg-dusty-soft/40 border-dusty/40 text-chocolate",
  success: "bg-pistachio/25 border-pistachio/50 text-chocolate",
  warning: "bg-butter/40 border-butter-deep/50 text-chocolate",
  danger: "bg-brand-soft border-brand/40 text-chocolate",
};

export function Alert({ tone = "info", title, children, className }: { tone?: Tone; title?: string; children?: ReactNode; className?: string }) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("rounded-md border-2 px-4 py-3 text-sm", tones[tone], className)}>
      {title ? <p className="font-display font-semibold">{title}</p> : null}
      {children ? <div className={title ? "mt-0.5" : undefined}>{children}</div> : null}
    </div>
  );
}
