import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import type { Tables } from "@/types/supabase";

type Loc = Pick<Tables<"locations">, "id" | "slug" | "name" | "tagline" | "map_x" | "map_y">;

/**
 * Illustrated-map placeholder: location pins positioned by their map_x/map_y
 * so the real illustration can drop in underneath later without re-plotting.
 */
export function WorldTeaser({ locations }: { locations: Loc[] }) {
  return (
    <section aria-labelledby="world-heading" className="py-16 sm:py-20">
      <Container>
        <div className="text-center">
          <h2 id="world-heading" className="text-3xl sm:text-4xl">
            Explore the Mibbi world
          </h2>
          <p className="text-ink-soft mt-2">New places. New friends. New adventures.</p>
        </div>
        <div className="border-line from-dusty-soft/60 via-pistachio/30 to-butter/40 shadow-soft relative mt-10 aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-gradient-to-b">
          <div className="bg-grain absolute inset-0 opacity-60" aria-hidden="true" />
          {locations.map((l) => (
            <span
              key={l.id}
              className="border-line bg-paper font-display text-chocolate shadow-soft absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1 text-xs font-semibold sm:text-sm"
              style={{ left: `${l.map_x}%`, top: `${l.map_y}%` }}
            >
              {l.name}
            </span>
          ))}
        </div>
        <div className="mt-8 text-center">
          <LinkButton href={routes.world} variant="secondary">
            Open the map
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
