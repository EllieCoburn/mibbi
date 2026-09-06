"use client";

/**
 * The era navigator: a compact overview of the whole story that the child
 * can grab. Segments are sized by the LOG of their duration so every era is
 * visible (a to-scale overview would hide everything after the dinosaurs);
 * the label says so. The bracket shows where the current view sits.
 */
import { JUMPS, UNIVERSE_AGE, jumpViewport, yearsAgo, type Viewport } from "@/lib/timeline/time";
import { cn } from "@/lib/utils/cn";

const SEGMENTS: Array<{ key: string; label: string; from: number; to: number; color: string }> = [
  { key: "universe", label: "Universe", from: 13.8e9, to: 4.54e9, color: "#4a3d6b" },
  { key: "earth", label: "Earth", from: 4.54e9, to: 3.7e9, color: "#c8553d" },
  { key: "life", label: "Life", from: 3.7e9, to: 5.41e8, color: "#7e9bc2" },
  { key: "cambrian", label: "Complex life", from: 5.41e8, to: 2.33e8, color: "#8fae8b" },
  { key: "dinos", label: "Dinosaurs", from: 2.33e8, to: 6.6e7, color: "#7fa36b" },
  { key: "mammals", label: "Mammals", from: 6.6e7, to: 3e5, color: "#f2a65a" },
  { key: "humans", label: "Humans", from: 3e5, to: 1.2e4, color: "#f7a8a0" },
  { key: "civ", label: "Civilizations", from: 1.2e4, to: 526, color: "#e3b341" },
  { key: "y1500", label: "Modern", from: 526, to: 0, color: "#e0685a" },
];

/** Position 0..1 along the navigator for a years-ago value (log scale). */
function pos(ago: number): number {
  const L = (x: number) => Math.log10(Math.max(x, 1) + 1);
  return 1 - L(ago) / L(UNIVERSE_AGE);
}

export function EraNavigator({ view, onJump }: { view: Viewport; onJump: (v: Viewport) => void }) {
  const left = pos(view.older);
  const right = pos(Math.max(view.newer, 0));
  return (
    <div className="flex items-center gap-2 px-1">
      <div
        className="border-chocolate bg-paper relative h-9 flex-1 overflow-hidden rounded-full border-[3px]"
        role="group"
        aria-label="Era navigator (not to scale)"
      >
        {SEGMENTS.map((s) => {
          const x = pos(s.from);
          const w = pos(s.to) - x;
          const v = JUMPS.find((j) => j.key === s.key) ? jumpViewport(s.key) : { older: s.from * 1.05, newer: s.to * 0.95 };
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onJump(v)}
              title={s.label}
              className="border-chocolate/30 font-display text-chocolate/90 absolute inset-y-0 overflow-hidden border-r text-[10px] font-bold transition-[filter] hover:brightness-110 focus-visible:brightness-110 sm:text-[11px]"
              style={{ left: `${x * 100}%`, width: `${w * 100}%`, backgroundColor: `color-mix(in oklab, ${s.color} 55%, white)` }}
            >
              <span className="block truncate px-1.5">{s.label}</span>
            </button>
          );
        })}
        {/* Viewport bracket */}
        <div
          aria-hidden="true"
          className="border-brand bg-brand/10 pointer-events-none absolute inset-y-0 rounded-md border-[3px] shadow-[0_0_0_2px_rgb(255_255_255_/_0.7)]"
          style={{ left: `calc(${left * 100}% - 3px)`, width: `max(10px, ${(right - left) * 100}%)` }}
        />
      </div>
      <label className="sr-only" htmlFor="jump-select">
        Jump to
      </label>
      <select
        id="jump-select"
        aria-label="Jump to a moment"
        className={cn("chunky-sm bg-paper font-display text-chocolate h-9 shrink-0 rounded-full px-2 text-xs font-bold")}
        value=""
        onChange={(e) => {
          if (e.target.value) onJump(jumpViewport(e.target.value));
        }}
      >
        <option value="">Jump to…</option>
        {JUMPS.map((j) => (
          <option key={j.key} value={j.key}>
            {j.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Which navigator segment the view centre falls in (for the scale badge). */
export function eraAt(ago: number): string {
  const s = SEGMENTS.find((x) => ago <= x.from && ago > x.to) ?? SEGMENTS[SEGMENTS.length - 1];
  return s.label;
}

export { yearsAgo };
