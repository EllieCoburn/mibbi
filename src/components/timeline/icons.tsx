/**
 * Small, consistent glyphs for timeline markers, keyed by `icon_key`.
 * Drawn in a 24×24 box with a 2.2 stroke so they read at 14px. Unknown
 * keys fall back to a dot, so new content never breaks.
 */
const P = (d: string) => <path d={d} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />;

const GLYPHS: Record<string, React.ReactNode> = {
  dot: <circle cx="12" cy="12" r="4" fill="currentColor" />,
  star: P("M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"),
  galaxy: (
    <>
      {P("M12 12c0-4 3-6 7-5M12 12c0 4-3 6-7 5M12 12c4 0 6 3 5 7M12 12c-4 0-6-3-5-7")}
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </>
  ),
  sun: (
    <>
      {P("M12 5V3M12 21v-2M5 12H3M21 12h-2M6.5 6.5L5 5M19 19l-1.5-1.5M6.5 17.5L5 19M19 5l-1.5 1.5")}
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </>
  ),
  planet: (
    <>
      {P("M4 14c3 3 13 3 16 0")}
      <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </>
  ),
  moon: P("M14 3a8 8 0 1 0 7 11 6 6 0 0 1-7-11z"),
  comet: (
    <>
      {P("M4 20l7-7M3 15l5-5M8 21l5-5")}
      <circle cx="16" cy="8" r="4" fill="currentColor" />
    </>
  ),
  fire: P("M12 21c-4 0-6-3-6-6 0-4 4-6 3-11 3 2 3 5 3 6 1-1 2-2 2-4 3 3 4 6 4 9 0 3-2 6-6 6z"),
  wave: P("M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"),
  bubble: <>{P("M9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z")}</>,
  cell: (
    <>
      {P("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z")}
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </>
  ),
  leaf: P("M4 20c2-8 8-13 16-14-1 8-6 14-14 14M4 20l7-7"),
  fern: P("M12 21V5M12 9c-3-1-5-3-6-6M12 9c3-1 5-3 6-6M12 14c-3-1-5-3-6-6M12 14c3-1 5-3 6-6M12 19c-3-1-4-3-5-5M12 19c3-1 4-3 5-5"),
  flower: (
    <>
      {P("M12 21v-6M9 6a3 3 0 1 1 6 0 3 3 0 0 1 6 6 3 3 0 0 1-6 6 3 3 0 0 1-6 0 3 3 0 0 1-6-6 3 3 0 0 1 6-6z")}
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </>
  ),
  grass: P("M4 21c0-6 2-10 3-13M9 21c0-7 2-11 4-15M14 21c0-6 3-10 6-12M19 21c0-4 1-7 2-9"),
  wheat: P("M12 21V9M12 9c-3 0-5-2-5-5 3 0 5 2 5 5zM12 9c3 0 5-2 5-5-3 0-5 2-5 5zM12 14c-3 0-5-2-5-5 3 0 5 2 5 5zM12 14c3 0 5-2 5-5-3 0-5 2-5 5z"),
  shell: P("M4 16a8 8 0 0 1 16 0H4zM12 8v8M8 10l4 6M16 10l-4 6"),
  trilobite: <>{P("M12 3c-5 0-8 4-8 9s3 9 8 9 8-4 8-9-3-9-8-9zM4 12h16M4 8h16M4 16h16")}</>,
  fish: P("M3 12c3-4 7-6 11-6l7 6-7 6c-4 0-8-2-11-6zM3 12l-1-4M3 12l-1 4"),
  bug: (
    <>
      {P("M12 8v13M8 12H4M20 12h-4M6 6l3 3M18 6l-3 3M6 18l3-3M18 18l-3-3")}
      <ellipse cx="12" cy="13" rx="4" ry="7" fill="currentColor" />
    </>
  ),
  egg: P("M12 3c4 0 7 6 7 11a7 7 0 0 1-14 0c0-5 3-11 7-11z"),
  dino: P("M3 19h7l1-4 3 1 1 3h3l-2-6 4-4-1-4-3 1-3 4-3-1-2 3-2 2z"),
  feather: P("M20 4c-8 0-14 6-14 14v2M6 20c8 0 14-6 14-14M6 20l6-6M9 17l-4-1M12 14l-4-1M15 11l-4-1"),
  paw: (
    <>
      {[
        ["8", "8"],
        ["12", "5"],
        ["16", "8"],
      ].map(([x, y]) => (
        <circle key={x + y} cx={x} cy={y} r="2" fill="currentColor" />
      ))}
      {P("M12 19c-4 0-6-3-4-6 1-2 3-3 4-3s3 1 4 3c2 3 0 6-4 6z")}
    </>
  ),
  skull: (
    <>
      {P("M12 3a8 8 0 0 0-5 14v4h10v-4a8 8 0 0 0-5-14z")}
      <circle cx="9" cy="11" r="1.8" fill="currentColor" />
      <circle cx="15" cy="11" r="1.8" fill="currentColor" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="6" r="3" fill="currentColor" />
      {P("M6 21v-4a6 6 0 0 1 12 0v4")}
    </>
  ),
  footprints: <>{P("M8 4c-2 0-3 2-3 5s1 5 2 7l2-1c1-2 1-6 0-9-.3-1-.7-2-1-2zM16 8c-2 0-3 2-3 5s1 5 2 7l2-1c1-2 1-6 0-9-.3-1-.7-2-1-2z")}</>,
  flint: P("M4 20l5-14 11-3-3 11-13 6zM9 6l8 8"),
  paint: P("M4 20c0-4 2-6 4-6l8-8 4 4-8 8c0 2-2 4-6 4-1 0-2-1-2-2zM14 8l2 2"),
  pot: P("M8 4h8l1 3H7zM7 7h10c1 5 0 10-1 13H8c-1-3-2-8-1-13z"),
  wheel: <>{P("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 3v18M3 12h18M6 6l12 12M18 6L6 18")}</>,
  scroll: P("M6 4h12v14H6zM6 8H4v10a2 2 0 0 0 4 0M18 8h2v10a2 2 0 0 1-4 0M9 8h6M9 12h6"),
  city: P("M3 21h18M5 21V9h5v12M10 21V5h5v16M15 21v-8h4v8M7 12h1M7 15h1M12 8h1M12 11h1M12 14h1"),
  pyramid: P("M3 20L12 4l9 16zM12 4v16M3 20l9-6 9 6"),
  column: P("M6 4h12M6 20h12M8 4v16M16 4v16M8 7h8M8 17h8"),
  stone: P("M5 20h14l-2-8 2-6H5l2 6z"),
  house: P("M4 11l8-7 8 7v9H4zM10 20v-5h4v5"),
  temple: P("M3 9l9-5 9 5M5 9v9M9 9v9M15 9v9M19 9v9M3 18h18M3 21h18"),
  wall: P("M3 21V9h18v12M3 13h18M3 17h18M8 9v4M14 13v4M8 17v4"),
  crown: P("M4 18h16l1-10-5 4-4-6-4 6-5-4z"),
  head: P("M12 3c-4 0-7 3-7 8s3 8 7 10c4-2 7-5 7-10s-3-8-7-8zM9 11h2M13 11h2M10 15h4"),
  laurel: P("M12 21V9M12 9c-4 0-7-3-7-7 4 0 7 3 7 7zM12 9c4 0 7-3 7-7-4 0-7 3-7 7zM12 15c-4 0-7-3-7-7 4 0 7 3 7 7zM12 15c4 0 7-3 7-7-4 0-7 3-7 7z"),
  lotus: P("M12 20c-5 0-8-3-8-7 3 0 5 1 6 2-1-3 0-6 2-9 2 3 3 6 2 9 1-1 3-2 6-2 0 4-3 7-8 7z"),
  boat: P("M3 15l2 5h14l2-5zM3 15c6 2 12 2 18 0M12 15V4M12 4l7 8h-7"),
  camel: P("M4 19v-6c0-3 2-5 4-5s3 1 4 3c1-2 2-3 4-3s3 2 3 5v6M15 8V5h3M8 19v-3M17 19v-3"),
  horse: P("M4 19v-7l4-5 3-3 3 1v3l3 2 3 6v3M8 19v-4M17 19v-4M11 5L9 3"),
  compass: (
    <>
      {P("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z")}
      <path d="M12 5l3 7-3 7-3-7z" fill="currentColor" />
    </>
  ),
  ingot: P("M5 16l2-7h10l2 7zM3 16h18v3H3z"),
  anvil: P("M3 8h13l5-3v4l-6 3v3h2v3H7v-3h2v-3L3 10z"),
  spark: P("M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"),
  gear: (
    <>
      {P("M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1")}
      <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </>
  ),
  train: P("M6 4h12v11H6zM6 15l-2 5M18 15l2 5M9 20h6M8 8h8M9 12h1M14 12h1"),
  car: P("M3 15l2-6h14l2 6v4H3zM7 19v2M17 19v2M6 15h12"),
  plane: P("M3 13l18-8-6 16-3-6zM12 15l6-8"),
  satellite: P("M10 14l4-4M5 9l4-4 4 4-4 4zM11 19l4-4 4 4-4 4zM14 10l3 3"),
  telescope: P("M4 16l10-9 3 4-10 9zM14 7l4-3 3 4-4 3M8 20l3-4M12 20l-1-4"),
  bulb: P("M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z"),
  phone: P("M7 3h10v18H7zM11 18h2"),
  computer: P("M3 5h18v11H3zM8 20h8M12 16v4"),
  globe: <>{P("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18")}</>,
  flag: P("M5 21V4M5 4h12l-2 4 2 4H5"),
  shield: P("M12 3l8 3v6c0 5-3 8-8 9-5-1-8-4-8-9V6z"),
  dna: P("M7 3c0 6 10 6 10 12s-10 6-10 6M17 3c0 6-10 6-10 12s10 6 10 6M8 8h8M8 16h8"),
  apple: P("M12 6c-1-2-3-2-3-2M12 7c-4-2-8 1-7 6s4 8 7 8 6-3 7-8-3-8-7-6z"),
  quill: P("M4 20c2-8 8-14 16-16-2 8-8 14-16 16zM4 20l8-8"),
  camera: P("M3 8h4l2-3h6l2 3h4v11H3z"),
  book: P("M4 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z"),
  soldier: P("M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM7 21v-8a5 5 0 0 1 10 0v8M9 13v8M15 13v8"),
  mound: P("M3 18c3-8 15-8 18 0zM3 18h18"),
  snow: P("M12 3v18M3 12h18M6 6l12 12M18 6L6 18"),
  mountain: P("M3 20l6-10 4 6 3-4 5 8zM9 10l2 3"),
  bird: P("M3 13c3-3 6-3 9 0 3-3 6-3 9 0M12 13v6"),
  you: (
    <>
      <circle cx="12" cy="9" r="5" fill="currentColor" />
      {P("M12 14v7M8 21h8")}
    </>
  ),
};

export function Glyph({ name, className, size = 14 }: { name: string | null | undefined; className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      {GLYPHS[name ?? "dot"] ?? GLYPHS.dot}
    </svg>
  );
}

export const CATEGORY_LABEL: Record<string, string> = {
  cosmos: "Cosmos",
  earth: "Earth",
  life: "Life",
  humans: "Humans",
  civilizations: "Civilizations",
  science: "Science",
  technology: "Technology",
  art: "Art",
  culture: "Culture",
  migration: "Migration",
  invention: "Invention",
  exploration: "Exploration",
  ideas: "Ideas",
  history: "History",
};
