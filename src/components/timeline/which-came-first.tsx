"use client";

import { useState, useTransition } from "react";
import type { TimelineEntry } from "@/lib/timeline/types";
import type { Companion } from "@/lib/data/timeline";
import { formatDuration, formatYear } from "@/lib/timeline/time";
import { recordConceptSignal } from "@/lib/timeline/actions";
import { ToyButton } from "@/components/ui/toy-button";

interface Props {
  a: TimelineEntry;
  b: TimelineEntry;
  companion: Companion | null;
  onReveal: (a: TimelineEntry, b: TimelineEntry) => void;
  onAgain: () => void;
  onClose: () => void;
  onOpen: (e: TimelineEntry) => void;
}

/**
 * Which came first? Two things, one tap. The answer is the timeline itself:
 * on reveal the view zooms to fit both so the real gap is visible.
 * Records a quiet concept signal; never shows a score.
 */
export function WhichCameFirst({ a, b, companion, onReveal, onAgain, onClose, onOpen }: Props) {
  const [picked, setPicked] = useState<TimelineEntry | null>(null);
  const [, start] = useTransition();
  const first = a.start_year <= b.start_year ? a : b;
  const second = first === a ? b : a;
  const gap = Math.abs(a.start_year - b.start_year);
  const correct = picked === first;

  const choose = (e: TimelineEntry) => {
    setPicked(e);
    onReveal(a, b);
    start(() => {
      void recordConceptSignal("ordering", e === first, { a: a.slug, b: b.slug, gap });
    });
  };

  return (
    <section aria-label="Which came first?" className="chunky bg-butter/50 rounded-3xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-ink-mute text-xs font-bold tracking-wider uppercase">Timeline play</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="chunky-sm bg-paper font-display text-chocolate hover:bg-butter/70 size-8 rounded-full text-sm font-bold"
        >
          ✕
        </button>
      </div>
      <h2 className="font-display text-chocolate mt-1 text-2xl font-bold">Which came first?</h2>

      <div className="mt-4 grid gap-3">
        {[a, b].map((e) => {
          const isFirst = e === first;
          const state = picked ? (isFirst ? "win" : "lose") : "idle";
          return (
            <button
              key={e.slug}
              type="button"
              disabled={!!picked}
              onClick={() => choose(e)}
              className="chunky-sm bg-paper flex items-center gap-3 rounded-2xl p-3 text-left transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-default"
              style={
                state === "win"
                  ? { backgroundColor: "color-mix(in oklab, var(--color-pistachio) 40%, white)" }
                  : state === "lose"
                    ? { opacity: 0.75 }
                    : undefined
              }
            >
              <span className="border-chocolate size-5 shrink-0 rounded-full border-2" style={{ backgroundColor: e.color_hex ?? "#b9c9db" }} />
              <span className="min-w-0 flex-1">
                <span className="font-display text-chocolate block font-bold">{e.name}</span>
                {picked ? (
                  <span className="text-ink-soft block text-xs">{formatYear(e.start_year)}</span>
                ) : (
                  <span className="text-ink-soft block text-xs">{e.tagline}</span>
                )}
              </span>
              {picked && isFirst ? <span className="sticker bg-pistachio text-paper px-2 py-0.5 text-[10px]">First</span> : null}
            </button>
          );
        })}
      </div>

      {picked ? (
        <div className="bg-paper text-chocolate mt-4 rounded-2xl p-3 text-sm">
          <p className="font-display font-bold">{correct ? "Yes!" : "Not quite."}</p>
          <p className="mt-1">
            <strong>{first.name}</strong> came first, about <strong>{formatDuration(gap)}</strong> before <strong>{second.name}</strong>. Look at the timeline
            to see the gap.
          </p>
          {companion ? (
            <p className="text-ink-soft mt-2 text-xs">
              {companion.name}: {correct ? "I knew you knew." : "Huh. I would have guessed the same as you."}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <ToyButton color="butter" onClick={onAgain}>
              Another
            </ToyButton>
            <ToyButton color="paper" onClick={() => onOpen(first)}>
              Open {first.name}
            </ToyButton>
          </div>
        </div>
      ) : (
        <p className="text-ink-soft mt-3 text-xs">Tap the one you think happened earlier.</p>
      )}
    </section>
  );
}
