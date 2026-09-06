import type { Metadata } from "next";
import { TimelineExplorer, type AdventureContext } from "@/components/timeline/timeline-explorer";
import { getAdventureBySlug, getAdventures, getCompanion, getRegions, getRelations, getTimelineEntries, getUserDiscoveries } from "@/lib/data/timeline";
import { getCurrentUser } from "@/lib/data/profile";
import { viewportFromParams } from "@/lib/timeline/time";
import type { AdventureStep } from "@/lib/timeline/types";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "The Mibbi Timeline",
  description: "Travel from the beginning of the universe to right now, and discover where everything fits.",
};

export const dynamic = "force-dynamic";

export default async function TimelinePage({ searchParams }: PageProps<"/timeline">) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : null);

  const user = await getCurrentUser();
  const [entries, regions, relations, adventures, discoveries, companion] = await Promise.all([
    getTimelineEntries(),
    getRegions(),
    getRelations(),
    getAdventures(),
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
      <h1 className="font-display text-chocolate mb-1 px-1 text-2xl font-bold sm:text-3xl">The story of everything</h1>
      <div className="min-h-0 flex-1">
        <TimelineExplorer
          entries={entries}
          regions={regions}
          relations={relations}
          adventures={adventures}
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
