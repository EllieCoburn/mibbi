"use client";

/**
 * The Mibbi Timeline, second generation.
 *
 * Not a chart: a river of time you travel along. The sky and river change
 * colour with the ages, markers grow out of the river on stems, spans flow
 * beneath it as ribbons, and zooming reveals layer after layer. An era
 * navigator (not a toolbar) sits beneath; the timeline stays dominant.
 *
 * Interaction: drag / arrow keys to move, wheel / pinch / +− to zoom around
 * the cursor, tap anything to open it, "What else was happening?" to switch
 * the lanes to regions and see simultaneity, "?" mounds to dig up hidden
 * discoveries. First visit plays a short flight from the Big Bang to today.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TimelineEntry, Region, Adventure, AdventureStep } from "@/lib/timeline/types";
import type { Companion, EntryRelation } from "@/lib/data/timeline";
import {
  FULL_VIEW,
  PRESENT_YEAR,
  SCALE_LABEL,
  clampViewport,
  fitViewport,
  focusViewport,
  formatYear,
  jumpViewport,
  lerpViewport,
  panViewport,
  riverColorAt,
  scaleLabel,
  scaleModeFor,
  spanOf,
  ticksFor,
  viewportToParams,
  xFor,
  yearAtX,
  yearsAgo,
  zoomViewport,
  type Viewport,
} from "@/lib/timeline/time";
import { formatGap } from "@/lib/timeline/format";
import { placeMarkers, visibleEras, defaultLane, type PlacedMarker } from "@/lib/timeline/lod";
import { addDiscovery } from "@/lib/timeline/actions";
import { DiscoveryPanel } from "./discovery-panel";
import { WhichCameFirst } from "./which-came-first";
import { EraNavigator, eraAt } from "./era-navigator";
import { River, Stars } from "./river";
import { YouAreHere } from "./you-are-here";
import { Glyph } from "./icons";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { cn } from "@/lib/utils/cn";

export interface AdventureContext {
  slug: string;
  name: string;
  stepIndex: number;
  stepCount: number;
  stepTitle: string;
  stepText: string;
  companionLine?: string;
  nextHref: string;
}

interface Props {
  entries: TimelineEntry[];
  regions: Region[];
  relations: EntryRelation[];
  adventures: Adventure[];
  discoveredIds: string[];
  companion: Companion | null;
  signedIn: boolean;
  initialViewport: Viewport | null;
  initialFocusSlug: string | null;
  adventure: AdventureContext | null;
}

const INTRO_KEY = "mibbi.timeline.intro.v1";

export function TimelineExplorer({
  entries,
  regions,
  relations,
  adventures,
  discoveredIds,
  companion,
  signedIn,
  initialViewport,
  initialFocusSlug,
  adventure,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1200, height: 560 });
  const { width, height } = size;
  const [view, setView] = useState<Viewport>(() => {
    if (initialViewport) return initialViewport;
    if (initialFocusSlug) {
      const e = entries.find((x) => x.slug === initialFocusSlug);
      if (e) return e.end_year !== null && !e.is_ongoing ? fitViewport(e.start_year, e.end_year, 0.6) : focusViewport(e.start_year);
    }
    return FULL_VIEW;
  });
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialFocusSlug);
  const [regionMode, setRegionMode] = useState(false);
  const [game, setGame] = useState<{ a: TimelineEntry; b: TimelineEntry } | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(() => new Set(discoveredIds));
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set(discoveredIds));
  const [flightLine, setFlightLine] = useState<string | null>(null);
  const [dug, setDug] = useState<string | null>(null);

  const bySlug = useMemo(() => new Map(entries.map((e) => [e.slug, e])), [entries]);
  const selected = useMemo(() => (selectedSlug ? (bySlug.get(selectedSlug) ?? null) : null), [bySlug, selectedSlug]);
  const regionName = useCallback((slug: string | null) => regions.find((r) => r.slug === slug)?.name ?? "", [regions]);
  const regionColor = useCallback((slug: string | null) => regions.find((r) => r.slug === slug)?.color_hex ?? "#b9c9db", [regions]);

  // Measure the track.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ width: Math.max(320, e.contentRect.width), height: Math.max(420, e.contentRect.height) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Shareable URL (debounced).
  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams(window.location.search);
      const { from, to } = viewportToParams(view);
      p.set("from", from);
      p.set("to", to);
      if (selectedSlug) p.set("focus", selectedSlug);
      else p.delete("focus");
      window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
    }, 250);
    return () => clearTimeout(t);
  }, [view, selectedSlug]);

  // ---------------------------------------------------------------- flights
  const flight = useRef<number | null>(null);
  const flyTo = useCallback((target: Viewport, ms = 900, onDone?: () => void) => {
    if (flight.current) cancelAnimationFrame(flight.current);
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || ms <= 0) {
      setView(target);
      onDone?.();
      return;
    }
    const t0 = performance.now();
    let from: Viewport | null = null;
    setView((v) => (from = v));
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      setView(lerpViewport(from ?? target, target, t));
      if (t < 1) flight.current = requestAnimationFrame(step);
      else {
        flight.current = null;
        onDone?.();
      }
    };
    flight.current = requestAnimationFrame(step);
  }, []);
  const cancelFlight = () => {
    if (flight.current) {
      cancelAnimationFrame(flight.current);
      flight.current = null;
      setFlightLine(null);
    }
  };

  // First visit: a short flight from everything, to humans, to now, and back.
  useEffect(() => {
    if (initialViewport || initialFocusSlug || adventure) return;
    let seen = true;
    try {
      seen = localStorage.getItem(INTRO_KEY) === "1";
    } catch {
      /* private mode */
    }
    if (seen) return;
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* ignore */
    }
    const seq: Array<[string, Viewport, number]> = [
      ["Everything that has ever happened. All of it.", FULL_VIEW, 1400],
      ["Humans are this sliver. Watch.", jumpViewport("humans"), 2600],
      ["And here you are, right at the end.", jumpViewport("today"), 2200],
      ["Now go anywhere. Everything has a place.", FULL_VIEW, 2400],
    ];
    let i = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const run = () => {
      if (i >= seq.length) {
        setFlightLine(null);
        return;
      }
      const [line, target, ms] = seq[i++];
      setFlightLine(line);
      flyTo(target, ms, () => {
        timer = setTimeout(run, 900);
      });
    };
    timer = setTimeout(run, 400);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [adventure, flyTo, initialFocusSlug, initialViewport]);

  // ---------------------------------------------------------------- input
  const zoomAt = useCallback((factor: number, clientX?: number) => {
    const el = trackRef.current;
    let frac = 0.5;
    if (el && clientX !== undefined) {
      const r = el.getBoundingClientRect();
      frac = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    }
    setView((v) => zoomViewport(v, factor, frac));
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      cancelFlight();
      if (e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) zoomAt(Math.exp(-e.deltaY * 0.0022), e.clientX);
      else setView((v) => panViewport(v, -e.deltaX / width));
    },
    [width, zoomAt],
  );

  const drag = useRef<{ x: number; view: Viewport; moved: boolean } | null>(null);
  const pinch = useRef<{ d: number; view: Viewport; mid: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const onPointerDown = (e: React.PointerEvent) => {
    cancelFlight();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) drag.current = { x: e.clientX, view, moved: false };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.max(20, Math.abs(a.x - b.x)), view, mid: (a.x + b.x) / 2 };
      drag.current = null;
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.max(20, Math.abs(a.x - b.x));
      const r = trackRef.current!.getBoundingClientRect();
      setView(zoomViewport(pinch.current.view, d / pinch.current.d, (pinch.current.mid - r.left) / r.width));
      return;
    }
    if (drag.current) {
      const dx = e.clientX - drag.current.x;
      if (Math.abs(dx) > 3) drag.current.moved = true;
      setView(panViewport(drag.current.view, dx / width));
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) setTimeout(() => (drag.current = null), 0);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    cancelFlight();
    if (e.key === "ArrowLeft") setView((v) => panViewport(v, 0.1));
    else if (e.key === "ArrowRight") setView((v) => panViewport(v, -0.1));
    else if (e.key === "+" || e.key === "=") zoomAt(1.6);
    else if (e.key === "-" || e.key === "_") zoomAt(1 / 1.6);
    else if (e.key === "Home") flyTo(FULL_VIEW);
    else if (e.key === "End") flyTo(jumpViewport("today"));
    else if (e.key === "Escape") {
      setSelectedSlug(null);
      setRegionMode(false);
      setGame(null);
    } else return;
    e.preventDefault();
  };

  // ---------------------------------------------------------------- derived
  const span = spanOf(view);
  const mode = scaleModeFor(span);
  const centerAgo = Math.max(0, yearsAgo(yearAtX(width / 2, view, width)));
  const sky = riverColorAt(centerAgo, "sky");
  const starOpacity = Math.max(0, Math.min(1, (Math.log10(Math.max(span, 1)) - 8.5) / 1.5));
  const riverY = Math.round(height * (regionMode ? 0.3 : 0.5));
  const eras = useMemo(() => visibleEras(entries, view, width), [entries, view, width]);

  // Lanes: by importance/kind, or by region in simultaneity mode.
  const regionOrder = useMemo(() => regions.filter((r) => r.slug !== "cosmos").map((r) => r.slug), [regions]);
  const laneOf = useCallback(
    (e: TimelineEntry) => (regionMode ? 20 + Math.max(0, regionOrder.indexOf(e.region_slug ?? "earth")) : defaultLane(e)),
    [regionMode, regionOrder],
  );
  const markers = useMemo(() => placeMarkers(entries, view, width, regionMode ? 8 : 34, laneOf), [entries, view, width, regionMode, laneOf]);
  const regionsInView = useMemo(() => {
    if (!regionMode) return [];
    const present = new Set(markers.map((m) => m.entry.region_slug ?? "earth"));
    return regionOrder.filter((r) => present.has(r));
  }, [markers, regionMode, regionOrder]);
  const ticks = useMemo(() => ticksFor(view, width < 640 ? 4 : 8), [view, width]);
  const hereX = xFor(PRESENT_YEAR, view, width);

  // Geometry for a lane.
  const laneY = (lane: number): number => {
    if (lane >= 20) {
      const idx = regionsInView.indexOf(regionOrder[lane - 20]);
      return riverY + 34 + Math.max(0, idx) * 30;
    }
    if (lane >= 10) return riverY + 30 + (lane - 10) * 30;
    return riverY - 64 - lane * 58;
  };

  // ---------------------------------------------------------------- actions
  const select = (entry: TimelineEntry | null, zoomTo = false) => {
    setSelectedSlug(entry?.slug ?? null);
    setGame(null);
    if (entry && zoomTo)
      flyTo(entry.end_year !== null && !entry.is_ongoing ? fitViewport(entry.start_year, entry.end_year, 0.6) : focusViewport(entry.start_year));
  };
  const open = (slug: string) => {
    const e = bySlug.get(slug);
    if (e) select(e, true);
  };
  const midYear = (e: TimelineEntry) => (e.end_year !== null && !e.is_ongoing ? (e.start_year + e.end_year) / 2 : e.start_year);
  const neighboursOf = useCallback(
    (entry: TimelineEntry) => {
      const year = midYear(entry);
      const tol = Math.max(50, yearsAgo(year) * 0.05);
      return entries
        .filter((e) => e.kind !== "era" && e.slug !== entry.slug && !e.is_hidden)
        .filter((e) =>
          e.end_year !== null
            ? e.start_year <= year + tol && e.end_year >= year - tol
            : e.is_ongoing
              ? e.start_year <= year + tol
              : Math.abs(e.start_year - year) <= tol,
        )
        .sort((a, b) => b.importance - a.importance || (a.region_slug ?? "").localeCompare(b.region_slug ?? ""));
    },
    [entries],
  );
  const whatElse = (entry: TimelineEntry) => {
    const year = midYear(entry);
    const tol = Math.max(50, yearsAgo(year) * 0.05);
    setRegionMode(true);
    flyTo(clampViewport({ older: yearsAgo(year) + tol * 2.2, newer: yearsAgo(year) - tol * 2.2 }));
  };
  const startGame = (entry: TimelineEntry) => {
    const pool = entries.filter(
      (e) =>
        e.kind !== "era" &&
        !e.is_hidden &&
        e.slug !== entry.slug &&
        Math.abs(e.start_year - entry.start_year) > Math.max(30, yearsAgo(entry.start_year) * 0.02),
    );
    if (pool.length === 0) return;
    const other = pool[Math.floor(Math.random() * pool.length)];
    setGame(Math.random() < 0.5 ? { a: entry, b: other } : { a: other, b: entry });
    setRegionMode(false);
  };
  const dig = (entry: TimelineEntry) => {
    setRevealed((s) => new Set(s).add(entry.id));
    setDug(entry.name);
    setTimeout(() => setDug(null), 2600);
    select(entry);
    if (signedIn) void addDiscovery(entry.id, "timeline").then((r) => r.ok && setDiscovered((s) => new Set(s).add(entry.id)));
  };

  // Panel data for the selection.
  const panelData = useMemo(() => {
    if (!selected) return null;
    const important = entries.filter((e) => e.kind !== "era" && !e.is_hidden && e.importance >= 2 && e.slug !== selected.slug);
    const before = important.filter((e) => e.start_year < selected.start_year).sort((a, b) => b.start_year - a.start_year)[0] ?? null;
    const after = important.filter((e) => e.start_year > selected.start_year).sort((a, b) => a.start_year - b.start_year)[0] ?? null;
    const rels = relations
      .filter((r) => r.from_slug === selected.slug || r.to_slug === selected.slug)
      .map((r) => {
        const direction: "from" | "to" = r.from_slug === selected.slug ? "from" : "to";
        const other = bySlug.get(direction === "from" ? r.to_slug : r.from_slug);
        return other ? { other, relation: r.relation, note: r.note, direction } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    const adv =
      adventures.find(
        (a) => ((a.steps as unknown as AdventureStep[]) ?? []).some((s) => s.entry_slug === selected.slug) || a.start_entry_slug === selected.slug,
      ) ?? null;
    return { before, after, rels, adv, preview: neighboursOf(selected).slice(0, 4) };
  }, [adventures, bySlug, entries, neighboursOf, relations, selected]);

  const companionLine = useMemo(() => {
    if (flightLine) return flightLine;
    if (dug) return `I dug up ${dug}!`;
    if (regionMode) return "All of these were alive at the SAME time.";
    if (selected) {
      const a = yearsAgo(selected.start_year);
      if (selected.slug === "today") return "This is you. Everything else came first.";
      if (selected.companion_line) return selected.companion_line;
      if (a > 1e9) return `${formatGap(a)} ago. I can’t even.`;
      if (a > 1e6) return "Millions of years. No people anywhere yet.";
      return "Try “What else was happening?”";
    }
    if (span > 1e10) return "Humans are that tiny sliver on the right. Zoom in.";
    if (span > 1e8) return "Look how far humans are from the dinosaurs.";
    if (span > 1e5) return "Still no cities. Not one.";
    if (span > 3000) return "So many places busy at the same time.";
    return "Every marker is a story. Tap one.";
  }, [dug, flightLine, regionMode, selected, span]);

  const selectedMarker = markers.find((m) => m.entry.slug === selectedSlug) ?? null;

  // ---------------------------------------------------------------- render
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {adventure ? (
        <div className="border-chocolate bg-butter/70 flex flex-wrap items-center gap-3 rounded-2xl border-[3px] px-4 py-2">
          <span className="sticker bg-paper px-2 py-0.5 text-[10px]">
            Adventure · {adventure.stepIndex + 1}/{adventure.stepCount}
          </span>
          <p className="font-display text-chocolate text-sm font-bold">
            {adventure.name}: {adventure.stepTitle}
          </p>
          <p className="text-ink-soft text-sm">{adventure.stepText}</p>
          <a href={adventure.nextHref} className="toy-btn hover:toy-btn-hover active:toy-btn-press ml-auto h-9 px-4 text-xs">
            {adventure.stepIndex + 1 >= adventure.stepCount ? "Finish" : "Next step"}
          </a>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="border-chocolate bg-paper font-display text-chocolate rounded-full border-2 px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase shadow-[0_2px_0_0_var(--color-chocolate)] transition-colors">
            {regionMode ? "Same time, everywhere" : SCALE_LABEL[mode]}
          </span>
          <span className="font-display text-ink-soft text-xs font-semibold">{regionMode ? "Lanes are places" : eraAt(centerAgo)}</span>
        </div>
        <p className="text-ink-soft text-xs">Drag to travel. Scroll or pinch to zoom. Tap anything.</p>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* ===== The track ===== */}
        <div
          ref={trackRef}
          role="application"
          aria-label="The Mibbi Timeline. Arrow keys move through time, plus and minus zoom, Home shows everything, End jumps to today."
          tabIndex={0}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          onDoubleClick={(e) => zoomAt(2.2, e.clientX)}
          className="border-chocolate relative min-h-[520px] flex-1 cursor-grab touch-none overflow-hidden rounded-[1.75rem] border-[3px] select-none active:cursor-grabbing"
          style={{
            boxShadow: "0 6px 0 0 var(--color-chocolate), 0 24px 40px -20px rgb(74 46 34 / 0.5)",
            background: `linear-gradient(180deg, ${sky} 0%, color-mix(in oklab, ${sky} 45%, var(--color-cream)) 55%, var(--color-cream) 100%)`,
            transition: "background 600ms ease",
          }}
        >
          <Stars opacity={starOpacity} />

          {/* Era strata across the top */}
          <div className="absolute inset-x-0 top-0" aria-hidden="true">
            {[0, 1, 2].map((level) => (
              <div key={level} className="relative h-7" style={{ marginTop: level === 0 ? 10 : 3 }}>
                {eras
                  .filter((b) => b.entry.level === level)
                  .map((b) => {
                    const w = b.x2 - b.x;
                    return (
                      <button
                        key={b.entry.slug}
                        type="button"
                        tabIndex={-1}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!drag.current?.moved) select(b.entry, true);
                        }}
                        title={b.entry.name}
                        className={cn(
                          "font-display text-chocolate/90 absolute top-0 h-full overflow-hidden rounded-full px-2.5 text-left text-[11px] font-bold whitespace-nowrap transition-[filter] hover:brightness-105",
                          selectedSlug === b.entry.slug && "ring-brand/40 ring-4",
                        )}
                        style={{
                          left: b.x,
                          width: Math.max(w, 6),
                          backgroundColor: `color-mix(in oklab, ${b.entry.color_hex ?? "#b9c9db"} ${level === 0 ? 60 : 40}%, white)`,
                          opacity: 0.9,
                        }}
                      >
                        {w > 60 ? b.entry.name : ""}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>

          <River view={view} width={width} height={height} y={riverY} />

          {/* Region lane labels (simultaneity mode) */}
          {regionMode ? (
            <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
              {regionsInView.map((slug, i) => (
                <div
                  key={slug}
                  className="border-chocolate font-display text-chocolate absolute left-2 z-20 -translate-y-1/2 rounded-full border-2 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap shadow-[0_2px_0_0_var(--color-chocolate)]"
                  style={{ top: riverY + 34 + i * 30 + 11, backgroundColor: `color-mix(in oklab, ${regionColor(slug)} 65%, white)` }}
                >
                  {regionName(slug)}
                </div>
              ))}
              <div
                className="border-chocolate bg-paper font-display text-chocolate absolute left-1/2 -translate-x-1/2 rounded-full border-2 px-4 py-1 text-center text-sm font-bold whitespace-nowrap shadow-[0_2px_0_0_var(--color-chocolate)]"
                style={{ top: Math.min(riverY + 34 + regionsInView.length * 30 + 14, height - 90) }}
              >
                These people were all alive at the same time.
              </div>
            </div>
          ) : null}

          {/* Markers */}
          {markers.map((m) => (
            <Marker
              key={m.entry.slug}
              m={m}
              y={laneY(m.lane)}
              riverY={riverY}
              width={width}
              selected={selectedSlug === m.entry.slug}
              discovered={discovered.has(m.entry.id)}
              hidden={m.entry.is_hidden && !revealed.has(m.entry.id)}
              regionMode={regionMode}
              onSelect={() => {
                if (drag.current?.moved) return;
                if (m.entry.is_hidden && !revealed.has(m.entry.id)) dig(m.entry);
                else select(m.entry);
              }}
            />
          ))}

          {/* Companion: sits on the selected marker, otherwise bottom-left */}
          {companion ? (
            <div
              className="pointer-events-none absolute z-30 flex items-end gap-2 transition-[left,top] duration-500"
              style={
                selectedMarker
                  ? {
                      left: Math.min(Math.max(8, selectedMarker.x2 > selectedMarker.x + 10 ? selectedMarker.x : selectedMarker.x + 22), width - 310),
                      top: Math.min(Math.max(8, laneY(selectedMarker.lane) - 30), height - 120),
                    }
                  : { left: 10, top: height - 118 }
              }
            >
              <div className="animate-bob">
                <MibbiAvatar
                  name={companion.name}
                  color={companion.color}
                  shape={companion.shape}
                  personalityKey={companion.personalityKey}
                  imageUrl={companion.imageUrl}
                  size={52}
                />
              </div>
              <p className="chunky-sm bg-paper font-display text-chocolate max-w-[240px] rounded-2xl rounded-bl-sm px-3 py-1.5 text-xs font-semibold">
                {companionLine}
              </p>
            </div>
          ) : null}

          <YouAreHere
            x={hereX}
            width={width}
            height={height}
            riverY={riverY}
            near={span < 400}
            visible={hereX >= 0 && hereX <= width}
            onJump={() => flyTo(jumpViewport("today"))}
          />

          {/* Axis */}
          <div className="border-chocolate/20 bg-paper/75 absolute inset-x-0 bottom-0 h-11 border-t-2" aria-hidden="true">
            {ticks.map((t) => {
              const x = xFor(t.year, view, width);
              return (
                <div key={t.year} className="absolute top-0 -translate-x-1/2" style={{ left: x }}>
                  <div className={cn("bg-chocolate/50 mx-auto w-0.5", t.major ? "h-3" : "h-2")} />
                  <div className="font-display text-ink-soft mt-0.5 text-[10px] font-bold whitespace-nowrap sm:text-xs">{t.label}</div>
                </div>
              );
            })}
            <div className="bg-cream-deep font-display text-ink-mute absolute right-2 bottom-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
              {scaleLabel(view, width)}
            </div>
          </div>

          {/* Controls */}
          <div className="absolute top-3 right-3 z-30 flex flex-col gap-1">
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => zoomAt(1.8)}
              className="chunky-sm bg-paper font-display text-chocolate hover:bg-butter/70 size-9 rounded-full text-lg font-bold"
            >
              +
            </button>
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => zoomAt(1 / 1.8)}
              className="chunky-sm bg-paper font-display text-chocolate hover:bg-butter/70 size-9 rounded-full text-lg font-bold"
            >
              −
            </button>
            <button
              type="button"
              aria-label="Show everything"
              onClick={() => flyTo(FULL_VIEW, 1200)}
              className="chunky-sm bg-paper font-display text-chocolate hover:bg-butter/70 size-9 rounded-full text-[10px] font-bold"
            >
              All
            </button>
            {regionMode ? (
              <button
                type="button"
                onClick={() => setRegionMode(false)}
                className="chunky-sm bg-brand font-display text-paper rounded-full px-2 py-1 text-[10px] font-bold hover:brightness-110"
              >
                Back
              </button>
            ) : null}
          </div>

          <p className="sr-only" aria-live="polite">
            Viewing from {formatYear(yearAtX(0, view, width))} to {formatYear(yearAtX(width, view, width))}. {SCALE_LABEL[mode]}.
          </p>
        </div>

        {/* ===== Panel ===== */}
        {selected || game ? (
          <div className="mt-3 max-h-[52vh] overflow-y-auto lg:mt-0 lg:ml-3 lg:max-h-none lg:w-[400px] lg:shrink-0">
            {game ? (
              <WhichCameFirst
                a={game.a}
                b={game.b}
                companion={companion}
                onReveal={(a, b) => flyTo(fitViewport(Math.min(a.start_year, b.start_year), Math.max(a.start_year, b.start_year), 0.2))}
                onAgain={() => startGame(game.a)}
                onClose={() => setGame(null)}
                onOpen={(e) => select(e)}
              />
            ) : selected && panelData ? (
              <DiscoveryPanel
                entry={selected}
                regionName={regionName(selected.region_slug)}
                before={panelData.before}
                after={panelData.after}
                relations={panelData.rels}
                elsewherePreview={panelData.preview}
                adventureSlug={panelData.adv?.slug ?? null}
                adventureName={panelData.adv?.name ?? null}
                companion={companion}
                signedIn={signedIn}
                discovered={discovered.has(selected.id)}
                discoveryNumber={discovered.size}
                onDiscovered={() => setDiscovered((s) => new Set(s).add(selected.id))}
                onWhatElse={() => whatElse(selected)}
                onGame={() => startGame(selected)}
                onOpen={open}
                onClose={() => select(null)}
                onZoomTo={() => select(selected, true)}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <EraNavigator view={view} onJump={(v) => flyTo(v, 1000)} />
    </div>
  );
}

function Marker({
  m,
  y,
  riverY,
  width,
  selected,
  discovered,
  hidden,
  regionMode,
  onSelect,
}: {
  m: PlacedMarker;
  y: number;
  riverY: number;
  width: number;
  selected: boolean;
  discovered: boolean;
  hidden: boolean;
  regionMode: boolean;
  onSelect: () => void;
}) {
  const e = m.entry;
  const isSpan = m.x2 - m.x > 10;
  const color = e.color_hex ?? "#b9c9db";
  const size = e.importance >= 3 ? 34 : e.importance === 2 ? 28 : 24;
  const above = y < riverY;
  const labelRoom = isSpan ? m.x2 - m.x : Math.min(width - m.x, m.room, 170);
  const left = Math.max(-12, m.x);

  if (hidden) {
    return (
      <button
        type="button"
        onClick={(ev) => {
          ev.stopPropagation();
          onSelect();
        }}
        aria-label="Something is buried here. Dig it up."
        className="border-chocolate bg-toast font-display text-paper absolute z-10 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border-[2.5px] text-sm font-black shadow-[0_2px_0_0_var(--color-chocolate)] transition-transform hover:-translate-y-1 hover:scale-110"
        style={{ left: m.x, top: riverY - 16 }}
      >
        ?
      </button>
    );
  }

  if (isSpan) {
    return (
      <button
        type="button"
        onClick={(ev) => {
          ev.stopPropagation();
          onSelect();
        }}
        aria-label={`${e.name}, ${formatYear(e.start_year)}${m.hidden ? `, plus ${m.hidden} more nearby. Zoom in to see them.` : ""}`}
        className={cn(
          "group border-chocolate absolute z-10 flex h-6 items-center gap-1 overflow-hidden rounded-full border-[2.5px] px-1.5 text-left shadow-[0_2px_0_0_var(--color-chocolate)] transition-transform hover:z-20 hover:-translate-y-0.5",
          selected && "ring-brand/40 z-20 ring-4",
        )}
        style={{ left, top: y, width: Math.min(m.x2, width + 12) - left, backgroundColor: regionMode ? color : `color-mix(in oklab, ${color} 85%, white)` }}
      >
        <Glyph name={e.icon_key} size={12} className="text-chocolate shrink-0" />
        {labelRoom > 60 ? <span className="font-display text-chocolate truncate text-[11px] font-bold">{e.name}</span> : null}
        {discovered ? <span className="text-chocolate ml-auto shrink-0 text-[9px] font-black">✓</span> : null}
        {m.hidden > 0 ? <span className="bg-chocolate text-paper ml-auto shrink-0 rounded-full px-1 text-[9px] font-bold">+{m.hidden}</span> : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(ev) => {
        ev.stopPropagation();
        onSelect();
      }}
      aria-label={`${e.name}, ${formatYear(e.start_year)}${m.hidden ? `, plus ${m.hidden} more nearby. Zoom in to see them.` : ""}`}
      className={cn(
        "group absolute z-10 -translate-x-1/2 text-center transition-transform hover:z-20 hover:-translate-y-1 focus-visible:z-20",
        selected && "z-20",
      )}
      style={{ left: m.x, top: above ? y : y, width: size }}
    >
      {/* Stem from the river */}
      {!regionMode ? (
        <span
          aria-hidden="true"
          className="bg-chocolate/35 absolute left-1/2 w-0.5 -translate-x-1/2"
          style={above ? { top: size, height: Math.max(0, riverY - y - size) } : { bottom: size, height: Math.max(0, y - riverY) }}
        />
      ) : null}
      <span
        className={cn(
          "border-chocolate relative flex items-center justify-center rounded-full border-[2.5px] shadow-[0_3px_0_0_var(--color-chocolate)]",
          selected && "ring-brand/40 ring-4",
        )}
        style={{ width: size, height: size, backgroundColor: color, color: "var(--color-chocolate)" }}
      >
        <Glyph name={e.icon_key} size={Math.round(size * 0.55)} />
        {discovered ? (
          <span className="border-chocolate bg-butter text-chocolate absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full border-2 text-[9px] font-black">
            ✓
          </span>
        ) : null}
        {m.hidden > 0 ? (
          <span className="bg-chocolate text-paper absolute -right-2 -bottom-1.5 rounded-full px-1 text-[9px] font-bold">+{m.hidden}</span>
        ) : null}
      </span>
      {labelRoom > 84 ? (
        <span
          className={cn(
            "bg-paper/90 font-display text-chocolate absolute left-1/2 block w-max max-w-[150px] -translate-x-1/2 truncate rounded-full px-2 py-0.5 text-[11px] font-bold",
            above ? "-top-6" : "top-full mt-1",
          )}
        >
          {e.name}
        </span>
      ) : null}
    </button>
  );
}
