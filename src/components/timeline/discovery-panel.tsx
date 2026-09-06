"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { TimelineEntry } from "@/lib/timeline/types";
import { curiosityOf } from "@/lib/timeline/types";
import type { Companion } from "@/lib/data/timeline";
import { formatGap, formatDate, formatDurationOf } from "@/lib/timeline/format";
import { yearsAgo } from "@/lib/timeline/time";
import { addDiscovery } from "@/lib/timeline/actions";
import { ToyButton, ToyLink } from "@/components/ui/toy-button";
import { Glyph, CATEGORY_LABEL } from "./icons";
import { routes } from "@/lib/routes";

export interface Relation {
  from_slug: string;
  to_slug: string;
  relation: string;
  note: string | null;
}

interface Props {
  entry: TimelineEntry;
  regionName: string;
  before: TimelineEntry | null;
  after: TimelineEntry | null;
  relations: Array<{ other: TimelineEntry; relation: string; note: string | null; direction: "from" | "to" }>;
  elsewherePreview: TimelineEntry[];
  adventureSlug: string | null;
  adventureName: string | null;
  companion: Companion | null;
  signedIn: boolean;
  discovered: boolean;
  discoveryNumber: number;
  onDiscovered: () => void;
  onWhatElse: () => void;
  onGame: () => void;
  onOpen: (slug: string) => void;
  onClose: () => void;
  onZoomTo: () => void;
}

const REL_LABEL: Record<string, string> = {
  led_to: "led to",
  caused: "caused",
  overlapped: "overlapped with",
  part_of: "was part of",
  inspired: "inspired",
  ended: "ended",
};

/**
 * A collectible discovery card: illustrated header, honest date, where, why,
 * what came before and after, what else was happening, and the actions.
 */
export function DiscoveryPanel(p: Props) {
  const { entry, companion } = p;
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const color = entry.color_hex ?? "#b9c9db";
  const ago = yearsAgo(entry.start_year);
  const noticed = companion && entry.curiosity_key === companion.curiosityKey;
  const duration = formatDurationOf(entry);

  const keep = () => {
    start(async () => {
      const r = await addDiscovery(entry.id, "timeline");
      if (r.ok) {
        p.onDiscovered();
        setMessage("Kept. It has a place in your museum now.");
      } else setMessage("Couldn’t save that. Try again.");
    });
  };

  return (
    <section aria-label={entry.name} className="chunky bg-paper overflow-hidden rounded-[1.75rem]">
      {/* Illustrated header */}
      <div
        className="relative px-5 pt-5 pb-4"
        style={{ background: `linear-gradient(160deg, color-mix(in oklab, ${color} 55%, white), color-mix(in oklab, ${color} 18%, var(--color-paper)))` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="sticker bg-paper text-chocolate px-2 py-0.5 text-[10px]">{p.discovered ? `Discovery #${p.discoveryNumber}` : "Discovery"}</span>
            <span className="sticker text-chocolate px-2 py-0.5 text-[10px]" style={{ backgroundColor: `color-mix(in oklab, ${color} 45%, white)` }}>
              {CATEGORY_LABEL[entry.category] ?? entry.category}
            </span>
          </div>
          <button
            type="button"
            onClick={p.onClose}
            aria-label="Close"
            className="chunky-sm bg-paper font-display text-chocolate hover:bg-butter/70 size-8 shrink-0 rounded-full text-sm font-bold"
          >
            ✕
          </button>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div
            className="border-chocolate flex size-16 shrink-0 items-center justify-center rounded-full border-[3px] shadow-[0_4px_0_0_var(--color-chocolate)]"
            style={{ backgroundColor: color, color: "var(--color-chocolate)" }}
          >
            <Glyph name={entry.icon_key} size={32} />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-chocolate text-2xl leading-tight font-bold">{entry.name}</h2>
            {entry.tagline ? <p className="font-display text-chocolate/80 mt-0.5 text-sm font-semibold">{entry.tagline}</p> : null}
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        {/* When / where */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={p.onZoomTo}
            className="chunky-sm bg-cream font-display text-chocolate hover:bg-butter/70 rounded-full px-3 py-1 text-sm font-bold"
            title="Zoom to this on the timeline"
          >
            {formatDate(entry)}
          </button>
          {duration ? <span className="text-ink-soft text-xs font-semibold">lasted {duration}</span> : null}
          {ago > 0 && entry.slug !== "today" ? <span className="text-ink-soft text-xs font-semibold">· {formatGap(ago)} before you</span> : null}
        </div>
        {entry.where_text || p.regionName ? (
          <p className="text-chocolate mt-2 flex items-center gap-1.5 text-sm">
            <Glyph name="globe" size={14} className="text-ink-mute shrink-0" />
            {entry.where_text ?? p.regionName}
          </p>
        ) : null}

        {entry.what ? <p className="text-chocolate mt-3 text-sm leading-relaxed">{entry.what}</p> : null}
        {entry.why ? (
          <div className="bg-cream mt-3 rounded-2xl px-3 py-2">
            <p className="font-display text-ink-mute text-[10px] font-bold tracking-wider uppercase">Why it matters</p>
            <p className="text-chocolate text-sm">{entry.why}</p>
          </div>
        ) : null}

        {companion && (noticed || entry.companion_line) ? (
          <p className="bg-butter/50 font-display text-chocolate mt-3 rounded-2xl rounded-bl-sm px-3 py-2 text-sm font-semibold">
            <span className="text-ink-mute">{companion.name}:</span> {entry.companion_line ?? `I ${curiosityOf(companion.curiosityKey).verb} this one.`}
          </p>
        ) : null}

        {/* Signature action */}
        <div className="mt-4">
          <ToyButton color="dusty" size="lg" className="w-full" onClick={p.onWhatElse}>
            What else was happening?
          </ToyButton>
          {p.elsewherePreview.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {p.elsewherePreview.map((e) => (
                <li key={e.slug}>
                  <button
                    type="button"
                    onClick={() => p.onOpen(e.slug)}
                    className="chunky-sm bg-paper font-display text-chocolate hover:bg-butter/70 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                  >
                    <span className="size-2 rounded-full" style={{ backgroundColor: e.color_hex ?? "#b9c9db" }} />
                    {e.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Before / after */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            ["Before this", p.before],
            ["After this", p.after],
          ].map(([label, e]) => (
            <div key={label as string} className="bg-cream rounded-2xl p-2.5">
              <p className="font-display text-ink-mute text-[10px] font-bold tracking-wider uppercase">{label as string}</p>
              {e ? (
                <button type="button" onClick={() => p.onOpen((e as TimelineEntry).slug)} className="hover:text-brand mt-1 flex items-center gap-1.5 text-left">
                  <Glyph name={(e as TimelineEntry).icon_key} size={14} className="shrink-0" />
                  <span className="font-display text-chocolate text-xs leading-tight font-bold">{(e as TimelineEntry).name}</span>
                </button>
              ) : (
                <p className="text-ink-mute mt-1 text-xs">Nothing yet</p>
              )}
            </div>
          ))}
        </div>

        {p.relations.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-1">
            {p.relations.slice(0, 4).map((r, i) => (
              <li key={i} className="text-chocolate text-xs">
                <button type="button" onClick={() => p.onOpen(r.other.slug)} className="hover:text-brand text-left">
                  {r.direction === "from" ? (
                    <>
                      This <strong>{REL_LABEL[r.relation] ?? r.relation}</strong> <strong>{r.other.name}</strong>
                    </>
                  ) : (
                    <>
                      <strong>{r.other.name}</strong> <strong>{REL_LABEL[r.relation] ?? r.relation}</strong> this
                    </>
                  )}
                  {r.note ? <span className="text-ink-soft"> · {r.note}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {p.adventureSlug ? (
            <ToyLink href={routes.adventure(p.adventureSlug)} color="butter">
              Take an adventure: {p.adventureName}
            </ToyLink>
          ) : null}
          <ToyButton color="butter" onClick={p.onGame}>
            Which came first?
          </ToyButton>
          <ToyLink href={`${routes.atlas}?year=${Math.round(entry.start_year)}`} color="paper">
            See the world then
          </ToyLink>
          {p.discovered ? (
            <ToyLink href={routes.museum} color="pistachio">
              In your museum ✓
            </ToyLink>
          ) : p.signedIn ? (
            <ToyButton color="pistachio" onClick={keep} disabled={pending}>
              {pending ? "Saving…" : "Add to my museum"}
            </ToyButton>
          ) : (
            <ToyLink href={`${routes.login}?next=${encodeURIComponent(routes.entry(entry.slug))}`} color="pistachio">
              Sign in to keep it
            </ToyLink>
          )}
        </div>
        {message ? <p className="text-ink-soft mt-2 text-xs">{message}</p> : null}
        <p className="text-ink-mute mt-3 text-[11px]">
          <Link href={`${routes.atlas}?year=${Math.round(entry.start_year)}`} className="hover:text-brand underline">
            Open the Atlas at this moment
          </Link>
        </p>
      </div>
    </section>
  );
}
