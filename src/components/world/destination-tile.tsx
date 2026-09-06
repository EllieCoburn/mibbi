import Link from "next/link";
import type { LocationSummary } from "@/lib/data/world";
import { routes } from "@/lib/routes";

/**
 * An illustrated place tile. The motif is picked by slug so admin-created
 * locations get a sensible default; final art replaces via image_url.
 */
export function DestinationTile({ location }: { location: LocationSummary }) {
  const href = location.link_type === "none" || !location.link_target ? routes.world : location.link_target;
  return (
    <Link
      href={href}
      className="chunky group relative block aspect-[5/4] overflow-hidden rounded-[1.75rem] transition-transform duration-200 hover:-translate-y-1.5 focus-visible:-translate-y-1.5"
      aria-label={`Go to ${location.name}`}
    >
      {location.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- illustrated tile art from storage
        <img src={location.image_url} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <Motif slug={location.slug} />
      )}
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
        <span className="chunky-sm bg-paper font-display text-chocolate rounded-full px-3 py-1 text-sm font-bold sm:text-base">{location.name}</span>
        <span
          aria-hidden="true"
          className="chunky-sm bg-butter font-display text-chocolate flex size-8 items-center justify-center rounded-full font-bold transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </div>
      {location.tagline ? <span className="sr-only">{location.tagline}</span> : null}
    </Link>
  );
}

function Motif({ slug }: { slug: string }) {
  const s = slug.toLowerCase();
  if (s.includes("bakery"))
    return (
      <Scene sky="var(--color-sun)" ground="var(--color-grass)">
        <path d="M30 62h40v26H30z" fill="var(--color-wall)" stroke="var(--color-chocolate)" strokeWidth="2.5" />
        <path d="M24 62 Q50 36 76 62z" fill="var(--color-apricot)" stroke="var(--color-chocolate)" strokeWidth="2.5" />
        <path d="M28 66h44v6H28z" fill="var(--color-brand)" />
        <rect x="44" y="74" width="12" height="14" rx="5" fill="var(--color-chocolate)" />
      </Scene>
    );
  if (s.includes("town") || s.includes("home"))
    return (
      <Scene sky="var(--color-sky)" ground="var(--color-grass)">
        <path d="M18 66h22v22H18z M60 60h26v28H60z" fill="var(--color-wall)" stroke="var(--color-chocolate)" strokeWidth="2.5" />
        <path d="M14 66l15-14 15 14z" fill="var(--color-roof)" stroke="var(--color-chocolate)" strokeWidth="2.5" />
        <path d="M56 60l17-16 17 16z" fill="var(--color-dusty)" stroke="var(--color-chocolate)" strokeWidth="2.5" />
      </Scene>
    );
  if (s.includes("forest") || s.includes("park"))
    return (
      <Scene sky="var(--color-sky)" ground="var(--color-hill-near)">
        <circle cx="30" cy="62" r="16" fill="var(--color-pistachio)" />
        <circle cx="60" cy="54" r="20" fill="var(--color-pistachio-deep)" />
        <circle cx="86" cy="64" r="14" fill="var(--color-pistachio)" />
        <rect x="58" y="70" width="5" height="18" fill="var(--color-toast)" />
        <rect x="28" y="74" width="4" height="14" fill="var(--color-toast)" />
      </Scene>
    );
  if (s.includes("beach"))
    return (
      <Scene sky="var(--color-sky)" ground="var(--color-path)">
        <circle cx="76" cy="30" r="12" fill="var(--color-sun)" />
        <path d="M0 70 Q25 60 50 70 T100 70 V84 H0z" fill="var(--color-water)" />
        <path d="M20 88c-2-14 4-24 12-30 4 8 4 20 0 30z" fill="var(--color-pistachio)" />
      </Scene>
    );
  if (s.includes("night"))
    return (
      <Scene sky="#4a3d6b" ground="#5d4a7a">
        <circle cx="24" cy="26" r="9" fill="var(--color-sun)" />
        <g fill="var(--color-brand)">
          <rect x="30" y="52" width="10" height="14" rx="3" />
          <rect x="50" y="48" width="10" height="14" rx="3" />
          <rect x="70" y="54" width="10" height="14" rx="3" />
        </g>
        <path d="M24 50h64" stroke="var(--color-butter)" strokeWidth="2" />
      </Scene>
    );
  if (s.includes("market") || s.includes("shop"))
    return (
      <Scene sky="var(--color-sky)" ground="var(--color-grass)">
        <path d="M22 60h56v28H22z" fill="var(--color-wall)" stroke="var(--color-chocolate)" strokeWidth="2.5" />
        <path d="M18 60h64l-6-14H24z" fill="var(--color-brand)" stroke="var(--color-chocolate)" strokeWidth="2.5" />
        <g fill="var(--color-paper)">
          <rect x="26" y="47" width="8" height="12" />
          <rect x="42" y="47" width="8" height="12" />
          <rect x="58" y="47" width="8" height="12" />
        </g>
      </Scene>
    );
  return (
    <Scene sky="var(--color-sky)" ground="var(--color-grass)">
      <circle cx="70" cy="60" r="16" fill="var(--color-pistachio)" />
      <rect x="68" y="72" width="4" height="16" fill="var(--color-toast)" />
    </Scene>
  );
}

function Scene({ sky, ground, children }: { sky: string; ground: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice" aria-hidden="true" className="absolute inset-0 size-full">
      <rect width="100" height="100" fill={sky} />
      <ellipse cx="50" cy="104" rx="70" ry="28" fill={ground} />
      {children}
    </svg>
  );
}
