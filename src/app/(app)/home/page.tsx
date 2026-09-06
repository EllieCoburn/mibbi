import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { getCurrentUser, getHomeSnapshot } from "@/lib/data/profile";
import { getOwnedMibbis } from "@/lib/data/collection";
import { getPersonality, dailyLine } from "@/lib/content/personalities";
import { routes } from "@/lib/routes";
import { copy } from "@/lib/content/copy";

export const metadata: Metadata = { title: "Home" };

export default async function AppHomePage({ searchParams }: PageProps<"/home">) {
  const [user, sp] = await Promise.all([getCurrentUser(), searchParams]);
  if (!user) return null; // layout redirects

  const [snapshot, mibbis] = await Promise.all([getHomeSnapshot(user.id), getOwnedMibbis(user.id)]);
  const featured = mibbis[0] ?? null;
  const personality = featured ? getPersonality(featured.character.personality_key) : null;

  return (
    <Container className="py-6 sm:py-10">
      {sp.updated === "password" ? (
        <Alert tone="success" className="mb-6">
          Password updated. Toast slept through the whole thing.
        </Alert>
      ) : null}

      <p className="font-display text-ink-mute text-sm font-semibold tracking-wide uppercase">Hi {user.profile.display_name}</p>
      <h1 className="mt-1 text-3xl sm:text-4xl">{featured ? `${featured.nickname ?? featured.character.name} is happy you're here.` : copy.waiting}</h1>

      {/* The room. A calm placeholder now; Phase 3 makes it decoratable. */}
      <section
        aria-label="Your room"
        className="border-line from-paper to-cream-deep shadow-soft relative mt-6 overflow-hidden rounded-2xl border bg-gradient-to-b"
      >
        <div className="bg-grain absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative flex min-h-64 flex-col items-center justify-end p-6 sm:min-h-80">
          {featured ? (
            <>
              <p className="bg-paper font-display text-chocolate shadow-soft mb-4 max-w-xs rounded-2xl px-4 py-2 text-center">{dailyLine(personality!)}</p>
              <MibbiAvatar
                name={featured.nickname ?? featured.character.name}
                color={featured.variant?.placeholder_color ?? featured.character.placeholder_color}
                shape={featured.character.placeholder_shape}
                personalityKey={featured.variant ? "mysterious" : featured.character.personality_key}
                imageUrl={featured.variant?.image_url ?? featured.character.image_url}
                size={160}
                animate
              />
            </>
          ) : (
            <EmptyState title="Your room is ready. It just needs a Mibbi." action={<LinkButton href={routes.adopt}>Adopt a Mibbi</LinkButton>}>
              Scan the code inside your box and someone small will move in.
            </EmptyState>
          )}
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Mibbis" value={snapshot.mibbiCount} href={routes.collection} />
        <Stat label="Mibbi Coins" value={snapshot.coins} href={routes.shop} />
        <Stat label="Quests" value="Soon" href={routes.quests} />
      </div>

      <section className="mt-8">
        <h2 className="text-2xl">Recent activity</h2>
        {snapshot.recentActivity.length === 0 ? (
          <p className="text-ink-soft mt-2">Nothing yet. Adopting a Mibbi is a very good first thing to do.</p>
        ) : (
          <ul className="divide-line border-line bg-paper mt-3 divide-y rounded-xl border">
            {snapshot.recentActivity.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-chocolate">{a.title}</span>
                <time dateTime={a.created_at} className="text-ink-mute text-xs">
                  {new Date(a.created_at).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}

function Stat({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-lift transition-shadow">
        <CardBody className="py-4">
          <p className="font-display text-ink-mute text-xs font-semibold tracking-wide uppercase">{label}</p>
          <p className="font-display text-chocolate mt-1 text-3xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
        </CardBody>
      </Card>
    </Link>
  );
}
