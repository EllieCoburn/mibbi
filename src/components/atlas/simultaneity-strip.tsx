import Link from "next/link";
import type { Region, TimelineEntry } from "@/lib/timeline/types";
import { formatDate } from "@/lib/timeline/format";
import { PRESENT_YEAR, formatYear, xFor, clampViewport, yearsAgo } from "@/lib/timeline/time";
import { Glyph } from "@/components/timeline/icons";
import { routes } from "@/lib/routes";

/**
 * "These people were all alive at the same time." Duration bands for every
 * society and long-lived thing around the chosen year, one row per region,
 * drawn to scale in a window around the moment.
 */
export function SimultaneityStrip({ year, entries, regions }: { year: number; entries: TimelineEntry[]; regions: Region[] }) {
  const spans = entries.filter((e) => e.end_year !== null || e.is_ongoing);
  if (spans.length === 0) return null;
  const halfWindow = Math.max(300, yearsAgo(year) * 0.25);
  const view = clampViewport({ older: yearsAgo(year) + halfWindow, newer: yearsAgo(year) - halfWindow });
  const W = 1000;
  const rows = regions.map((r) => ({ region: r, items: spans.filter((e) => (e.region_slug ?? "earth") === r.slug) })).filter((r) => r.items.length > 0);
  const nowX = xFor(year, view, W);

  return (
    <section aria-labelledby="sim-heading" className="chunky bg-paper rounded-3xl p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="sim-heading" className="font-display text-chocolate text-xl font-bold">
          Alive at the same time
        </h2>
        <p className="text-ink-soft text-xs">
          {formatYear(year - halfWindow)} to {formatYear(Math.min(year + halfWindow, PRESENT_YEAR))}, to scale
        </p>
      </div>
      <div className="mt-3 overflow-x-auto">
        <div className="relative min-w-[560px]">
          <div className="bg-brand pointer-events-none absolute inset-y-0 z-10 w-0.5" style={{ left: `${(nowX / W) * 100}%` }} aria-hidden="true" />
          <div
            className="bg-brand font-display text-paper pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ left: `${(nowX / W) * 100}%` }}
            aria-hidden="true"
          >
            {formatYear(year)}
          </div>
          <ul className="mt-6 flex flex-col gap-1.5">
            {rows.map(({ region, items }) => (
              <li key={region.slug} className="grid grid-cols-[110px_1fr] items-start gap-2">
                <span
                  className="font-display text-chocolate truncate rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: `color-mix(in oklab, ${region.color_hex} 50%, white)` }}
                >
                  {region.name}
                </span>
                <div className="relative" style={{ height: 4 + 26 * Math.min(items.length, 4) }}>
                  {items.slice(0, 4).map((e, i) => {
                    const x = Math.max(0, xFor(e.start_year, view, W));
                    const x2 = Math.min(W, e.is_ongoing ? W : xFor(e.end_year!, view, W));
                    return (
                      <Link
                        key={e.slug}
                        href={routes.entry(e.slug)}
                        title={`${e.name} · ${formatDate(e)}`}
                        className="border-chocolate font-display text-chocolate absolute flex h-6 items-center gap-1 overflow-hidden rounded-full border-2 px-1.5 text-[10px] font-bold shadow-[0_2px_0_0_var(--color-chocolate)] hover:-translate-y-0.5"
                        style={{
                          left: `${(x / W) * 100}%`,
                          width: `${Math.max(2, ((x2 - x) / W) * 100)}%`,
                          top: 2 + i * 26,
                          backgroundColor: e.color_hex ?? "#b9c9db",
                        }}
                      >
                        <Glyph name={e.icon_key} size={11} className="shrink-0" />
                        <span className="truncate">{e.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="font-display text-chocolate mt-3 text-sm font-bold">These people were all alive at the same time.</p>
    </section>
  );
}
