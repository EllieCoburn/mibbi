import Link from "next/link";
import { ToyLink } from "@/components/ui/toy-button";
import { routes } from "@/lib/routes";

const SAME_TIME = [
  { place: "England", thing: "Magna Carta is signed", color: "#7e9bc2" },
  { place: "Mongolia", thing: "Genghis Khan rules the largest land empire ever", color: "#c98a4b" },
  { place: "Cambodia", thing: "Angkor Wat is a century old", color: "#8fae8b" },
  { place: "Mali", thing: "The Mali Empire is about to rise", color: "#f6d68a" },
  { place: "New Mexico", thing: "Chaco Canyon’s great houses stand", color: "#b7a9d6" },
  { place: "The Pacific", thing: "Polynesians are sailing to Aotearoa", color: "#9fc6e0" },
];

/** The signature question, shown once with a real answer: the year 1215. */
export function WhatElseTeaser() {
  return (
    <section aria-labelledby="else-heading" className="bg-sky/40 relative overflow-hidden py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <p className="font-display text-ink-mute text-xs font-bold tracking-[0.3em] uppercase">The year 1215</p>
          <h2 id="else-heading" className="mt-1 text-4xl sm:text-5xl">
            What else was happening?
          </h2>
          <p className="font-display text-ink-soft mt-2 text-lg">Press it on anything, and the world opens up around that moment.</p>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SAME_TIME.map((s, i) => (
            <li key={s.place} className={`chunky-sm bg-paper rounded-2xl px-4 py-3 ${["-rotate-1", "rotate-[0.75deg]", "rotate-1"][i % 3]}`}>
              <p className="font-display text-xs font-bold tracking-wider uppercase" style={{ color: s.color }}>
                {s.place}
              </p>
              <p className="font-display text-chocolate font-bold">{s.thing}</p>
            </li>
          ))}
        </ul>
        <p className="font-display text-chocolate mt-6 text-center text-lg">All of these people were alive at the same time.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ToyLink href={`${routes.atlas}?year=1215`} color="dusty" size="lg">
            See the world in 1215
          </ToyLink>
          <Link href={`${routes.timeline}?focus=magna-carta`} className="font-display text-brand font-bold underline underline-offset-4">
            Or start at Magna Carta →
          </Link>
        </div>
      </div>
    </section>
  );
}
