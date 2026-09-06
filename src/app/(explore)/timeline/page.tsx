import type { Metadata } from "next";
import { TimelineExplorer, type AdventureContext } from "@/components/timeline/timeline-explorer";
import { getAdventureBySlug, getCompanion, getRegions, getTimelineEntries, getUserDiscoveries } from "@/lib/data/timeline";
import { getCurrentUser } from "@/lib/data/profile";
import { viewportFromParams } from "@/lib/timeline/time";
import type { AdventureStep } from "@/lib/timeline/types";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "The Mibbi Timeline",
  description: "Explore the story of everything, from the first stars to right now.",
};

export const dynamic = "force-dynamic";

export default async function TimelinePage({ searchParams }: PageProps<"/timeline">) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : null);

  const user = await getCurrentUser();
  const [entries, regions, discoveries, companion] = await Promise.all([
    getTimelineEntries(),
    getRegions(),
    getUserDiscoveries(user?.id ?? null),
    getCompanion(user?.id ?? null),
  ]);

  let adventure: AdventureContext | null = null;
  const advSlug = str("adventure");
  if (advSlug) {
    const adv = await getAdventureBySlug(advSlug);
    const steps = (adv?.steps ?? []) as unknown as AdventureStep[];
    const i = Math.min(Math.max(Number(str("step") ?? 0), 0), Math.max(steps.length - 1, 0));
    if (adv && steps[i]) {
      adventure = {
        slug: adv.slug,
        name: adv.name,
        stepIndex: i,
        stepCount: steps.length,
        stepTitle: steps[i].title,
        stepText: steps[i].text,
        companionLine: steps[i].companion_line,
        nextHref: `${routes.adventure(adv.slug)}?step=${i + 1}`,
      };
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 sm:px-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 px-1">
        <h1 className="font-display text-chocolate text-2xl font-bold sm:text-3xl">The story of everything</h1>
        <p className="text-ink-soft text-sm">Drag to move. Scroll or pinch to zoom. Tap anything.</p>
      </div>
      <div className="min-h-0 flex-1">
        <TimelineExplorer
          entries={entries}
          regions={regions}
          discoveredIds={discoveries.map((d) => d.entry_id)}
          companion={companion}
          signedIn={user !== null}
          initialViewport={viewportFromParams(str("from"), str("to"))}
          initialFocusSlug={str("focus")}
          adventure={adventure}
        />
      </div>
    </div>
  );
}
