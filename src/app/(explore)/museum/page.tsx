import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PersonalTimeline } from "@/components/museum/personal-timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { ToyLink } from "@/components/ui/toy-button";
import { getCurrentUser } from "@/lib/data/profile";
import { getTimelineEntries, getUserDiscoveries } from "@/lib/data/timeline";
import { formatDuration, formatWhen, yearsAgo } from "@/lib/timeline/time";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Mibbi Museum" };
export const dynamic = "force-dynamic";

export default async function MuseumPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`${routes.login}?next=${routes.museum}`);

  const [entries, discoveries] = await Promise.all([getTimelineEntries(), getUserDiscoveries(user.id)]);
  const ids = new Set(discoveries.map((d) => d.entry_id));
  const total = entries.filter((e) => e.kind !== "era").length;
  const deepest = discoveries.reduce<number>((m, d) => Math.max(m, yearsAgo(d.entry.start_year)), 0);
  const regions = new Set(discoveries.map((d) => d.entry.region_slug));

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-4">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="font-display text-ink-mute text-xs font-bold tracking-[0.25em] uppercase">{user.profile.display_name}’s</p>
          <h1 className="font-display text-chocolate text-3xl font-bold sm:text-4xl">Mibbi Museum</h1>
          <p className="text-ink-soft text-sm">Everything you have found, and where it belongs in the story.</p>
        </div>
        <ToyLink href={routes.timeline} color="brand">
          Explore for more
        </ToyLink>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Discoveries" value={`${discoveries.length} of ${total}`} />
        <Stat label="Deepest time reached" value={deepest > 0 ? `${formatDuration(deepest)} ago` : "Not yet"} />
        <Stat label="Regions visited" value={String(regions.size)} />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-chocolate px-1 text-xl font-bold">Your timeline</h2>
        <div className="mt-3">
          <PersonalTimeline entries={entries} discoveredIds={ids} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-chocolate px-1 text-xl font-bold">Your collection</h2>
        {discoveries.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="Your museum is waiting for its first exhibit." action={<ToyLink href={routes.timeline}>Go exploring</ToyLink>}>
              Open anything on the timeline and press “Add to my museum”.
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...discoveries]
              .sort((a, b) => a.entry.start_year - b.entry.start_year)
              .map((d, i) => (
                <li key={d.entry_id}>
                  <article
                    className={`chunky-sm bg-paper h-full rounded-2xl p-4 ${["-rotate-1", "rotate-[0.5deg]", "rotate-1"][i % 3]}`}
                    style={{ borderColor: d.entry.color_hex ?? undefined }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="sticker px-2 py-0.5 text-[10px]"
                        style={{ backgroundColor: `color-mix(in oklab, ${d.entry.color_hex ?? "#b9c9db"} 45%, white)` }}
                      >
                        {d.entry.kind}
                      </span>
                      <span className="text-ink-mute text-[10px] font-semibold uppercase">via {d.discovered_via}</span>
                    </div>
                    <h3 className="font-display text-chocolate mt-2 text-lg leading-tight font-bold">{d.entry.name}</h3>
                    <dl className="text-chocolate mt-2 space-y-1 text-xs">
                      <div>
                        <dt className="font-display text-ink-mute inline font-bold uppercase">When </dt>
                        <dd className="inline">{formatWhen(d.entry.start_year, d.entry.end_year, d.entry.is_ongoing)}</dd>
                      </div>
                      {d.entry.where_text ? (
                        <div>
                          <dt className="font-display text-ink-mute inline font-bold uppercase">Where </dt>
                          <dd className="inline">{d.entry.where_text}</dd>
                        </div>
                      ) : null}
                      {d.entry.why ? (
                        <div>
                          <dt className="font-display text-ink-mute inline font-bold uppercase">Why </dt>
                          <dd className="inline">{d.entry.why}</dd>
                        </div>
                      ) : null}
                    </dl>
                    <Link href={routes.entry(d.entry.slug)} className="font-display text-brand mt-3 inline-block text-xs font-bold underline">
                      See it on the timeline →
                    </Link>
                  </article>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="chunky-sm bg-paper rounded-2xl px-4 py-3">
      <p className="font-display text-ink-mute text-[11px] font-bold tracking-wider uppercase">{label}</p>
      <p className="font-display text-chocolate text-xl font-bold">{value}</p>
    </div>
  );
}
