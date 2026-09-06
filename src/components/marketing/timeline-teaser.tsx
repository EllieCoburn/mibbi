import { ToyLink } from "@/components/ui/toy-button";
import { FULL_VIEW, clampViewport, xFor } from "@/lib/timeline/time";
import { routes } from "@/lib/routes";

/**
 * A proportional strip. The point: human history is the sliver on the
 * right. Three nested zooms make the scale of time visible on the homepage
 * before anyone touches the real timeline.
 */
const STRIPS = [
  {
    label: "13.8 billion years",
    view: FULL_VIEW,
    bands: [
      ["Universe", -13.8e9, 2026, "#4a3d6b"],
      ["Earth", -4.54e9, 2026, "#c98a4b"],
      ["Life", -3.7e9, 2026, "#8fae8b"],
      ["Dinosaurs", -233e6, -66e6, "#7fa36b"],
    ],
    note: "Everything humans have ever done fits in the thin line at the right edge.",
  },
  {
    label: "300,000 years of humans",
    view: clampViewport({ older: 320_000, newer: -6 }),
    bands: [
      ["Stone tools, fire, art", -300000, -9700, "#c98a4b"],
      ["Farming", -9700, -3500, "#8fae8b"],
      ["Cities", -3500, 2026, "#e3b341"],
    ],
    note: "Cities and writing fit in the sliver at the right edge of this one.",
  },
  {
    label: "6,000 years of cities",
    view: clampViewport({ older: 6_000, newer: -6 }),
    bands: [
      ["Bronze Age", -3300, -1200, "#e3b341"],
      ["Iron Age", -1200, -500, "#7a635a"],
      ["Classical", -800, 500, "#f6d68a"],
      ["Medieval", 500, 1500, "#b7a9d6"],
      ["Modern", 1500, 2026, "#e0685a"],
    ],
    note: "Dinosaurs would be 11 kilometres to the left at this scale.",
  },
] as const;

export function TimelineTeaser() {
  const W = 1000;
  return (
    <section aria-labelledby="teaser-heading" className="bg-paper py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 id="teaser-heading" className="text-4xl sm:text-5xl">
            A timeline you can play with
          </h2>
          <p className="font-display text-ink-soft mt-2 text-lg">Time is drawn to scale. That is the whole idea.</p>
        </div>
        <div className="mt-10 flex flex-col gap-4">
          {STRIPS.map((s) => (
            <figure key={s.label} className="chunky-sm bg-cream rounded-2xl p-3 sm:p-4">
              <figcaption className="font-display text-chocolate text-sm font-bold">{s.label}</figcaption>
              <svg viewBox={`0 0 ${W} 54`} className="mt-2 block w-full" role="img" aria-label={`${s.label}. ${s.note}`}>
                <rect x="0" y="12" width={W} height="30" rx="15" fill="var(--color-cream-deep)" />
                {s.bands.map(([name, a, b, color]) => {
                  const x = Math.max(0, xFor(a, s.view, W));
                  const x2 = Math.min(W, xFor(b, s.view, W));
                  return (
                    <g key={name}>
                      <rect x={x} y="12" width={Math.max(2, x2 - x)} height="30" rx="15" fill={color} opacity="0.85" />
                      {x2 - x > 90 ? (
                        <text x={x + 12} y="32" fontFamily="var(--font-display)" fontWeight="700" fontSize="13" fill="#fff">
                          {name}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
                <line x1={xFor(2026, s.view, W)} y1="4" x2={xFor(2026, s.view, W)} y2="50" stroke="var(--color-brand)" strokeWidth="3" strokeDasharray="4 4" />
              </svg>
              <p className="text-ink-soft mt-1 text-xs">{s.note}</p>
            </figure>
          ))}
        </div>
        <div className="mt-8 text-center">
          <ToyLink href={routes.timeline} size="lg">
            Open the timeline
          </ToyLink>
        </div>
      </div>
    </section>
  );
}
