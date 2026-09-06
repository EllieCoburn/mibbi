import type { Metadata } from "next";
import { PageTop } from "@/components/ui/page-top";
import { CollectibleCard } from "@/components/characters/collectible-card";
import { ToyLink } from "@/components/ui/toy-button";
import { getActiveSeriesWithCharacters } from "@/lib/data/characters";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Shop", description: "Where to find real Mibbis." };

/**
 * Physical products. Until the Shopify integration lands, this shows each
 * series with its lineup and a "coming to stores" sticker; product_skus.purchase_url
 * will power real buy buttons later.
 */
export default async function StorePage() {
  const series = await getActiveSeriesWithCharacters();
  return (
    <PageTop width="max-w-7xl">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl">The Mibbi Shop</h1>
        <p className="mt-2 font-display text-lg text-ink-soft">Real, squishable Mibbis. Each one comes with a secret life online.</p>
      </div>
      {series.map((s) => (
        <section key={s.id} aria-labelledby={`series-${s.slug}`} className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-xs font-bold tracking-[0.25em] text-ink-mute uppercase">Series {s.code.replace(/^S/, "")}</p>
              <h2 id={`series-${s.slug}`} className="text-3xl">
                {s.name}
              </h2>
              {s.tagline ? <p className="text-ink-soft">{s.tagline}</p> : null}
            </div>
            <span className="sticker bg-butter px-3 py-1 text-xs text-chocolate">Coming to stores</span>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-3 xl:grid-cols-6">
            {s.characters.map((c, i) => (
              <li key={c.id}>
                <CollectibleCard character={c} index={i} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <div className="mt-16 text-center">
        <p className="font-display text-lg text-chocolate">Already have one?</p>
        <div className="mt-3">
          <ToyLink href={routes.adopt} size="lg">
            Unlock my Mibbi
          </ToyLink>
        </div>
      </div>
    </PageTop>
  );
}
