"use client";

import { useMemo } from "react";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import type { Companion } from "@/lib/data/timeline";
import type { TimelineEntry } from "@/lib/timeline/types";
import { curiosityOf } from "@/lib/timeline/types";
import { formatDuration, spanOf, yearsAgo, type Viewport } from "@/lib/timeline/time";

/**
 * The Mibbi riding along in the corner. Reacts to what is selected and to
 * how far the child has zoomed. Companions warm the timeline; they never
 * lecture, so lines are short and slightly weird.
 */
export function CompanionBubble({ companion, selected, view }: { companion: Companion; selected: TimelineEntry | null; view: Viewport }) {
  const line = useMemo(() => {
    const span = spanOf(view);
    if (selected) {
      const ago = yearsAgo(selected.start_year);
      if (selected.slug === "today") return "This is you. Everything else came first.";
      if (selected.curiosity_key === companion.curiosityKey) return `Ooh. I ${curiosityOf(companion.curiosityKey).verb} this one.`;
      if (ago > 1e9) return `${formatDuration(ago)} ago. I can’t even.`;
      if (ago > 1e6) return "Millions of years. No people anywhere yet.";
      if (ago > 12_000) return "Before farming. Before towns. Big skies.";
      if (selected.end_year && selected.end_year - selected.start_year > 300) return "This lasted longer than some countries have existed.";
      return "Try “What else was happening?” I bet it’s surprising.";
    }
    if (span > 1e10) return "Humans are that tiny sliver on the right. Zoom in. Keep going.";
    if (span > 1e8) return "Dinosaurs lived here for ages. Longer than you think.";
    if (span > 1e5) return "Still no cities. Not one.";
    if (span > 3000) return "Look how many places were busy at the same time.";
    return "Every dot is a story. Tap one.";
  }, [companion, selected, view]);

  return (
    <div className="pointer-events-none absolute bottom-14 left-2 flex max-w-[260px] items-end gap-2 sm:left-3">
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
      <p className="chunky-sm bg-paper font-display text-chocolate rounded-2xl rounded-bl-sm px-3 py-1.5 text-xs font-semibold">{line}</p>
    </div>
  );
}
