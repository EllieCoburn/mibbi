import type { ReactNode } from "react";

/** Friendly empty state. Every list in the app should have one. */
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="border-line bg-paper/60 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center">
      <h3 className="text-xl">{title}</h3>
      {children ? <p className="text-ink-soft max-w-sm">{children}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
