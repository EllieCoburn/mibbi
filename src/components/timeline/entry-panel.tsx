"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { TimelineEntry } from "@/lib/timeline/types";
import { curiosityOf } from "@/lib/timeline/types";
import type { Companion } from "@/lib/data/timeline";
import { formatDuration, formatWhen, formatYear, yearsAgo } from "@/lib/timeline/time";
import { addDiscovery } from "@/lib/timeline/actions";
import { ToyButton, ToyLink } from "@/components/ui/toy-button";
import { routes } from "@/lib/routes";

const KIND_LABEL: Record<string, string> = {
  era: "Era",
  event: "Event",
  organism: "Living thing",
  civilization: "Civilization",
  person: "Person",
  invention: "Invention",
  artwork: "Art",
  discovery: "Discovery",
  place: "Place",
  extinction: "Extinction",
};

interface Props {
  entry: TimelineEntry;
  regionName: string;
  related: TimelineEntry[];
  elsewhere: TimelineEntry[] | null;
  companion: Companion | null;
  signedIn: boolean;
  discovered: boolean;
  onDiscovered: () => void;
  onWhatElse: () => void;
  onGame: () => void;
  onOpen: (slug: string) => void;
  onClose: () => void;
  onZoomTo: () => void;
  onAtlas: () => void;
}

/** WHAT / WHEN / WHERE / WHY IT MATTERS, plus the signature actions. */
export function EntryPanel({
  entry,
  regionName,
  related,
  elsewhere,
  companion,
  signedIn,
  discovered,
  onDiscovered,
  onWhatElse,
  onGame,
  onOpen,
  onClose,
  onZoomTo,
  onAtlas,
}: Props) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const ago = yearsAgo(entry.start_year);
  const noticed = companion && entry.curiosity_key === companion.curiosityKey;

  const keep = () => {
    start(async () => {
      const r = await addDiscovery(entry.id, "timeline");
      if (r.ok) {
        onDiscovered();
        setMessage("Added to your museum.");
      } else setMessage("Couldn’t save that. Try again.");
    });
  };

  return (
    <section aria-label={entry.name} className="chunky bg-paper rounded-3xl p-4 sm:p-5" style={{ borderColor: entry.color_hex ?? undefined }}>
      <div className="flex items-start justify-between gap-2">
        <span className="sticker px-2 py-0.5 text-[10px]" style={{ backgroundColor: `color-mix(in oklab, ${entry.color_hex ?? "#b9c9db"} 45%, white)` }}>
          {KIND_LABEL[entry.kind] ?? entry.kind}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="chunky-sm bg-paper font-display text-chocolate hover:bg-butter/70 size-8 rounded-full text-sm font-bold"
        >
          ✕
        </button>
      </div>

      <h2 className="font-display text-chocolate mt-2 text-2xl leading-tight font-bold">{entry.name}</h2>
      {entry.tagline ? <p className="font-display text-brand mt-1 text-base">{entry.tagline}</p> : null}

      {noticed ? (
        <p className="bg-butter/50 text-chocolate mt-3 rounded-2xl px-3 py-2 text-sm">
          <strong className="font-display">{companion.name}</strong> {curiosityOf(companion.curiosityKey).verb} this.
        </p>
      ) : null}

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="font-display text-ink-mute text-xs font-bold tracking-wider uppercase">When</dt>
        <dd className="text-chocolate">
          <button type="button" onClick={onZoomTo} className="hover:text-brand font-semibold underline decoration-dotted underline-offset-2">
            {formatWhen(entry.start_year, entry.end_year, entry.is_ongoing)}
          </button>
          {ago > 0 && entry.slug !== "today" ? <span className="text-ink-soft"> · {formatDuration(ago)} before you</span> : null}
        </dd>
        {regionName || entry.where_text ? (
          <>
            <dt className="font-display text-ink-mute text-xs font-bold tracking-wider uppercase">Where</dt>
            <dd className="text-chocolate">{entry.where_text ?? regionName}</dd>
          </>
        ) : null}
        {entry.what ? (
          <>
            <dt className="font-display text-ink-mute text-xs font-bold tracking-wider uppercase">What</dt>
            <dd className="text-chocolate">{entry.what}</dd>
          </>
        ) : null}
        {entry.why ? (
          <>
            <dt className="font-display text-ink-mute text-xs font-bold tracking-wider uppercase">Why it matters</dt>
            <dd className="text-chocolate">{entry.why}</dd>
          </>
        ) : null}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <ToyButton color="dusty" onClick={onWhatElse}>
          What else was happening?
        </ToyButton>
        <ToyButton color="butter" onClick={onGame}>
          Which came first?
        </ToyButton>
        <ToyButton color="paper" onClick={onAtlas}>
          See the world then
        </ToyButton>
        {discovered ? (
          <ToyLink href={routes.museum} color="pistachio">
            In your museum ✓
          </ToyLink>
        ) : signedIn ? (
          <ToyButton color="pistachio" onClick={keep} disabled={pending}>
            {pending ? "Saving…" : "Add to my museum"}
          </ToyButton>
        ) : (
          <ToyLink href={`${routes.login}?next=${encodeURIComponent(routes.entry(entry.slug))}`} color="pistachio">
            Sign in to keep it
          </ToyLink>
        )}
      </div>
      {message ? <p className="text-ink-soft mt-2 text-sm">{message}</p> : null}

      {elsewhere ? (
        <div className="mt-5">
          <h3 className="font-display text-ink-mute text-sm font-bold tracking-wider uppercase">Meanwhile, around {formatYear(entry.start_year)}</h3>
          {elsewhere.length === 0 ? (
            <p className="text-ink-soft mt-2 text-sm">Nothing else on your timeline yet. Zoom in and explore, or come back as the story grows.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {elsewhere.slice(0, 12).map((e) => (
                <li key={e.slug}>
                  <button
                    type="button"
                    onClick={() => onOpen(e.slug)}
                    className="hover:bg-cream-deep flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left"
                  >
                    <span className="border-chocolate size-3 shrink-0 rounded-full border-2" style={{ backgroundColor: e.color_hex ?? "#b9c9db" }} />
                    <span className="min-w-0 flex-1">
                      <span className="font-display text-chocolate block truncate text-sm font-bold">{e.name}</span>
                      <span className="text-ink-soft block text-xs">
                        {e.where_text ?? e.region_slug} · {formatYear(e.start_year)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {related.length > 0 ? (
        <div className="mt-5">
          <h3 className="font-display text-ink-mute text-sm font-bold tracking-wider uppercase">Inside this era</h3>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {related.map((r) => (
              <li key={r.slug}>
                <button
                  type="button"
                  onClick={() => onOpen(r.slug)}
                  className="chunky-sm bg-paper font-display text-chocolate hover:bg-butter/70 rounded-full px-2.5 py-1 text-xs font-bold"
                >
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-ink-mute mt-4 text-xs">
        <Link href={`${routes.atlas}?year=${Math.round(entry.start_year)}`} className="hover:text-brand underline">
          Open the Atlas at this moment
        </Link>
      </p>
    </section>
  );
}
