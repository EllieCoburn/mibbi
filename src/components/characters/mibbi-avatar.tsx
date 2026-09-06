import type { CSSProperties } from "react";
import { getPersonality, type Expression } from "@/lib/content/personalities";
import { cn } from "@/lib/utils/cn";

export interface MibbiAvatarProps {
  /** Display name for the accessible label. */
  name: string;
  color: string;
  shape?: string | null;
  personalityKey?: string | null;
  /** Final artwork, when available. Falls back to the placeholder blob. */
  imageUrl?: string | null;
  /** Renders the silhouette used for un-owned characters in the collection. */
  silhouette?: boolean;
  size?: number | string;
  className?: string;
  animate?: boolean;
}

/* Body outlines for the placeholder. Drawn in a 100x100 box. */
const SHAPES: Record<string, string> = {
  blob: "M50 8c22 0 40 14 40 34 0 22-14 40-40 50C24 82 10 64 10 42 10 22 28 8 50 8z",
  round: "M50 10a40 40 0 1 1 0 80 40 40 0 0 1 0-80z",
  tall: "M50 6c16 0 28 10 28 30v28c0 18-12 30-28 30S22 82 22 64V36C22 16 34 6 50 6z",
  square: "M26 14h48c8 0 14 6 14 14v48c0 8-6 14-14 14H26c-8 0-14-6-14-14V28c0-8 6-14 14-14z",
};

/**
 * Placeholder character art: a soft blob with a face that reflects the
 * character's personality. Everything is driven by data so a new character
 * (or new final artwork) needs no code change.
 */
export function MibbiAvatar({ name, color, shape, personalityKey, imageUrl, silhouette, size = 96, className, animate }: MibbiAvatarProps) {
  const dimension = typeof size === "number" ? `${size}px` : size;
  const style: CSSProperties = { width: dimension, height: dimension };

  if (imageUrl && !silhouette) {
    // eslint-disable-next-line @next/next/no-img-element -- remote art may be any host; sized by parent
    return <img src={imageUrl} alt={name} style={style} className={cn("object-contain", animate && "animate-float", className)} />;
  }

  const expression: Expression = silhouette ? "neutral" : getPersonality(personalityKey).expression;
  const bodyPath = SHAPES[shape ?? "blob"] ?? SHAPES.blob;
  const fill = silhouette ? "var(--color-line)" : color;

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={silhouette ? `${name} (not adopted yet)` : name}
      style={style}
      className={cn("overflow-visible", animate && "animate-float", className)}
    >
      {/* Soft shadow under the body */}
      <ellipse cx="50" cy="94" rx="30" ry="4" fill="rgb(74 46 34 / 0.12)" />
      <path d={bodyPath} fill={fill} />
      {/* Highlight */}
      {!silhouette ? <path d="M30 28c4-6 12-9 18-8" stroke="rgb(255 255 255 / 0.5)" strokeWidth="4" strokeLinecap="round" fill="none" /> : null}
      {!silhouette ? <Face expression={expression} /> : null}
    </svg>
  );
}

const INK = "var(--color-chocolate)";
const BLUSH = "rgb(224 104 90 / 0.35)";

function Face({ expression }: { expression: Expression }) {
  switch (expression) {
    case "sleepy":
      return (
        <g>
          <path d="M34 50q5 4 10 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M56 50q5 4 10 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M45 62q5 2 10 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <Blush />
        </g>
      );
    case "worried":
      return (
        <g>
          <Eyes />
          <path d="M33 43l8-3M67 43l-8-3" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M44 64q6-4 12 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <Blush />
        </g>
      );
    case "dramatic":
      return (
        <g>
          <Eyes wide />
          <ellipse cx="50" cy="64" rx="7" ry="6" fill={INK} />
          <ellipse cx="50" cy="66" rx="4" ry="2.5" fill="var(--color-peach)" />
          <Blush strong />
        </g>
      );
    case "chaotic":
      return (
        <g>
          <circle cx="39" cy="48" r="4" fill={INK} />
          <path d="M56 48q5-5 10 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M40 62q10 8 20 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M52 64q4 6 0 8" fill="var(--color-peach)" stroke="var(--color-peach)" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "kind":
      return (
        <g>
          <path d="M34 48q5-5 10 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M56 48q5-5 10 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M42 60q8 7 16 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <Blush strong />
        </g>
      );
    case "curious":
      return (
        <g>
          <Eyes />
          <path d="M42 60q8 8 16 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M31 38l6-4" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "shy":
      return (
        <g>
          <Eyes small />
          <path d="M46 62q4 2 8 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <Blush strong />
        </g>
      );
    case "mysterious":
      return (
        <g>
          <path d="M34 48h10M56 48h10" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M44 62q6 3 12 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M74 26l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="var(--color-paper)" />
        </g>
      );
    case "happy":
      return (
        <g>
          <Eyes />
          <path d="M40 60q10 10 20 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <Blush />
        </g>
      );
    default:
      return (
        <g>
          <Eyes />
          <path d="M44 61q6 4 12 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <Blush />
        </g>
      );
  }
}

function Eyes({ wide, small }: { wide?: boolean; small?: boolean }) {
  const r = wide ? 5 : small ? 2.6 : 3.6;
  return (
    <g className="animate-blink origin-center" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      <circle cx="39" cy="48" r={r} fill={INK} />
      <circle cx="61" cy="48" r={r} fill={INK} />
      <circle cx="40.5" cy="46.5" r={r / 3} fill="white" />
      <circle cx="62.5" cy="46.5" r={r / 3} fill="white" />
    </g>
  );
}

function Blush({ strong }: { strong?: boolean }) {
  const o = strong ? 0.6 : 0.35;
  return (
    <g style={{ opacity: o }}>
      <ellipse cx="30" cy="58" rx="6" ry="3.5" fill={BLUSH} />
      <ellipse cx="70" cy="58" rx="6" ry="3.5" fill={BLUSH} />
    </g>
  );
}
