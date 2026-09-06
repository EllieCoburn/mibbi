import type { Metadata } from "next";
import Link from "next/link";
import { WorldMap } from "@/components/atlas/world-map";
import { AtlasTimeControl } from "@/components/atlas/time-control";
import { ToyLink } from "@/components/ui/toy-button";
import { getEntriesAroundYear, getRegions, getTimelineEntries } from "@/lib/data/timeline";
import { PRESENT_YEAR, formatYear, viewportToParams, focusViewport } from "@/lib/timeline/time";
import { formatDate } from "@/lib/timeline/format";
import { SimultaneityStrip } from "@/components/atlas/simultaneity-strip";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Mibbi Atlas", description: "Pick a moment and see the whole world at once." };
export const dynamic = "force-dynamic";

/**
 * TIME → what the world looked like then (pins with counts, list by region).
 * PLACE → what happened there across time (region column, sorted).
 * Same entries as the timeline; the Atlas is another way of looking at it.
 */
export default async function AtlasPage({ searchParams }: PageProps<"/atlas">) {
  const sp = await searchParams;
  const yearParam = Number(typeof sp.year === "string" ? sp.year : NaN);
  const year = Number.isFinite(yearParam) ? yearParam : 1200;
  const regionSlug = typeof sp.region === "string" ? sp.region : null;

  const [regions, around, all] = await Promise.all([getRegions(), getEntriesAroundYear(year), getTimelineEntries()]);
  const byRegion = new Map<string, typeof around>();
  for (const e of around) {
    const k = e.region_slug ?? "earth";
    byRegion.set(k, [...(byRegion.get(k) ?? []), e]);
  }
  const hrefFor = (slug: string | null) => `${routes.atlas}?year=${Math.round(year)}${slug ? `&region=${slug}` : ""}`;
  const pins = regions.map((r) => ({
    region: r,
    count: byRegion.get(r.slug)?.length ?? 0,
    href: hrefFor(regionSlug === r.slug ? null : r.slug),
    active: regionSlug === r.slug,
  }));
  const region = regions.find((r) => r.slug === regionSlug) ?? null;
  const placeHistory = region ? all.filter((e) => e.region_slug === region.slug && e.kind !== "era").sort((a, b) => a.start_year - b.start_year) : [];
  const v = focusViewport(year);
  const timelineHref = `${routes.timeline}?from=${viewportToParams(v).from}&to=${viewportToParams(v).to}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-4">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="font-display text-chocolate text-2xl font-bold sm:text-3xl">Mibbi Atlas</h1>
          <p className="text-ink-soft text-sm">Pick a moment. See who was busy, everywhere, at the same time.</p>
        </div>
        <ToyLink href={timelineHref} color="dusty">
          Open this moment on the timeline
        </ToyLink>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <AtlasTimeControl year={year} region={regionSlug} />
          <WorldMap pins={pins} caption={`Around ${formatYear(year)} · ${around.length} things happening`} />
          <SimultaneityStrip year={year} entries={around} regions={regions} />
        </div>

        <aside className="chunky bg-paper flex max-h-[70vh] flex-col overflow-hidden rounded-3xl">
          {region ? (
            <>
              <div className="border-chocolate border-b-[3px] px-4 py-3">
                <p className="font-display text-ink-mute text-xs font-bold tracking-wider uppercase">Place · across all time</p>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-chocolate text-xl font-bold">{region.name}</h2>
                  <Link href={hrefFor(null)} className="text-brand text-xs font-semibold underline">
                    Back to the moment
                  </Link>
                </div>
              </div>
              <ol className="flex-1 overflow-y-auto p-2">
                {placeHistory.map((e) => (
                  <li key={e.slug}>
                    <Link href={routes.entry(e.slug)} className="hover:bg-cream-deep flex items-center gap-2 rounded-xl px-2 py-1.5">
                      <span className="border-chocolate size-3 shrink-0 rounded-full border-2" style={{ backgroundColor: e.color_hex ?? "#b9c9db" }} />
                      <span className="min-w-0 flex-1">
                        <span className="font-display text-chocolate block truncate text-sm font-bold">{e.name}</span>
                        <span className="text-ink-soft block text-xs">{formatDate(e)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <div className="border-chocolate border-b-[3px] px-4 py-3">
                <p className="font-display text-ink-mute text-xs font-bold tracking-wider uppercase">Time · everywhere at once</p>
                <h2 className="font-display text-chocolate text-xl font-bold">Around {formatYear(year)}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {around.length === 0 ? (
                  <p className="text-ink-soft p-3 text-sm">Nothing on the timeline near this moment yet. Try a different year.</p>
                ) : (
                  regions
                    .filter((r) => byRegion.has(r.slug))
                    .map((r) => (
                      <section key={r.slug} className="mb-3">
                        <h3 className="font-display px-2 text-xs font-bold tracking-wider uppercase" style={{ color: r.color_hex }}>
                          {r.name}
                        </h3>
                        <ul>
                          {byRegion.get(r.slug)!.map((e) => (
                            <li key={e.slug}>
                              <Link href={routes.entry(e.slug)} className="hover:bg-cream-deep flex items-center gap-2 rounded-xl px-2 py-1.5">
                                <span
                                  className="border-chocolate size-3 shrink-0 rounded-full border-2"
                                  style={{ backgroundColor: e.color_hex ?? "#b9c9db" }}
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="font-display text-chocolate block truncate text-sm font-bold">{e.name}</span>
                                  <span className="text-ink-soft block text-xs">{formatDate(e)}</span>
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))
                )}
              </div>
            </>
          )}
        </aside>
      </div>
      <p className="text-ink-mute mt-3 px-1 text-xs">Today is {PRESENT_YEAR}. Every pin is a place on Earth where something on the timeline was happening.</p>
    </div>
  );
}
