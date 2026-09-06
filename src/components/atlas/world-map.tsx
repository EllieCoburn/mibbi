/**
 * A stylised world map (equirectangular, 1000×500). Continents are soft
 * hand-drawn blobs, deliberately not a precise map: it is a stage for
 * "what was happening where". Replace <Continents/> with final illustration
 * later; the pin positions will not change.
 */
import Link from "next/link";
import type { Region } from "@/lib/timeline/types";

export function project(lat: number, lng: number): { x: number; y: number } {
  return { x: ((lng + 180) / 360) * 1000, y: ((90 - lat) / 180) * 500 };
}

const CONTINENTS: Array<[string, Array<[number, number]>]> = [
  [
    "north-america",
    [
      [-168, 68],
      [-140, 72],
      [-95, 76],
      [-62, 74],
      [-55, 50],
      [-66, 44],
      [-80, 30],
      [-97, 18],
      [-106, 22],
      [-118, 32],
      [-125, 48],
      [-150, 60],
    ],
  ],
  [
    "greenland",
    [
      [-56, 62],
      [-25, 70],
      [-20, 82],
      [-60, 82],
      [-70, 76],
    ],
  ],
  [
    "south-america",
    [
      [-80, 10],
      [-62, 11],
      [-50, 0],
      [-35, -6],
      [-38, -22],
      [-52, -34],
      [-66, -50],
      [-75, -52],
      [-75, -30],
      [-80, -12],
    ],
  ],
  [
    "africa",
    [
      [-17, 14],
      [-8, 34],
      [10, 37],
      [30, 32],
      [43, 11],
      [51, 12],
      [40, -12],
      [35, -30],
      [20, -35],
      [12, -18],
      [8, 4],
    ],
  ],
  [
    "europe",
    [
      [-10, 36],
      [-9, 55],
      [5, 60],
      [22, 70],
      [38, 68],
      [58, 60],
      [42, 46],
      [28, 40],
      [12, 37],
    ],
  ],
  [
    "asia",
    [
      [42, 46],
      [58, 60],
      [70, 74],
      [110, 76],
      [150, 70],
      [178, 66],
      [160, 52],
      [136, 34],
      [120, 22],
      [108, 12],
      [100, 3],
      [80, 8],
      [69, 24],
      [58, 24],
    ],
  ],
  [
    "australia",
    [
      [114, -22],
      [124, -14],
      [136, -11],
      [146, -14],
      [153, -26],
      [147, -39],
      [134, -33],
      [116, -34],
    ],
  ],
  [
    "antarctica",
    [
      [-180, -66],
      [180, -66],
      [180, -90],
      [-180, -90],
    ],
  ],
];

function Continents() {
  return (
    <g fill="var(--color-hill-mid)" stroke="var(--color-pistachio-deep)" strokeWidth="2" strokeLinejoin="round">
      {CONTINENTS.map(([k, pts]) => (
        <path
          key={k}
          d={pts.map(([lng, lat], i) => `${i === 0 ? "M" : "L"}${project(lat, lng).x.toFixed(1)} ${project(lat, lng).y.toFixed(1)}`).join(" ") + "z"}
        />
      ))}
    </g>
  );
}

export interface PinData {
  region: Region;
  count: number;
  href: string;
  active: boolean;
}

export function WorldMap({ pins, caption }: { pins: PinData[]; caption?: string }) {
  return (
    <figure className="chunky bg-water/70 relative overflow-hidden rounded-3xl">
      <svg viewBox="0 0 1000 500" className="block w-full" role="img" aria-label="Map of the world with pins for each region">
        <rect width="1000" height="500" fill="var(--color-water)" />
        <g opacity="0.35">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={0} y1={(i + 1) * 50} x2={1000} y2={(i + 1) * 50} stroke="#fff" strokeWidth="1" />
          ))}
        </g>
        <Continents />
      </svg>
      {/* HTML pins on top so they are real links and readable */}
      {pins
        .filter((p) => p.region.slug !== "cosmos" && p.region.slug !== "earth")
        .map((p) => {
          const { x, y } = project(Number(p.region.lat), Number(p.region.lng));
          return (
            <Link
              key={p.region.slug}
              href={p.href}
              aria-label={`${p.region.name}: ${p.count} ${p.count === 1 ? "thing" : "things"} happening`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x / 10}%`, top: `${y / 5}%` }}
            >
              <span
                className={`chunky-sm font-display flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap transition-transform hover:-translate-y-0.5 sm:text-xs ${p.active ? "bg-brand text-paper" : p.count > 0 ? "bg-paper text-chocolate" : "bg-paper/70 text-ink-mute"}`}
              >
                {p.region.name}
                {p.count > 0 ? <span className="bg-butter text-chocolate rounded-full px-1.5 text-[10px]">{p.count}</span> : null}
              </span>
            </Link>
          );
        })}
      {caption ? (
        <figcaption className="bg-paper/90 font-display text-chocolate absolute bottom-2 left-3 rounded-full px-3 py-1 text-xs font-bold">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
