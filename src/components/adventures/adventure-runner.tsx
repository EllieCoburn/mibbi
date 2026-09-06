"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Adventure, AdventureStep, TimelineEntry } from "@/lib/timeline/types";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { ToyButton, ToyLink } from "@/components/ui/toy-button";
import { saveAdventureProgress } from "@/lib/timeline/actions";
import { formatYear } from "@/lib/timeline/time";
import { routes } from "@/lib/routes";

interface CompanionLite {
  name: string;
  color: string;
  shape: string;
  personalityKey: string;
  imageUrl: string | null;
}

interface Props {
  adventure: Adventure;
  steps: AdventureStep[];
  stepIndex: number;
  entries: Record<string, TimelineEntry>;
  companion: CompanionLite | null;
  signedIn: boolean;
  completed: boolean;
}

/** One step at a time: read, go there on the timeline, come back, next. */
export function AdventureRunner({ adventure, steps, stepIndex, entries, companion, signedIn, completed }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const step = steps[stepIndex];
  const entry = entries[step.entry_slug];
  const isLast = stepIndex >= steps.length - 1;
  const goHref = `${routes.timeline}?focus=${step.entry_slug}&adventure=${adventure.slug}&step=${stepIndex}`;

  const advance = () => {
    const next = stepIndex + 1;
    start(async () => {
      if (signedIn) {
        await saveAdventureProgress(
          adventure.id,
          isLast ? stepIndex : next,
          isLast,
          isLast ? steps.map((s) => entries[s.entry_slug]?.id).filter((x): x is string => !!x) : [],
        );
      }
      router.push(isLast ? `${routes.adventure(adventure.slug)}?done=1` : `${routes.adventure(adventure.slug)}?step=${next}`);
    });
  };

  return (
    <div className="chunky bg-paper rounded-3xl p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="sticker bg-butter px-2 py-0.5 text-[10px]">
          Step {stepIndex + 1} of {steps.length}
        </span>
        {completed ? <span className="sticker bg-pistachio text-paper px-2 py-0.5 text-[10px]">Completed</span> : null}
      </div>
      <h2 className="font-display text-chocolate mt-3 text-2xl font-bold sm:text-3xl">{step.title}</h2>
      <p className="text-chocolate mt-2">{step.text}</p>

      {entry ? (
        <div className="bg-cream-deep/70 mt-4 flex items-center gap-3 rounded-2xl px-4 py-3">
          <span className="border-chocolate size-4 shrink-0 rounded-full border-2" style={{ backgroundColor: entry.color_hex ?? "#b9c9db" }} />
          <div className="min-w-0">
            <p className="font-display text-chocolate truncate font-bold">{entry.name}</p>
            <p className="text-ink-soft text-xs">{formatYear(entry.start_year)}</p>
          </div>
        </div>
      ) : null}

      {companion && step.companion_line ? (
        <div className="mt-4 flex items-end gap-2">
          <MibbiAvatar
            name={companion.name}
            color={companion.color}
            shape={companion.shape}
            personalityKey={companion.personalityKey}
            imageUrl={companion.imageUrl}
            size={48}
          />
          <p className="chunky-sm bg-butter/60 font-display text-chocolate rounded-2xl rounded-bl-sm px-3 py-1.5 text-sm font-semibold">
            {step.companion_line}
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <ToyLink href={goHref} color="dusty" size="lg">
          Go there on the timeline
        </ToyLink>
        <ToyButton color={isLast ? "pistachio" : "brand"} size="lg" onClick={advance} disabled={pending}>
          {pending ? "…" : isLast ? "Finish adventure" : "Next step"}
        </ToyButton>
        {stepIndex > 0 ? (
          <ToyLink href={`${routes.adventure(adventure.slug)}?step=${stepIndex - 1}`} color="paper" size="lg">
            Back
          </ToyLink>
        ) : null}
      </div>
      {!signedIn ? <p className="text-ink-mute mt-3 text-xs">Sign in to keep your progress and add discoveries to your museum.</p> : null}
    </div>
  );
}
