/**
 * Level-of-detail placement for timeline markers.
 *
 * Given the entries in view, decide which get a marker at the current zoom.
 * Higher importance wins; anything that would collide with an already-placed
 * marker in the same lane is culled and counted, so zooming in reveals it.
 * This is what makes "empty-looking" stretches of time worth exploring.
 */
import type { TimelineEntry } from "./types";
import { xFor, spanOf, type Viewport } from "./time";

export interface PlacedMarker {
  entry: TimelineEntry;
  x: number;
  /** Right edge for spans (civilizations, lifetimes); equals x for moments. */
  x2: number;
  lane: number;
  /** Number of hidden neighbours folded into this marker. */
  hidden: number;
  /** Pixels of free space to the next marker in the same lane (for labels). */
  room: number;
}

const LANE_BY_KIND: Record<string, number> = {
  event: 0,
  extinction: 0,
  discovery: 0,
  invention: 1,
  artwork: 1,
  place: 1,
  organism: 2,
  person: 2,
  civilization: 3,
};

export function laneFor(kind: string): number {
  return LANE_BY_KIND[kind] ?? 0;
}

export function placeMarkers(entries: TimelineEntry[], v: Viewport, width: number, minGapPx = 34): PlacedMarker[] {
  const span = spanOf(v);
  const visible = entries.filter((e) => {
    if (e.kind === "era") return false;
    if (e.min_span_years !== null && span > e.min_span_years) return false;
    const x = xFor(e.start_year, v, width);
    const x2 = e.end_year !== null ? xFor(e.end_year, v, width) : e.is_ongoing ? width : x;
    return x2 >= -minGapPx && x <= width + minGapPx;
  });

  // Priority: importance, then earlier entries, then stable slug order.
  visible.sort((a, b) => b.importance - a.importance || a.start_year - b.start_year || a.slug.localeCompare(b.slug));

  const placed: PlacedMarker[] = [];
  for (const entry of visible) {
    const x = xFor(entry.start_year, v, width);
    const x2 = entry.end_year !== null ? xFor(entry.end_year, v, width) : entry.is_ongoing ? width : x;
    const lane = laneFor(entry.kind);
    const clash = placed.find((p) => p.lane === lane && x < p.x2 + minGapPx && x2 > p.x - minGapPx);
    if (clash) {
      clash.hidden += 1;
      continue;
    }
    placed.push({ entry, x, x2, lane, hidden: 0, room: Infinity });
  }
  // Room for a label: distance to the next marker in the same lane.
  const byLane = new Map<number, PlacedMarker[]>();
  for (const p of placed) byLane.set(p.lane, [...(byLane.get(p.lane) ?? []), p]);
  for (const lane of byLane.values()) {
    lane.sort((a, b) => a.x - b.x);
    for (let i = 0; i < lane.length; i++) {
      lane[i].room = i + 1 < lane.length ? lane[i + 1].x - lane[i].x2 : Infinity;
    }
  }
  return placed;
}

/** Era bands visible at this zoom: level 0 always, deeper levels once they are wide enough to read. */
export function visibleEras(entries: TimelineEntry[], v: Viewport, width: number, minWidthPx = 48) {
  return entries
    .filter((e) => e.kind === "era")
    .map((e) => {
      const x = xFor(e.start_year, v, width);
      const x2 = e.is_ongoing || e.end_year === null ? width : xFor(e.end_year, v, width);
      return { entry: e, x: Math.max(x, -4), x2: Math.min(x2, width + 4) };
    })
    .filter((b) => b.x2 > 0 && b.x < width && (b.entry.level === 0 || b.x2 - b.x >= minWidthPx));
}
