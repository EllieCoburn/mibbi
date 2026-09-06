import { ToyLink } from "@/components/ui/toy-button";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { JourneyScene, JOURNEY_STOPS } from "./journey-scene";
import { Balloon } from "@/components/world/world-scene";
import { routes } from "@/lib/routes";
import { copy } from "@/lib/content/copy";
import type { CharacterSummary } from "@/lib/data/characters";
import { cn } from "@/lib/utils/cn";

/**
 * The front door: a journey through time with Mibbis travelling along it.
 * Primary CTA opens the timeline (no account needed); secondary opens the
 * wider world (museum for members, sign-up for visitors).
 */
const TRAVELLERS: Array<{ left: string; bottom: string; size: string; mobile: boolean; flip?: boolean; motion?: "bob" | "float" }> = [
  { left: "12%", bottom: "4%", size: "clamp(64px, 8vw, 110px)", mobile: false },
  { left: "36%", bottom: "8%", size: "clamp(72px, 9vw, 120px)", mobile: true, motion: "bob" },
  { left: "58%", bottom: "10%", size: "clamp(60px, 7vw, 100px)", mobile: false },
  { left: "76%", bottom: "13%", size: "clamp(64px, 8vw, 110px)", mobile: true, motion: "bob", flip: true },
  { left: "84%", bottom: "5%", size: "clamp(56px, 7vw, 96px)", mobile: true },
];

export function HeroJourney({ characters }: { characters: CharacterSummary[]; signedIn?: boolean }) {
  const cast = characters.slice(0, TRAVELLERS.length);
  const rider = characters[TRAVELLERS.length] ?? characters[1];

  return (
    <section aria-label="Explore the story of everything" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <JourneyScene />

      {/* Headline block */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pt-24 text-center sm:pt-28">
        <p className="font-display text-paper text-[clamp(3.5rem,11vw,6.5rem)] leading-none font-bold tracking-tight lowercase drop-shadow-[0_5px_0_rgb(74_46_34_/_0.8)]">
          mibbi
        </p>
        <h1 className="bg-paper/90 font-display text-chocolate shadow-lift mt-3 rounded-[2rem] px-5 py-3 text-[clamp(1.6rem,4.5vw,3rem)] leading-tight font-bold">
          {copy.headline}
        </h1>
        <p className="bg-paper/80 font-display text-chocolate mt-3 max-w-md rounded-full px-4 py-1.5 text-sm font-semibold sm:text-base">{copy.support}</p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <ToyLink href={routes.timeline} size="xl" color="brand" className="animate-pop">
            Explore the timeline
          </ToyLink>
          <ToyLink href="#how" size="lg" color="butter">
            How Mibbi works
          </ToyLink>
        </div>
      </div>

      {/* Balloon rider drifting across the ages */}
      {rider ? (
        <div className="animate-float absolute top-[36%] left-[4%] z-10 sm:top-[24%] sm:left-[6%]" style={{ animationDuration: "7s" }}>
          <Balloon className="w-14 sm:w-24">
            <MibbiAvatar
              name={rider.name}
              color={rider.placeholder_color}
              shape={rider.placeholder_shape}
              personalityKey={rider.personality_key}
              imageUrl={rider.thumbnail_url}
              size={30}
            />
          </Balloon>
        </div>
      ) : null}

      {/* Era labels along the path */}
      <ol aria-label="Stops on the journey" className="pointer-events-none absolute inset-x-0 bottom-[30%] z-10 hidden md:block">
        {JOURNEY_STOPS.map((s) => (
          <li key={s.key} className="absolute -translate-x-1/2 text-center" style={{ left: `${s.x}%` }}>
            <span
              className={cn(
                "border-chocolate font-display block rounded-full border-2 px-2 py-0.5 text-[11px] font-bold whitespace-nowrap",
                s.key === "now" ? "bg-brand text-paper" : "bg-paper/90 text-chocolate",
              )}
            >
              {s.label}
            </span>
            <span className="font-display text-paper mt-0.5 block text-[10px] font-bold drop-shadow-[0_1px_0_rgb(74_46_34)]">{s.year}</span>
          </li>
        ))}
      </ol>

      {/* Travellers */}
      <ul aria-label="Mibbis travelling through time" className="pointer-events-none absolute inset-0 z-10">
        {cast.map((c, i) => {
          const t = TRAVELLERS[i];
          return (
            <li
              key={c.id}
              className={cn("pointer-events-auto absolute -translate-x-1/2", !t.mobile && "hidden sm:block", t.motion === "bob" && "animate-bob")}
              style={{ left: t.left, bottom: t.bottom, animationDelay: `${i * 0.5}s` }}
            >
              <a
                href={routes.character(c.slug)}
                aria-label={`Meet ${c.name}`}
                className="group block rounded-full"
                style={t.flip ? { transform: "scaleX(-1)" } : undefined}
              >
                <div className="group-hover:animate-wiggle transition-transform duration-200 group-hover:-translate-y-2">
                  <MibbiAvatar
                    name={c.name}
                    color={c.placeholder_color}
                    shape={c.placeholder_shape}
                    personalityKey={c.personality_key}
                    imageUrl={c.image_url}
                    size={t.size}
                  />
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      <div className="to-cream pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-b from-transparent" aria-hidden="true" />
    </section>
  );
}
