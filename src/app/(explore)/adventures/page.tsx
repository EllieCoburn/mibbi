import type { Metadata } from "next";
import Link from "next/link";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { ToyLink } from "@/components/ui/toy-button";
import { getCurrentUser } from "@/lib/data/profile";
import { getActiveCharacters } from "@/lib/data/characters";
import { getAdventures, getOwnedCharacterSlugs, getUserAdventureProgress } from "@/lib/data/timeline";
import { curiosityOf, type AdventureStep } from "@/lib/timeline/types";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Mibbi Adventures", description: "Story expeditions through time with a Mibbi companion." };
export const dynamic = "force-dynamic";

export default async function AdventuresPage() {
  const user = await getCurrentUser();
  const [adventures, characters, owned, progress] = await Promise.all([
    getAdventures(),
    getActiveCharacters(),
    getOwnedCharacterSlugs(user?.id ?? null),
    getUserAdventureProgress(user?.id ?? null),
  ]);
  const bySlug = new Map(characters.map((c) => [c.slug, c]));
  const progressFor = (id: string) => progress.find((p) => p.adventure_id === id);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-4">
      <div className="px-1">
        <h1 className="font-display text-chocolate text-3xl font-bold sm:text-4xl">Mibbi Adventures</h1>
        <p className="text-ink-soft text-sm">Expeditions through time. Each one starts somewhere on the timeline and ends in your museum.</p>
      </div>

      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {adventures.map((a) => {
          const companion = a.companion_character_slug ? bySlug.get(a.companion_character_slug) : undefined;
          const steps = (a.steps as unknown as AdventureStep[]) ?? [];
          const locked = a.unlock_character_slug !== null && !owned.has(a.unlock_character_slug);
          const p = progressFor(a.id);
          const unlockChar = a.unlock_character_slug ? bySlug.get(a.unlock_character_slug) : undefined;
          return (
            <li key={a.id}>
              <article
                className="chunky bg-paper flex h-full flex-col rounded-3xl p-5"
                style={{ backgroundColor: companion ? `color-mix(in oklab, ${companion.placeholder_color} 14%, var(--color-paper))` : undefined }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="sticker bg-paper px-2 py-0.5 text-[10px]">{curiosityOf(a.curiosity_key).label}</span>
                  {p?.completed_at ? (
                    <span className="sticker bg-pistachio text-paper px-2 py-0.5 text-[10px]">Done</span>
                  ) : p ? (
                    <span className="sticker bg-butter px-2 py-0.5 text-[10px]">
                      Step {p.step_index + 1}/{steps.length}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  {companion ? (
                    <MibbiAvatar
                      name={companion.name}
                      color={companion.placeholder_color}
                      shape={companion.placeholder_shape}
                      personalityKey={companion.personality_key}
                      imageUrl={companion.thumbnail_url}
                      size={56}
                    />
                  ) : null}
                  <div>
                    <h2 className="font-display text-chocolate text-xl leading-tight font-bold">{a.name}</h2>
                    {a.tagline ? <p className="text-brand text-sm">{a.tagline}</p> : null}
                  </div>
                </div>
                {a.description ? <p className="text-ink-soft mt-3 flex-1 text-sm">{a.description}</p> : null}
                <div className="mt-4">
                  {locked ? (
                    <div className="bg-cream-deep/70 text-chocolate rounded-2xl px-3 py-2 text-sm">
                      <p className="font-display font-bold">Unlocked by a real {unlockChar?.name ?? "Mibbi"}.</p>
                      <p className="text-ink-soft text-xs">
                        {user ? (
                          <>
                            Have one?{" "}
                            <Link href={routes.adopt} className="text-brand font-semibold underline">
                              Scan its code
                            </Link>
                            .
                          </>
                        ) : (
                          <>
                            <Link href={`${routes.login}?next=${routes.adventures}`} className="text-brand font-semibold underline">
                              Sign in
                            </Link>{" "}
                            and scan the code inside the box.
                          </>
                        )}
                      </p>
                    </div>
                  ) : (
                    <ToyLink href={`${routes.adventure(a.slug)}?step=${p && !p.completed_at ? p.step_index : 0}`} color={p?.completed_at ? "paper" : "brand"}>
                      {p?.completed_at ? "Play again" : p ? "Continue" : "Start"}
                    </ToyLink>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
