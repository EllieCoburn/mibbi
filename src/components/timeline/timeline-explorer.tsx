"use client";

/**
 * The Mibbi Timeline. Proportional, zoomable, draggable, from 13.8 billion
 * years ago to right now. This is the product; everything else opens
 * from here or returns here.
 *
 * Interaction: wheel / pinch / +− to zoom around the cursor, drag or arrow
 * keys to pan, chips to jump, tap a marker to open it. Zooming reveals
 * detail: markers that would overlap are folded until there is room.
 */
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TimelineEntry, Region } from "@/lib/timeline/types";
import type { Companion } from "@/lib/data/timeline";
import {
  FULL_VIEW,
  JUMPS,
  PRESENT_YEAR,
  clampViewport,
  fitViewport,
  focusViewport,
  formatDuration,
  formatYear,
  jumpViewport,
  panViewport,
  scaleLabel,
  spanOf,
  ticksFor,
  viewportToParams,
  xFor,
  yearAtX,
  yearsAgo,
  zoomViewport,
  type Viewport,
} from "@/lib/timeline/time";
import { placeMarkers, visibleEras, type PlacedMarker } from "@/lib/timeline/lod";
import { EntryPanel } from "./entry-panel";
import { CompanionBubble } from "./companion-bubble";
import { WhichCameFirst } from "./which-came-first";
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
  discoveredIds: string[];
  companion: Companion | null;
  signedIn: boolean;
  initialViewport: Viewport | null;
  initialFocusSlug: string | null;
  adventure: AdventureContext | null;
}

const LANE_HEIGHT = 44;
const LANES = 4;

export function TimelineExplorer({ entries, regions, discoveredIds, companion, signedIn, initialViewport, initialFocusSlug, adventure }: Props) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);
  const [view, setView] = useState<Viewport>(() => {
    if (initialViewport) return initialViewport;
    if (initialFocusSlug) {
      const e = entries.find((x) => x.slug === initialFocusSlug);
      if (e) return e.end_year !== null && !e.is_ongoing ? fitViewport(e.start_year, e.end_year, 0.6) : focusViewport(e.start_year);
    }
    return FULL_VIEW;
  });
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialFocusSlug);
  const [elsewhere, setElsewhere] = useState<TimelineEntry[] | null>(null);
  const [game, setGame] = useState<{ a: TimelineEntry; b: TimelineEntry } | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(() => new Set(discoveredIds));
  const [, startTransition] = useTransition();

  const selected = useMemo(() => entries.find((e) => e.slug === selectedSlug) ?? null, [entries, selectedSlug]);
  const bySlug = useMemo(() => new Map(entries.map((e) => [e.slug, e])), [entries]);
  const regionName = useCallback((slug: string | null) => regions.find((r) => r.slug === slug)?.name ?? "", [regions]);

  // Measure the track.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(320, entry.contentRect.width)));
    ro.observe(el);
    setWidth(Math.max(320, el.clientWidth));
    return () => ro.disconnect();
  }, []);

  // Keep the URL shareable (debounced, no history spam).
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
      if (e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const factor = Math.exp(-e.deltaY * 0.0022);
        zoomAt(factor, e.clientX);
      } else {
        setView((v) => panViewport(v, -e.deltaX / width));
      }
    },
    [width, zoomAt],
  );

  const drag = useRef<{ x: number; view: Viewport; moved: boolean } | null>(null);
  const pinch = useRef<{ d: number; view: Viewport; mid: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) drag.current = { x: e.clientX, view, moved: false };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.abs(a.x - b.x), view, mid: (a.x + b.x) / 2 };
      drag.current = null;
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.max(20, Math.abs(a.x - b.x));
      const el = trackRef.current!.getBoundingClientRect();
      const frac = (pinch.current.mid - el.left) / el.width;
      setView(zoomViewport(pinch.current.view, d / pinch.current.d, frac));
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
    if (pointers.current.size === 0) drag.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setView((v) => panViewport(v, 0.1));
    else if (e.key === "ArrowRight") setView((v) => panViewport(v, -0.1));
    else if (e.key === "+" || e.key === "=") zoomAt(1.6);
    else if (e.key === "-" || e.key === "_") zoomAt(1 / 1.6);
    else if (e.key === "Home") setView(FULL_VIEW);
    else if (e.key === "End") setView(jumpViewport("today"));
    else if (e.key === "Escape") {
      setSelectedSlug(null);
      setElsewhere(null);
      setGame(null);
    } else return;
    e.preventDefault();
  };

  // ---------------------------------------------------------------- derived
  const eras = useMemo(() => visibleEras(entries, view, width), [entries, view, width]);
  const markers = useMemo(() => placeMarkers(entries, view, width), [entries, view, width]);
  const ticks = useMemo(() => ticksFor(view, width < 640 ? 4 : 8), [view, width]);
  const hereX = xFor(PRESENT_YEAR, view, width);
  const hereVisible = hereX >= 0 && hereX <= width;
  const activeJump = useMemo(() => {
    const span = spanOf(view);
    const mid = yearAtX(width / 2, view, width);
    return JUMPS.reduce(
      (best, j) => {
        const score = Math.abs(Math.log((j.span ?? 100) / span)) + Math.abs(yearsAgo(j.year) - yearsAgo(mid)) / span;
        return score < best.score ? { key: j.key, score } : best;
      },
      { key: "", score: Infinity },
    ).key;
  }, [view, width]);

  // ---------------------------------------------------------------- actions
  const select = (entry: TimelineEntry | null, zoomTo = false) => {
    setSelectedSlug(entry?.slug ?? null);
    setElsewhere(null);
    setGame(null);
    if (entry && zoomTo) {
      setView(entry.end_year !== null && !entry.is_ongoing ? fitViewport(entry.start_year, entry.end_year, 0.6) : focusViewport(entry.start_year));
    }
  };

  const whatElse = (entry: TimelineEntry) => {
    const year = entry.end_year !== null && !entry.is_ongoing ? (entry.start_year + entry.end_year) / 2 : entry.start_year;
    const tol = Math.max(50, yearsAgo(year) * 0.05);
    const others = entries
      .filter((e) => e.kind !== "era" && e.slug !== entry.slug)
      .filter((e) => {
        if (e.end_year !== null) return e.start_year <= year + tol && e.end_year >= year - tol;
        if (e.is_ongoing) return e.start_year <= year + tol;
        return Math.abs(e.start_year - year) <= tol;
      })
      .sort((a, b) => (a.region_slug ?? "").localeCompare(b.region_slug ?? "") || b.importance - a.importance);
    setElsewhere(others);
    setView(clampViewport({ older: yearsAgo(year) + tol * 2.2, newer: yearsAgo(year) - tol * 2.2 }));
  };

  const startGame = (entry: TimelineEntry) => {
    const pool = entries.filter(
      (e) => e.kind !== "era" && e.slug !== entry.slug && Math.abs(e.start_year - entry.start_year) > Math.max(30, yearsAgo(entry.start_year) * 0.02),
    );
    if (pool.length === 0) return;
    const other = pool[Math.floor(Math.random() * pool.length)];
    setGame(Math.random() < 0.5 ? { a: entry, b: other } : { a: other, b: entry });
    setElsewhere(null);
  };

  const revealGap = (a: TimelineEntry, b: TimelineEntry) => {
    setView(fitViewport(Math.min(a.start_year, b.start_year), Math.max(a.start_year, b.start_year), 0.2));
  };

  const markDiscovered = (id: string) => setDiscovered((s) => new Set(s).add(id));

  // ---------------------------------------------------------------- render
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Jump chips */}
      <div className="flex [scrollbar-width:none] items-center gap-2 overflow-x-auto px-3 py-2 sm:px-4" role="toolbar" aria-label="Jump through time">
        {JUMPS.map((j) => (
          <button
            key={j.key}
            type="button"
            onClick={() => startTransition(() => setView(jumpViewport(j.key)))}
            className={cn(
              "chunky-sm font-display shrink-0 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition-colors",
              activeJump === j.key ? "bg-brand text-paper" : "bg-paper text-chocolate hover:bg-butter/70",
            )}
          >
            {j.label}
          </button>
        ))}
      </div>

      {/* Adventure banner */}
      {adventure ? (
        <div className="border-chocolate bg-butter/70 mx-3 mb-2 flex flex-wrap items-center gap-3 rounded-2xl border-[3px] px-4 py-2 sm:mx-4">
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

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* The track */}
        <div
          ref={trackRef}
          role="application"
          aria-label="The Mibbi Timeline. Use arrow keys to move through time, plus and minus to zoom, Home for the whole story, End for today."
          tabIndex={0}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          onDoubleClick={(e) => zoomAt(2.2, e.clientX)}
          className="border-chocolate from-sky/60 via-paper to-cream relative min-h-[420px] flex-1 cursor-grab touch-none overflow-hidden rounded-3xl border-[3px] bg-gradient-to-b select-none active:cursor-grabbing"
          style={{ boxShadow: "0 5px 0 0 var(--color-chocolate)" }}
        >
          {/* Era bands */}
          <div className="absolute inset-x-0 top-0" aria-hidden="true">
            {[0, 1, 2].map((level) => (
              <div key={level} className="relative h-8 sm:h-9" style={{ marginTop: level === 0 ? 8 : 4 }}>
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
                          "border-chocolate/70 font-display text-chocolate absolute top-0 h-full overflow-hidden rounded-full border-2 px-2 text-left text-[11px] font-bold whitespace-nowrap transition-[filter] hover:brightness-105 sm:text-xs",
                          selectedSlug === b.entry.slug && "ring-brand/40 ring-4",
                        )}
                        style={{
                          left: b.x,
                          width: Math.max(w, 6),
                          backgroundColor: `color-mix(in oklab, ${b.entry.color_hex ?? "#b9c9db"} ${level === 0 ? 70 : 45}%, white)`,
                        }}
                      >
                        {w > 56 ? b.entry.name : ""}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>

          {/* Markers */}
          <div className="absolute inset-x-0" style={{ top: 132 }}>
            {markers.map((m) => (
              <Marker
                key={m.entry.slug}
                m={m}
                selected={selectedSlug === m.entry.slug}
                discovered={discovered.has(m.entry.id)}
                width={width}
                onSelect={() => select(m.entry)}
              />
            ))}
          </div>

          {/* You are here */}
          {hereVisible ? (
            <div className="pointer-events-none absolute inset-y-0" style={{ left: hereX }} aria-hidden="true">
              <div className="border-brand h-full w-0.5 border-l-2 border-dashed" />
              <div className="border-chocolate bg-brand font-display text-paper absolute top-1/2 left-2 -translate-y-1/2 -rotate-90 rounded-full border-2 px-2 py-0.5 text-[10px] font-bold tracking-wide whitespace-nowrap uppercase">
                You are here
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setView(jumpViewport("today"))}
              className="border-chocolate bg-brand font-display text-paper shadow-soft absolute top-1/2 right-2 -translate-y-1/2 rounded-full border-2 px-3 py-1 text-[11px] font-bold uppercase"
            >
              You are here →
            </button>
          )}

          {/* Axis */}
          <div className="border-chocolate/30 bg-paper/80 absolute inset-x-0 bottom-0 h-12 border-t-2" aria-hidden="true">
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

          {/* Zoom controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
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
              aria-label="Show the whole story"
              onClick={() => setView(FULL_VIEW)}
              className="chunky-sm bg-paper font-display text-chocolate hover:bg-butter/70 size-9 rounded-full text-xs font-bold"
            >
              All
            </button>
          </div>

          {/* Live region for screen readers */}
          <p className="sr-only" aria-live="polite">
            Viewing from {formatYear(yearAtX(0, view, width))} to {formatYear(yearAtX(width, view, width))}, a span of {formatDuration(spanOf(view))}.
          </p>

          {companion ? <CompanionBubble companion={companion} selected={selected} view={view} /> : null}
        </div>

        {/* Side / bottom panel */}
        {selected || game ? (
          <div className="mt-3 max-h-[46vh] overflow-y-auto lg:mt-0 lg:ml-3 lg:max-h-none lg:w-[380px] lg:shrink-0">
            {game ? (
              <WhichCameFirst
                a={game.a}
                b={game.b}
                companion={companion}
                onReveal={revealGap}
                onAgain={() => startGame(game.a)}
                onClose={() => setGame(null)}
                onOpen={(e) => select(e)}
              />
            ) : selected ? (
              <EntryPanel
                entry={selected}
                regionName={regionName(selected.region_slug)}
                related={entries.filter((e) => e.parent_slug === selected.slug).slice(0, 6)}
                elsewhere={elsewhere}
                companion={companion}
                signedIn={signedIn}
                discovered={discovered.has(selected.id)}
                onDiscovered={() => markDiscovered(selected.id)}
                onWhatElse={() => whatElse(selected)}
                onGame={() => startGame(selected)}
                onOpen={(slug) => {
                  const e = bySlug.get(slug);
                  if (e) select(e, true);
                }}
                onClose={() => select(null)}
                onZoomTo={() => select(selected, true)}
                onAtlas={() => router.push(`/atlas?year=${Math.round(selected.start_year)}`)}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Marker({
  m,
  selected,
  discovered,
  width,
  onSelect,
}: {
  m: PlacedMarker;
  selected: boolean;
  discovered: boolean;
  width: number;
  onSelect: () => void;
}) {
  const e = m.entry;
  const isSpan = m.x2 - m.x > 10;
  const top = m.lane * LANE_HEIGHT;
  const color = e.color_hex ?? "#b9c9db";
  const labelRoom = isSpan ? m.x2 - m.x : Math.min(width - m.x, m.room, 160);
  return (
    <button
      type="button"
      onClick={(ev) => {
        ev.stopPropagation();
        onSelect();
      }}
      aria-label={`${e.name}, ${formatYear(e.start_year)}${m.hidden ? `, plus ${m.hidden} more nearby. Zoom in to see them.` : ""}`}
      className={cn(
        "group absolute flex items-center gap-1.5 rounded-full text-left transition-transform hover:z-20 hover:-translate-y-0.5 focus-visible:z-20",
        selected && "z-20",
      )}
      style={{ left: Math.max(-12, m.x), top, height: LANE_HEIGHT - 8, width: isSpan ? Math.min(m.x2, width + 12) - Math.max(-12, m.x) : undefined }}
    >
      <span
        className={cn(
          "border-chocolate flex h-7 shrink-0 items-center rounded-full border-[2.5px] px-1 shadow-[0_2px_0_0_var(--color-chocolate)]",
          isSpan ? "w-full" : "w-7 justify-center",
          selected && "ring-brand/40 ring-4",
        )}
        style={{ backgroundColor: color }}
      >
        {isSpan && labelRoom > 70 ? <span className="font-display text-chocolate truncate px-1 text-[11px] font-bold">{e.name}</span> : null}
        {discovered ? (
          <span className="border-chocolate bg-butter text-chocolate absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full border-2 text-[9px] font-black">
            ✓
          </span>
        ) : null}
      </span>
      {!isSpan && labelRoom > 90 ? (
        <span className="bg-paper/90 font-display text-chocolate max-w-[140px] truncate rounded-full px-2 py-0.5 text-[11px] font-bold opacity-90 group-hover:opacity-100">
          {e.name}
        </span>
      ) : null}
      {m.hidden > 0 ? <span className="bg-chocolate text-paper absolute -bottom-1 left-5 rounded-full px-1.5 text-[9px] font-bold">+{m.hidden}</span> : null}
    </button>
  );
}

export { LANES };
