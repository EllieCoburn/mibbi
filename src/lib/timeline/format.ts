/**
 * Honest date formatting. Uses the entry's precision and uncertainty so the
 * UI never implies more accuracy than the evidence supports.
 *
 *   deep + uncertainty → "c. 300,000 years ago"
 *   approx range       → "c. 10,000–8,000 BCE"
 *   year               → "1215"
 *   lifetime           → "1452–1519"
 */
import { PRESENT_YEAR, formatYear, yearsAgo } from "./time";

export interface Datable {
  start_year: number;
  end_year: number | null;
  is_ongoing: boolean;
  precision: string;
  start_uncertainty?: number | null;
  end_uncertainty?: number | null;
  date_label?: string | null;
}

const isApprox = (p: string) => p === "approx" || p === "deep" || p === "century";

/** Compact year without the "ago" vocabulary, for ranges: "10,000 BCE", "1215", "66 million years". */
function bare(year: number, deep: boolean): string {
  if (deep) {
    const ago = yearsAgo(year);
    if (ago >= 1e9) return `${trim((ago / 1e9).toFixed(2))} billion`;
    if (ago >= 1e6) return `${trim((ago / 1e6).toFixed(1))} million`;
    if (ago >= 12_000) return Number(ago.toPrecision(ago >= 100_000 ? 2 : 3)).toLocaleString();
  }
  if (year <= 0) return `${Math.max(1, Math.round(-year)).toLocaleString()} BCE`;
  if (year < 1000) return `${Math.round(year)} CE`;
  return `${Math.round(year)}`;
}
const trim = (s: string) => s.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");

export function formatDate(d: Datable): string {
  if (d.date_label) return d.date_label;
  const approx = isApprox(d.precision) || (d.start_uncertainty ?? 0) > 0;
  const prefix = approx ? "c. " : "";
  const deepStart = yearsAgo(d.start_year) >= 12_000;

  if (d.is_ongoing) return `${prefix}${formatYear(d.start_year)} to today`;
  if (d.end_year === null || d.end_year === d.start_year) return `${prefix}${formatYear(d.start_year)}`;

  const deepEnd = yearsAgo(d.end_year) >= 12_000;
  if (deepStart && deepEnd) return `${prefix}${bare(d.start_year, true)} to ${bare(d.end_year, true)} years ago`;
  if (deepStart) return `${prefix}${formatYear(d.start_year)} to ${formatYear(d.end_year)}`;
  // Both calendar years: "1452–1519", "c. 3,300–1,200 BCE", "c. 800 BCE–500 CE"
  const a = bare(d.start_year, false);
  const b = bare(d.end_year, false);
  if (d.start_year <= 0 && d.end_year <= 0) return `${prefix}${a.replace(" BCE", "")}–${b}`;
  return `${prefix}${a}–${b}`;
}

/** "about 66 million years", used for gaps. */
export function formatGap(years: number): string {
  const y = Math.abs(years);
  if (y >= 1e9) return `${trim((y / 1e9).toFixed(2))} billion years`;
  if (y >= 1e6) return `${trim((y / 1e6).toFixed(1))} million years`;
  if (y >= 10_000) return `${Math.round(y / 1000).toLocaleString()},000 years`;
  if (y >= 2) return `${Math.round(y).toLocaleString()} years`;
  return "about a year";
}

/** How long something lasted, for bands: "3,000 years", "160 million years". */
export function formatDurationOf(d: Datable): string | null {
  const end = d.is_ongoing ? PRESENT_YEAR : d.end_year;
  if (end === null || end === d.start_year) return null;
  return formatGap(end - d.start_year);
}
