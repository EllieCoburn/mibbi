import { ToyLink } from "@/components/ui/toy-button";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { WorldScene, Balloon } from "@/components/world/world-scene";
import { routes } from "@/lib/routes";
import { copy } from "@/lib/content/copy";
import type { CharacterSummary } from "@/lib/data/characters";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Where each Mibbi stands in the scene, as % of the hero box. The list is
 * consumed in character sort order, so the first six active characters
 * take these spots. Hidden on small screens where marked.
 */
const SPOTS: Array<{ left: string; bottom: string; mLeft?: string; mBottom?: string; size: string; mobile: boolean; motion: "bob" | "float" | "none"; flip?: boolean }> = [
  { left: "12%", bottom: "6%", mLeft: "16%", mBottom: "3%", size: "clamp(84px, 11vw, 150px)", mobile: true, motion: "bob" },
  { left: "32%", bottom: "2%", mLeft: "50%", mBottom: "0%", size: "clamp(96px, 13vw, 180px)", mobile: true, motion: "none" },
  { left: "56%", bottom: "4%", mLeft: "84%", mBottom: "5%", size: "clamp(88px, 12vw, 160px)", mobile: true, motion: "bob" },
  { left: "76%", bottom: "9%", size: "clamp(70px, 9vw, 130px)", mobile: false, motion: "none", flip: true },
  { left: "81%", bottom: "27%", size: "clamp(40px, 5vw, 72px)", mobile: false, motion: "none" },
  { left: "8%", bottom: "28%", size: "clamp(40px, 5vw, 70px)", mobile: false, motion: "none", flip: true },
];

export function HeroWorld({ characters, signedIn }: { characters: CharacterSummary[]; signedIn: boolean }) {
  const cast = characters.slice(0, SPOTS.length);
  const balloonRider = characters[SPOTS.length] ?? characters[1];

  return (
    <section aria-label="Mibbi World" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <WorldScene />

      {/* Top: logo */}
      <div className="relative z-10 flex flex-col items-center pt-24 sm:pt-28">
        <h1 className="font-display text-[clamp(4.5rem,15vw,9rem)] leading-none font-bold tracking-tight text-brand lowercase drop-shadow-[0_6px_0_rgb(255_255_255_/_0.8)]">
          mibbi
        </h1>
        <p className="mt-1 rounded-full bg-paper/80 px-4 py-1 font-display text-base font-semibold text-chocolate shadow-soft sm:text-lg">{copy.tagline}</p>
      </div>

      {/* Balloon with a rider */}
      {balloonRider ? (
        <div className="absolute top-[26%] right-[4%] z-10 animate-float sm:top-[18%] sm:right-[6%]" style={{ animationDuration: "7s" }}>
          <Balloon className="w-16 sm:w-32">
            <MibbiAvatar name={balloonRider.name} color={balloonRider.placeholder_color} shape={balloonRider.placeholder_shape} personalityKey={balloonRider.personality_key} imageUrl={balloonRider.thumbnail_url} size={40} />
          </Balloon>
        </div>
      ) : null}

      {/* CTA cluster, sits on the path */}
      <div className="relative z-20 mt-auto mb-[36%] flex flex-col items-center gap-3 px-4 sm:mb-[14%] sm:gap-4">
        <ToyLink href={signedIn ? routes.app : `${routes.login}?next=${routes.app}`} size="xl" color="brand" className="animate-pop">
          {signedIn ? "Continue playing" : "Enter Mibbi World"}
        </ToyLink>
        {!signedIn ? (
          <ToyLink href={routes.signup} size="lg" color="butter">
            I’m new
          </ToyLink>
        ) : null}
      </div>

      {/* The cast, standing in the world */}
      <ul aria-label="Mibbis in the world" className="pointer-events-none absolute inset-0 z-10">
        {cast.map((c, i) => {
          const s = SPOTS[i];
          return (
            <li
              key={c.id}
              className={cn(
                "pointer-events-auto absolute -translate-x-1/2 left-(--ml) bottom-(--mb) sm:left-(--l) sm:bottom-(--b)",
                !s.mobile && "hidden sm:block",
                s.motion === "bob" && "animate-bob",
                s.motion === "float" && "animate-float",
              )}
              style={
                {
                  "--l": s.left,
                  "--b": s.bottom,
                  "--ml": s.mLeft ?? s.left,
                  "--mb": s.mBottom ?? s.bottom,
                  animationDelay: `${i * 0.6}s`,
                } as CSSProperties
              }
            >
              <a
                href={routes.character(c.slug)}
                aria-label={`Meet ${c.name}, ${c.personality_label}`}
                className="group block rounded-full focus-visible:outline-4"
                style={s.flip ? { transform: "scaleX(-1)" } : undefined}
              >
                <div className="transition-transform duration-200 group-hover:-translate-y-2 group-hover:animate-wiggle">
                  <MibbiAvatar name={c.name} color={c.placeholder_color} shape={c.placeholder_shape} personalityKey={c.personality_key} imageUrl={c.image_url} size={s.size} />
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Bottom edge blends into the next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-b from-transparent to-cream" aria-hidden="true" />
    </section>
  );
}
