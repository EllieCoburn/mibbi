import { DestinationTile } from "@/components/world/destination-tile";
import { ToyLink } from "@/components/ui/toy-button";
import type { LocationSummary } from "@/lib/data/world";
import { routes } from "@/lib/routes";

export function ExploreWorld({ locations }: { locations: LocationSummary[] }) {
  if (locations.length === 0) return null;
  return (
    <section aria-labelledby="explore-heading" className="relative overflow-hidden bg-sky/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 id="explore-heading" className="text-4xl sm:text-5xl">
            Explore Mibbi World
          </h2>
          <p className="mt-2 font-display text-lg text-ink-soft">New places. New friends. New adventures.</p>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {locations.slice(0, 8).map((l) => (
            <li key={l.id}>
              <DestinationTile location={l} />
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <ToyLink href={routes.world} color="dusty" size="lg">
            Open the map
          </ToyLink>
        </div>
      </div>
    </section>
  );
}
