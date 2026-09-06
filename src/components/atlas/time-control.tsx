"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { JUMPS, PRESENT_YEAR, UNIVERSE_AGE, formatYear, yearsAgo } from "@/lib/timeline/time";
import { cn } from "@/lib/utils/cn";

const LOG_MAX = Math.log10(UNIVERSE_AGE);

/** Slider on a log scale of years-ago, so 13.8 billion years and 1215 both fit. */
export function AtlasTimeControl({ year, region }: { year: number; region: string | null }) {
  const router = useRouter();
  const [local, setLocal] = useState(year);
  const [, start] = useTransition();

  const toSlider = (y: number) => {
    const ago = Math.max(yearsAgo(y), 1);
    return 1 - Math.log10(ago) / LOG_MAX;
  };
  const fromSlider = (s: number) => {
    const ago = 10 ** ((1 - s) * LOG_MAX);
    const y = PRESENT_YEAR - ago;
    // Round to a sensible precision for the scale.
    const mag = 10 ** Math.max(0, Math.floor(Math.log10(ago)) - 1);
    return Math.round(y / mag) * mag;
  };

  const go = (y: number) => {
    setLocal(y);
    start(() => {
      const p = new URLSearchParams();
      p.set("year", String(Math.round(y)));
      if (region) p.set("region", region);
      router.replace(`/atlas?${p.toString()}`);
    });
  };

  return (
    <div className="chunky bg-paper rounded-3xl p-3 sm:p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor="atlas-year" className="font-display text-ink-mute text-xs font-bold tracking-wider uppercase">
          The world in
        </label>
        <output className="font-display text-chocolate text-2xl font-bold">{formatYear(local)}</output>
      </div>
      <input
        id="atlas-year"
        type="range"
        min={0}
        max={1000}
        value={Math.round(toSlider(local) * 1000)}
        onChange={(e) => setLocal(fromSlider(Number(e.target.value) / 1000))}
        onPointerUp={() => go(local)}
        onKeyUp={() => go(local)}
        className="accent-brand mt-2 w-full"
        aria-valuetext={formatYear(local)}
      />
      <div className="mt-2 flex [scrollbar-width:none] gap-1.5 overflow-x-auto">
        {JUMPS.map((j) => (
          <button
            key={j.key}
            type="button"
            onClick={() => go(j.year)}
            className={cn(
              "chunky-sm font-display shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap",
              Math.abs(j.year - year) < 1 ? "bg-brand text-paper" : "bg-paper text-chocolate hover:bg-butter/70",
            )}
          >
            {j.label}
          </button>
        ))}
      </div>
    </div>
  );
}
