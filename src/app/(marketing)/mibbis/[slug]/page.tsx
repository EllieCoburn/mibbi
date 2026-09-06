import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card, CardBody } from "@/components/ui/card";
import { ToyLink } from "@/components/ui/toy-button";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { RarityBadge } from "@/components/characters/rarity-badge";
import { getCharacterBySlug } from "@/lib/data/characters";
import { getPersonality } from "@/lib/content/personalities";
import { routes } from "@/lib/routes";

export async function generateMetadata({ params }: PageProps<"/mibbis/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const character = await getCharacterBySlug(slug);
  if (!character) return { title: "Mibbi not found" };
  return { title: `${character.name}, ${character.personality_label}`, description: character.tagline ?? undefined };
}

export default async function CharacterPage({ params }: PageProps<"/mibbis/[slug]">) {
  const { slug } = await params;
  const character = await getCharacterBySlug(slug);
  if (!character) notFound();

  const personality = getPersonality(character.personality_key);

  return (
    <Container className="pt-28 pb-16 sm:pt-32">
      <Link href={routes.characters} className="font-display text-ink-soft hover:text-brand text-sm font-semibold">
        ← All Mibbis
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
        <div
          className="bg-paper shadow-soft flex flex-col items-center gap-4 rounded-2xl p-8"
          style={{ backgroundColor: `color-mix(in oklab, ${character.placeholder_color} 22%, var(--color-paper))` }}
        >
          <MibbiAvatar
            name={character.name}
            color={character.placeholder_color}
            shape={character.placeholder_shape}
            personalityKey={character.personality_key}
            imageUrl={character.image_url}
            size="min(70vw, 280px)"
            animate
          />
          {character.catchphrase ? <p className="bg-paper font-display text-chocolate shadow-soft rounded-full px-4 py-2">“{character.catchphrase}”</p> : null}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <RarityBadge name={character.rarity.name} color={character.rarity.color_hex} />
            {character.series.map((s) => (
              <span key={s.slug} className="font-display text-ink-mute text-sm font-semibold">
                Series {s.code.replace(/^S/, "")} · {s.name}
              </span>
            ))}
          </div>
          <h1 className="mt-3 text-5xl sm:text-6xl">{character.name}</h1>
          <p className="font-display text-brand text-xl">{character.personality_label}</p>
          {character.tagline ? <p className="text-ink-soft mt-2 text-lg">{character.tagline}</p> : null}
          {character.description ? <p className="text-ink mt-5 leading-relaxed">{character.description}</p> : null}

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Fact label="Species" value={character.species} />
            <Fact label="Trait" value={character.trait} />
            <Fact label="Favourite food" value={character.favorite_food} />
            <Fact label="Favourite thing" value={character.favorite_activity} />
            <Fact label="Home" value={character.home_location?.name ?? null} />
            <Fact label="Says" value={personality.identity} />
          </dl>

          {character.variants.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-2xl">Rare editions</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {character.variants.map((v) => (
                  <li key={v.id}>
                    <Card>
                      <CardBody className="flex items-center gap-4">
                        <MibbiAvatar
                          name={v.name}
                          color={v.placeholder_color}
                          shape={character.placeholder_shape}
                          personalityKey="mysterious"
                          imageUrl={v.image_url}
                          size={72}
                        />
                        <div>
                          <p className="font-display text-chocolate text-lg font-semibold">{v.name}</p>
                          <RarityBadge name={v.rarity.name} color={v.rarity.color_hex} />
                          {v.rarity.odds_label ? <p className="text-ink-mute mt-1 text-xs">{v.rarity.odds_label}</p> : null}
                        </div>
                      </CardBody>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ToyLink href={routes.adopt} size="lg">
              Adopt {character.name}
            </ToyLink>
            <ToyLink href={routes.characters} color="paper" size="lg">
              Meet the others
            </ToyLink>
          </div>
        </div>
      </div>
    </Container>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="bg-paper shadow-soft rounded-md p-3">
      <dt className="font-display text-ink-mute text-xs font-semibold tracking-wide uppercase">{label}</dt>
      <dd className="text-chocolate mt-0.5 text-sm font-semibold">{value}</dd>
    </div>
  );
}
