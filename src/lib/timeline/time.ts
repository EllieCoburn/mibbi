/**
 * Pure time math for the Mibbi Timeline. No React, no DOM, fully unit-tested.
 *
 * Years: negative numbers are BCE years as written (-753 = 753 BCE). The viewport is
 * expressed in "years ago" relative to PRESENT so that zooming towards
 * today is natural: [older, newer] with older > newer.
 */
export const PRESENT_YEAR = 2026;
export const UNIVERSE_AGE = 13_800_000_000;

/** Widest allowed view: a little older than the universe, a little past today. */
export const MAX_OLDER = UNIVERSE_AGE * 1.04;
export const MIN_NEWER = -6; // 6 years "into the future" so the You Are Here marker has room
export const MIN_SPAN = 12; // years: the tightest zoom

export interface Viewport {
  /** Years ago at the left edge (larger number). */
  older: number;
  /** Years ago at the right edge (smaller number). */
  newer: number;
}

export const FULL_VIEW: Viewport = { older: MAX_OLDER, newer: MIN_NEWER };

export function yearsAgo(year: number): number {
  return PRESENT_YEAR - year;
}

export function yearFromAgo(ago: number): number {
  return PRESENT_YEAR - ago;
}

export function spanOf(v: Viewport): number {
  return v.older - v.newer;
}

/** Fraction 0..1 across the viewport for a year (may be <0 or >1 when off-screen). */
export function fractionFor(year: number, v: Viewport): number {
  const ago = yearsAgo(year);
  return (v.older - ago) / spanOf(v);
}

/** Pixel x for a year given the viewport and the width in pixels. */
export function xFor(year: number, v: Viewport, width: number): number {
  return fractionFor(year, v) * width;
}

/** Year at a pixel x. */
export function yearAtX(x: number, v: Viewport, width: number): number {
  const ago = v.older - (x / width) * spanOf(v);
  return yearFromAgo(ago);
}

/** Keeps the viewport inside the universe and above the minimum span. */
export function clampViewport(v: Viewport): Viewport {
  let { older, newer } = v;
  // Enforce the minimum span around the centre first.
  if (older - newer < MIN_SPAN) {
    const mid = (older + newer) / 2;
    older = mid + MIN_SPAN / 2;
    newer = mid - MIN_SPAN / 2;
  }
  // Slide back inside the universe, preserving the span where possible.
  if (newer < MIN_NEWER) {
    older += MIN_NEWER - newer;
    newer = MIN_NEWER;
  }
  if (older > MAX_OLDER) {
    newer -= older - MAX_OLDER;
    older = MAX_OLDER;
  }
  // If the span is wider than the universe, pin both edges.
  if (newer < MIN_NEWER) newer = MIN_NEWER;
  return { older, newer };
}

/**
 * Zooms by `factor` (>1 zooms in) around the point `anchorFraction` (0..1)
 * so the year under the cursor stays put.
 */
export function zoomViewport(v: Viewport, factor: number, anchorFraction: number): Viewport {
  const span = spanOf(v);
  const anchorAgo = v.older - anchorFraction * span;
  const newSpan = span / factor;
  return clampViewport({ older: anchorAgo + anchorFraction * newSpan, newer: anchorAgo - (1 - anchorFraction) * newSpan });
}

/** Pans by a fraction of the current span (positive = towards the past). */
export function panViewport(v: Viewport, fraction: number): Viewport {
  const delta = fraction * spanOf(v);
  return clampViewport({ older: v.older + delta, newer: v.newer + delta });
}

/** A viewport that fits [startYear, endYear] with padding on each side. */
export function fitViewport(startYear: number, endYear: number, padding = 0.15): Viewport {
  const a = yearsAgo(Math.min(startYear, endYear));
  const b = yearsAgo(Math.max(startYear, endYear));
  const span = Math.max(a - b, MIN_SPAN);
  return clampViewport({ older: a + span * padding, newer: b - span * padding });
}

/** A viewport centred on a single moment, sized relative to its distance from today. */
export function focusViewport(year: number, spanOverride?: number): Viewport {
  const ago = Math.max(yearsAgo(year), 0);
  const span = spanOverride ?? Math.max(MIN_SPAN * 4, ago * 0.6);
  return clampViewport({ older: ago + span / 2, newer: ago - span / 2 });
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const fmt = (n: number, digits = 1) => {
  const s = n.toFixed(digits);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
};

/** "13.8 billion years ago", "66 million years ago", "3200 BCE", "1215", "today". */
export function formatYear(year: number, opts: { short?: boolean } = {}): string {
  const ago = yearsAgo(year);
  const { short } = opts;
  if (year >= PRESENT_YEAR) return short ? "now" : "today";
  if (ago >= 1e9) return `${fmt(ago / 1e9)} ${short ? "bya" : "billion years ago"}`;
  if (ago >= 1e6) return `${fmt(ago / 1e6)} ${short ? "mya" : "million years ago"}`;
  if (ago >= 12_000) {
    // Round to 2 significant figures above 100,000 years, 3 below, so
    // "300,000 years ago" does not become "302,026 years ago".
    const sig = ago >= 100_000 ? 2 : 3;
    const rounded = Number(ago.toPrecision(sig));
    return `${rounded.toLocaleString()} ${short ? "ya" : "years ago"}`;
  }
  if (year <= 0) return `${Math.max(1, Math.round(-year)).toLocaleString()} BCE`;
  if (year < 1000) return `${Math.round(year)} CE`;
  return `${Math.round(year)}`;
}

/** "about 66 million years", "3,000 years", "12 years". */
export function formatDuration(years: number): string {
  const y = Math.abs(years);
  if (y >= 1e9) return `${fmt(y / 1e9)} billion years`;
  if (y >= 1e6) return `${fmt(y / 1e6)} million years`;
  if (y >= 10_000) return `${Math.round(y / 1000).toLocaleString()},000 years`;
  if (y >= 2) return `${Math.round(y).toLocaleString()} years`;
  return "about a year";
}

/** A friendly "when" line for an entry. */
export function formatWhen(startYear: number, endYear: number | null, isOngoing: boolean): string {
  if (isOngoing) return `${formatYear(startYear)} to today`;
  if (endYear === null || endYear === startYear) return formatYear(startYear);
  return `${formatYear(startYear)} to ${formatYear(endYear)}`;
}

// ---------------------------------------------------------------------------
// Axis ticks
// ---------------------------------------------------------------------------

/** Picks a "nice" tick interval in years for a span, aiming for ~targetCount ticks. */
export function niceTickInterval(span: number, targetCount = 8): number {
  const raw = span / targetCount;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const candidates = [1, 2, 2.5, 5, 10].map((m) => m * mag);
  return candidates.find((c) => c >= raw) ?? candidates[candidates.length - 1];
}

export interface Tick {
  year: number;
  label: string;
  major: boolean;
}

/**
 * Tick label with enough digits that neighbouring ticks read differently:
 * at a 10,000-year interval inside deep time, "438.31 mya" not "438.3 mya".
 */
export function formatTickLabel(year: number, interval: number): string {
  const ago = yearsAgo(year);
  const unit = ago >= 1e9 ? 1e9 : ago >= 1e6 ? 1e6 : 0;
  if (unit === 0) return formatYear(year, { short: true });
  const digits = Math.min(6, Math.max(0, Math.ceil(-Math.log10(interval / unit))));
  const suffix = unit === 1e9 ? "bya" : "mya";
  return `${(ago / unit).toFixed(digits)} ${suffix}`;
}

/** Ticks (in years) across a viewport, labelled with formatTickLabel. */
export function ticksFor(v: Viewport, targetCount = 8): Tick[] {
  const interval = niceTickInterval(spanOf(v), targetCount);
  const startYear = yearFromAgo(v.older);
  const endYear = yearFromAgo(v.newer);
  const first = Math.ceil(startYear / interval) * interval;
  const out: Tick[] = [];
  for (let y = first; y <= endYear + 1e-9; y += interval) {
    const year = Math.abs(y) < 1e-9 ? 0 : y;
    out.push({ year, label: formatTickLabel(year, interval), major: Math.round(year / interval) % 5 === 0 });
    if (out.length > 60) break;
  }
  return out;
}

/** Human label for the scale, e.g. "100 px ≈ 1 million years". */
export function scaleLabel(v: Viewport, width: number, px = 100): string {
  const years = (spanOf(v) / width) * px;
  return `${px} px ≈ ${formatDuration(years)}`;
}

/** Which named jump is closest to the current view (for highlighting chips). */
export const JUMPS: Array<{ key: string; label: string; year: number; span?: number }> = [
  { key: "universe", label: "Big Bang", year: -13_800_000_000, span: UNIVERSE_AGE * 1.04 },
  { key: "earth", label: "Earth forms", year: -4_540_000_000, span: 5.2e9 },
  { key: "life", label: "First life", year: -3_700_000_000, span: 4.2e9 },
  { key: "cambrian", label: "Complex life", year: -541_000_000, span: 6.4e8 },
  { key: "dinos", label: "Dinosaurs", year: -160_000_000, span: 2.2e8 },
  { key: "humans", label: "First humans", year: -300_000, span: 4e5 },
  { key: "farming", label: "Farming", year: -9500, span: 14_000 },
  { key: "civ", label: "First cities", year: -3500, span: 6000 },
  { key: "y1", label: "1 CE", year: 1, span: 1200 },
  { key: "y1000", label: "1000", year: 1000, span: 600 },
  { key: "y1500", label: "1500", year: 1500, span: 320 },
  { key: "y1800", label: "1800", year: 1800, span: 140 },
  { key: "y1900", label: "1900", year: 1900, span: 90 },
  { key: "today", label: "Today", year: PRESENT_YEAR, span: 120 },
];

export function jumpViewport(key: string): Viewport {
  const j = JUMPS.find((x) => x.key === key) ?? JUMPS[0];
  if (j.key === "universe") return FULL_VIEW;
  if (j.key === "today") return clampViewport({ older: (j.span ?? 120) - 6, newer: MIN_NEWER });
  const ago = yearsAgo(j.year);
  const span = j.span ?? Math.max(MIN_SPAN * 4, ago * 0.6);
  return clampViewport({ older: ago + span * 0.55, newer: ago - span * 0.45 });
}

/** Serialises a viewport for the URL (?from=..&to=.. in years ago). */
export function viewportToParams(v: Viewport): { from: string; to: string } {
  return { from: v.older.toPrecision(9), to: v.newer.toPrecision(9) };
}

export function viewportFromParams(from: string | null, to: string | null): Viewport | null {
  if (!from || !to) return null;
  const older = Number(from);
  const newer = Number(to);
  if (!Number.isFinite(older) || !Number.isFinite(newer) || older <= newer) return null;
  return clampViewport({ older, newer });
}

// ---------------------------------------------------------------------------
// Scale modes and the colour of time
// ---------------------------------------------------------------------------

export type ScaleMode = "cosmic" | "earth" | "life" | "humanity" | "civilizations" | "centuries" | "decades";

/** Which "layer" of the story the current zoom is showing. */
export function scaleModeFor(span: number): ScaleMode {
  if (span > 3e9) return "cosmic";
  if (span > 3e8) return "earth";
  if (span > 2e6) return "life";
  if (span > 15_000) return "humanity";
  if (span > 900) return "civilizations";
  if (span > 60) return "centuries";
  return "decades";
}

export const SCALE_LABEL: Record<ScaleMode, string> = {
  cosmic: "Cosmic time",
  earth: "Earth history",
  life: "The story of life",
  humanity: "Humanity",
  civilizations: "Civilizations",
  centuries: "Centuries",
  decades: "Years",
};

/**
 * The river of time changes colour as it flows: cosmic indigo → molten
 * Earth → ocean → green life → dinosaur green → mammal ochre → human peach →
 * civilization gold → modern terracotta. Stops are in years-ago (log spaced).
 */
export const RIVER_STOPS: Array<{ ago: number; color: string; sky: string }> = [
  { ago: 1.38e10, color: "#4a3d6b", sky: "#2f2a4d" },
  { ago: 4.6e9, color: "#8e8bc2", sky: "#4a3d6b" },
  { ago: 4.4e9, color: "#c8553d", sky: "#7a3a2c" },
  { ago: 3.8e9, color: "#7e9bc2", sky: "#5f7fa8" },
  { ago: 6e8, color: "#9fc6e0", sky: "#7e9bc2" },
  { ago: 3.5e8, color: "#8fae8b", sky: "#a9c8e6" },
  { ago: 2e8, color: "#7fa36b", sky: "#b9d3c4" },
  { ago: 6.6e7, color: "#f2a65a", sky: "#cfe3f2" },
  { ago: 3e5, color: "#f7a8a0", sky: "#dfe8f0" },
  { ago: 1.2e4, color: "#e3b341", sky: "#fbf3e6" },
  { ago: 500, color: "#e0685a", sky: "#fbe7a1" },
  { ago: 0, color: "#c8553d", sky: "#fbf3e6" },
];

function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa
    .map((v, i) =>
      Math.round(v + (pb[i] - v) * t)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** Colour of the river (or sky) at a moment, interpolated on a log scale of years-ago. */
export function riverColorAt(ago: number, key: "color" | "sky" = "color"): string {
  const a = Math.max(ago, 1);
  const la = Math.log10(a);
  for (let i = 0; i < RIVER_STOPS.length - 1; i++) {
    const s0 = RIVER_STOPS[i];
    const s1 = RIVER_STOPS[i + 1];
    const l0 = Math.log10(Math.max(s0.ago, 1));
    const l1 = Math.log10(Math.max(s1.ago, 1));
    if (la <= l0 && la >= l1) {
      const t = l0 === l1 ? 1 : (l0 - la) / (l0 - l1);
      return mix(s0[key], s1[key], t);
    }
  }
  return RIVER_STOPS[RIVER_STOPS.length - 1][key];
}

/** Eases a viewport transition (for flights); t in 0..1. Interpolates in log space so deep→recent feels even. */
export function lerpViewport(a: Viewport, b: Viewport, t: number): Viewport {
  const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // ease in-out cubic
  const L = (x: number) => Math.log(Math.max(x + 8, 8));
  const U = (y: number) => Math.exp(y) - 8;
  return clampViewport({ older: U(L(a.older) + (L(b.older) - L(a.older)) * e), newer: U(L(a.newer) + (L(b.newer) - L(a.newer)) * e) });
}
