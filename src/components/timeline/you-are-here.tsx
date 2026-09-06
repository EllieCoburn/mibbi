"use client";

import { PRESENT_YEAR } from "@/lib/timeline/time";

/** The beacon at the end of the river. Stronger when zoomed near today. */
export function YouAreHere({
  x,
  width,
  height,
  riverY,
  near,
  visible,
  onJump,
}: {
  x: number;
  width: number;
  height: number;
  riverY: number;
  near: boolean;
  visible: boolean;
  onJump: () => void;
}) {
  const labelShift = Math.min(0, width - 8 - (x + 96)) + Math.max(0, 96 + 8 - x);
  if (!visible) {
    return (
      <button
        type="button"
        onClick={onJump}
        className="border-chocolate bg-brand font-display text-paper absolute top-1/2 right-2 z-30 -translate-y-1/2 rounded-full border-[3px] px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase shadow-[0_3px_0_0_var(--color-chocolate)] hover:brightness-110"
      >
        You are here →
      </button>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-y-0 z-20" style={{ left: x }} aria-hidden="true">
      <div className="bg-brand/60 absolute inset-y-0 -left-px w-0.5" />
      <div
        className="border-chocolate bg-brand absolute -left-[18px] flex size-9 items-center justify-center rounded-full border-[3px] shadow-[0_0_0_10px_rgb(200_85_61_/_0.18),0_0_0_20px_rgb(200_85_61_/_0.08)]"
        style={{ top: riverY - 18 }}
      >
        <span className="bg-paper size-3 rounded-full" />
      </div>
      <div
        className="border-chocolate bg-brand font-display text-paper absolute -translate-x-1/2 rounded-full border-[3px] px-3 py-1 text-center text-[11px] font-bold tracking-wide whitespace-nowrap uppercase shadow-[0_3px_0_0_var(--color-chocolate)]"
        style={{ top: riverY - 64, left: labelShift }}
      >
        You are here · {PRESENT_YEAR}
      </div>
      {near ? (
        <p
          className="bg-paper/85 font-display text-chocolate absolute w-56 -translate-x-1/2 rounded-full px-2 py-1 text-center text-xs font-semibold"
          style={{ top: height - 84, left: labelShift }}
        >
          Everything before this led to the world you know.
        </p>
      ) : null}
    </div>
  );
}
