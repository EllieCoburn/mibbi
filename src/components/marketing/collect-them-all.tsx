import { Container } from "@/components/ui/container";
import { Card, CardBody } from "@/components/ui/card";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import type { SeriesWithCharacters } from "@/lib/data/characters";

/** Series checklist teaser. Signed-in users get the real one at /collection. */
export function CollectThemAll({ series }: { series: SeriesWithCharacters[] }) {
  if (series.length === 0) return null;
  return (
    <section aria-labelledby="collect-heading" className="bg-cream-deep/60 py-16 sm:py-20">
      <Container>
        <div className="text-center">
          <h2 id="collect-heading" className="text-3xl sm:text-4xl">
            Collect them all
          </h2>
          <p className="text-ink-soft mt-2">Every new Mibbi opens up more of the world. Rare friends make brighter worlds.</p>
        </div>
        <div className="mt-10 grid gap-6">
          {series.map((s) => (
            <Card key={s.id}>
              <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="sm:w-56">
                  <p className="font-display text-ink-mute text-sm font-semibold tracking-wide uppercase">Series {s.code.replace(/^S/, "")}</p>
                  <h3 className="text-2xl">{s.name}</h3>
                  {s.tagline ? <p className="text-ink-soft mt-1 text-sm">{s.tagline}</p> : null}
                </div>
                <ul className="flex flex-1 flex-wrap justify-center gap-3 sm:justify-start" aria-label={`${s.name} characters`}>
                  {s.characters.map((c) => (
                    <li key={c.id} className="flex flex-col items-center gap-1">
                      <MibbiAvatar
                        name={c.name}
                        color={c.placeholder_color}
                        shape={c.placeholder_shape}
                        personalityKey={c.personality_key}
                        imageUrl={c.thumbnail_url}
                        size={64}
                      />
                      <span className="text-ink-soft text-xs font-semibold">{c.name}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
