import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdventureRunner } from "@/components/adventures/adventure-runner";
import { ToyLink } from "@/components/ui/toy-button";
import { getCurrentUser } from "@/lib/data/profile";
import { getActiveCharacters } from "@/lib/data/characters";
import { getAdventureBySlug, getOwnedCharacterSlugs, getTimelineEntries, getUserAdventureProgress } from "@/lib/data/timeline";
import type { AdventureStep, TimelineEntry } from "@/lib/timeline/types";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/adventures/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAdventureBySlug(slug);
  return { title: a ? a.name : "Adventure" };
}

export default async function AdventurePage({ params, searchParams }: PageProps<"/adventures/[slug]">) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const adventure = await getAdventureBySlug(slug);
  if (!adventure) notFound();

  const user = await getCurrentUser();
  const owned = await getOwnedCharacterSlugs(user?.id ?? null);
  if (adventure.unlock_character_slug && !owned.has(adventure.unlock_character_slug)) redirect(routes.adventures);

  const steps = (adventure.steps as unknown as AdventureStep[]) ?? [];
  const [entries, characters, progress] = await Promise.all([getTimelineEntries(), getActiveCharacters(), getUserAdventureProgress(user?.id ?? null)]);
  const entryMap: Record<string, TimelineEntry> = Object.fromEntries(entries.map((e) => [e.slug, e]));
  const companionChar = characters.find((c) => c.slug === adventure.companion_character_slug) ?? null;
  const companion = companionChar
    ? {
        name: companionChar.name,
        color: companionChar.placeholder_color,
        shape: companionChar.placeholder_shape,
        personalityKey: companionChar.personality_key,
        imageUrl: companionChar.thumbnail_url,
      }
    : null;
  const p = progress.find((x) => x.adventure_id === adventure.id);
  const done = sp.done === "1";
  const stepIndex = Math.min(Math.max(Number(typeof sp.step === "string" ? sp.step : 0) || 0, 0), Math.max(steps.length - 1, 0));

  return (
    <div className="mx-auto w-full max-w-3xl px-3 sm:px-4">
      <Link href={routes.adventures} className="font-display text-ink-soft hover:text-brand text-sm font-bold">
        ← All adventures
      </Link>
      <h1 className="font-display text-chocolate mt-2 text-3xl font-bold sm:text-4xl">{adventure.name}</h1>
      {adventure.tagline ? <p className="text-brand">{adventure.tagline}</p> : null}

      <div className="mt-5">
        {done ? (
          <div className="chunky bg-pistachio/30 rounded-3xl p-6 text-center">
            <h2 className="font-display text-chocolate text-2xl font-bold">Adventure complete.</h2>
            <p className="text-chocolate mt-2">Everything you visited now has a home in your museum. {companion ? `${companion.name} is very pleased.` : ""}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <ToyLink href={routes.museum} color="pistachio">
                See your museum
              </ToyLink>
              <ToyLink href={routes.adventures} color="paper">
                More adventures
              </ToyLink>
            </div>
          </div>
        ) : steps.length === 0 ? (
          <p className="text-ink-soft">This adventure has no steps yet.</p>
        ) : (
          <AdventureRunner
            adventure={adventure}
            steps={steps}
            stepIndex={stepIndex}
            entries={entryMap}
            companion={companion}
            signedIn={user !== null}
            completed={!!p?.completed_at}
          />
        )}
      </div>

      <ol className="mt-6 flex flex-wrap gap-1.5" aria-label="Steps">
        {steps.map((s, i) => (
          <li key={i}>
            <Link
              href={`${routes.adventure(adventure.slug)}?step=${i}`}
              className={`chunky-sm font-display inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${i === stepIndex && !done ? "bg-brand text-paper" : "bg-paper text-chocolate"}`}
            >
              {i + 1}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
