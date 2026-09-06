import { ToyLink } from "@/components/ui/toy-button";
import { MibbiAvatar } from "@/components/characters/mibbi-avatar";
import { routes } from "@/lib/routes";
import type { CharacterSummary } from "@/lib/data/characters";

/** For people holding a physical Mibbi: the bridge into the world. */
export function GotAMibbi({ character }: { character?: CharacterSummary }) {
  return (
    <section aria-labelledby="got-heading" className="py-16 sm:py-20">
      <div className="chunky mx-auto grid max-w-5xl items-center gap-8 overflow-hidden rounded-[2rem] bg-butter/60 p-6 sm:grid-cols-[1fr_auto] sm:p-10">
        <div>
          <h2 id="got-heading" className="text-4xl sm:text-5xl">
            Got a Mibbi?
          </h2>
          <p className="mt-2 font-display text-xl text-chocolate">Your Mibbi has a life online too.</p>
          <p className="mt-2 max-w-md text-ink-soft">Find the card inside your box, scan the code, and someone small will be waiting in your room.</p>
          <div className="mt-6">
            <ToyLink href={routes.adopt} size="lg">
              Unlock my Mibbi
            </ToyLink>
          </div>
        </div>
        {/* Package illustration with a Mibbi popping out */}
        <div className="relative mx-auto w-48 sm:w-56" aria-hidden="true">
          <svg viewBox="0 0 200 200" className="w-full">
            <rect x="30" y="80" width="140" height="100" rx="14" fill="var(--color-brand)" stroke="var(--color-chocolate)" strokeWidth="4" />
            <path d="M22 86 L100 60 L178 86 L178 100 L100 76 L22 100z" fill="var(--color-brand-deep)" stroke="var(--color-chocolate)" strokeWidth="4" strokeLinejoin="round" />
            <rect x="62" y="112" width="76" height="48" rx="8" fill="var(--color-paper)" stroke="var(--color-chocolate)" strokeWidth="3" />
            <g fill="var(--color-chocolate)">
              <rect x="70" y="120" width="12" height="12" /><rect x="86" y="120" width="6" height="6" /><rect x="96" y="120" width="6" height="12" />
              <rect x="70" y="138" width="6" height="6" /><rect x="80" y="138" width="12" height="12" /><rect x="96" y="140" width="6" height="6" />
              <rect x="108" y="120" width="12" height="12" /><rect x="108" y="138" width="6" height="12" /><rect x="118" y="140" width="6" height="6" />
            </g>
            <text x="100" y="172" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="700" fontSize="12" fill="var(--color-paper)">scan to adopt</text>
          </svg>
          {character ? (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bob">
              <MibbiAvatar name={character.name} color={character.placeholder_color} shape={character.placeholder_shape} personalityKey={character.personality_key} imageUrl={character.thumbnail_url} size={84} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
