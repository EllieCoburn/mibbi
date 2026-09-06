/**
 * The child's own timeline: three nested strips (the universe, the human
 * story, the age of cities) with era bands and a dot for every discovery.
 * Nesting shows the scale: each strip is a zoom into the sliver on the right
 * of the one above it.
 */
import type { TimelineEntry } from "@/lib/timeline/types";
import { FULL_VIEW, clampViewport, formatYear, xFor, type Viewport } from "@/lib/timeline/time";

const STRIPS: Array<{ label: string; view: Viewport; caption: string }> = [
  { label: "The universe", view: FULL_VIEW, caption: "13.8 billion years. Humans are the sliver at the right edge." },
  { label: "The human story", view: clampViewport({ older: 320_000, newer: -6 }), caption: "300,000 years. Cities are the sliver at the right edge." },
  { label: "The age of cities", view: clampViewport({ older: 6_000, newer: -6 }), caption: "6,000 years of writing, kingdoms and machines." },
];

export function PersonalTimeline({ entries, discoveredIds }: { entries: TimelineEntry[]; discoveredIds: Set<string> }) {
  const eras = entries.filter((e) => e.kind === "era" && e.level <= 1);
  const found = entries.filter((e) => discoveredIds.has(e.id));
  const W = 1000;

  return (
    <div className="flex flex-col gap-4">
      {STRIPS.map((s, i) => {
        const dots = found.filter((e) => e.kind !== "era" && xFor(e.start_year, s.view, W) >= 0 && xFor(e.start_year, s.view, W) <= W);
        const bands = eras.filter((e) => e.level === (i === 0 ? 0 : 1));
        return (
          <figure key={s.label} className="chunky-sm bg-paper rounded-2xl p-3">
            <figcaption className="flex items-baseline justify-between gap-2">
              <span className="font-display text-chocolate text-sm font-bold">{s.label}</span>
              <span className="text-ink-soft text-xs">
                {dots.length} {dots.length === 1 ? "discovery" : "discoveries"}
              </span>
            </figcaption>
            <svg viewBox={`0 0 ${W} 70`} className="mt-2 block w-full" role="img" aria-label={`${s.label}: ${s.caption}`}>
              <rect x="0" y="18" width={W} height="26" rx="13" fill="var(--color-cream-deep)" />
              {bands.map((e) => {
                const x = Math.max(0, xFor(e.start_year, s.view, W));
                const x2 = Math.min(W, e.is_ongoing || e.end_year === null ? W : xFor(e.end_year, s.view, W));
                if (x2 - x < 2) return null;
                const explored = found.some((f) => f.start_year >= e.start_year && f.start_year <= (e.end_year ?? 2026));
                return <rect key={e.slug} x={x} y="18" width={x2 - x} height="26" rx="13" fill={e.color_hex ?? "#b9c9db"} opacity={explored ? 0.9 : 0.3} />;
              })}
              {dots.map((e) => (
                <g key={e.slug}>
                  <circle cx={xFor(e.start_year, s.view, W)} cy="31" r="7" fill={e.color_hex ?? "#b9c9db"} stroke="var(--color-chocolate)" strokeWidth="2.5" />
                </g>
              ))}
              <line x1={xFor(2026, s.view, W)} y1="8" x2={xFor(2026, s.view, W)} y2="60" stroke="var(--color-brand)" strokeWidth="3" strokeDasharray="4 4" />
              <text
                x={xFor(2026, s.view, W) - 8}
                y="66"
                textAnchor="end"
                fontFamily="var(--font-display)"
                fontWeight="700"
                fontSize="11"
                fill="var(--color-brand)"
              >
                you are here
              </text>
              <text x="4" y="66" fontFamily="var(--font-display)" fontWeight="700" fontSize="11" fill="var(--color-ink-mute)">
                {formatYear(2026 - s.view.older)}
              </text>
            </svg>
            <p className="text-ink-soft mt-1 text-xs">{s.caption}</p>
          </figure>
        );
      })}
    </div>
  );
}
