/**
 * The illustrated Mibbi World backdrop.
 *
 * Pure SVG + CSS: no images, so it ships instantly and scales to any screen.
 * Every layer is a named group so a final illustration can replace one part
 * at a time (swap <Mountains/> for an <image>, keep the animated clouds, …).
 *
 * Coordinate space is 1600 × 900. `preserveAspectRatio="xMidYMax slice"`
 * keeps the ground anchored at the bottom on every viewport.
 */
import { cn } from "@/lib/utils/cn";

export function WorldScene({ className, variant = "hero" }: { className?: string; variant?: "hero" | "footer" }) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className={cn("absolute inset-0 size-full", className)}
    >
      <defs>
        <linearGradient id="ws-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-sky-deep)" />
          <stop offset="0.55" stopColor="var(--color-sky)" />
          <stop offset="1" stopColor="var(--color-cream)" />
        </linearGradient>
        <radialGradient id="ws-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6cf" />
          <stop offset="0.6" stopColor="var(--color-sun)" />
          <stop offset="1" stopColor="var(--color-sun)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ws-hill-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-grass)" />
          <stop offset="1" stopColor="var(--color-hill-near)" />
        </linearGradient>
        <pattern id="ws-grain" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="rgb(74 46 34 / 0.05)" />
        </pattern>
      </defs>

      {/* Sky */}
      <rect width="1600" height="900" fill="url(#ws-sky)" />
      {variant === "hero" ? <circle cx="1180" cy="200" r="140" fill="url(#ws-sun)" /> : null}

      {/* Sparkles */}
      {variant === "hero"
        ? [
            [220, 140, 6],
            [420, 90, 4],
            [980, 120, 5],
            [1380, 90, 4],
            [1470, 260, 5],
          ].map(([x, y, r], i) => (
            <g key={i} className="animate-twinkle" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${i * 0.7}s` }}>
              <path d={`M${x} ${y - r} l${r * 0.35} ${r * 0.65} l${r * 0.65} ${r * 0.35} l-${r * 0.65} ${r * 0.35} l-${r * 0.35} ${r * 0.65} l-${r * 0.35} -${r * 0.65} l-${r * 0.65} -${r * 0.35} l${r * 0.65} -${r * 0.35}z`} fill="#fff" opacity="0.9" />
            </g>
          ))
        : null}

      {/* Clouds: two drifting bands at different speeds */}
      <g className="animate-drift-slow" style={{ willChange: "transform" }}>
        <Cloud x={60} y={150} s={1.1} />
        <Cloud x={700} y={110} s={0.8} />
        <Cloud x={1250} y={170} s={0.95} />
        <Cloud x={200} y={340} s={0.75} opacity={0.9} />
        <Cloud x={1100} y={370} s={0.65} opacity={0.85} />
      </g>
      <g className="animate-drift" style={{ willChange: "transform" }}>
        <Cloud x={380} y={230} s={0.7} opacity={0.85} />
        <Cloud x={1000} y={260} s={0.6} opacity={0.8} />
      </g>

      {/* Distant mountains */}
      <g id="ws-mountains" opacity="0.9">
        <path d="M0 520 L140 400 L260 470 L400 360 L560 480 L700 390 L860 500 L1000 380 L1180 480 L1320 400 L1460 470 L1600 410 L1600 620 L0 620z" fill="var(--color-hill-far)" />
        <path d="M400 360 L430 392 L370 392z M1000 380 L1030 412 L970 412z M1320 400 L1350 428 L1290 428z" fill="#fff" opacity="0.7" />
      </g>

      {/* Mid hills with a lake */}
      <g id="ws-mid">
        <path d="M0 600 C 200 520, 380 540, 520 600 C 700 670, 860 540, 1040 590 C 1200 640, 1400 560, 1600 600 L1600 760 L0 760z" fill="var(--color-hill-mid)" />
        <ellipse cx="1210" cy="655" rx="170" ry="38" fill="var(--color-water)" />
        <ellipse cx="1210" cy="655" rx="120" ry="20" fill="#fff" opacity="0.25" />
        <Tree x={110} y={585} s={0.8} />
        <Tree x={170} y={600} s={1} />
        <Tree x={1450} y={585} s={0.9} />
        <Tree x={1520} y={605} s={0.7} />
        <House x={300} y={578} s={0.7} roof="var(--color-dusty)" />
        <House x={380} y={592} s={0.6} roof="var(--color-lavender-deep)" />
        <House x={1000} y={590} s={0.65} roof="var(--color-lavender-deep)" />
      </g>

      {/* Near ground with the winding path */}
      <g id="ws-near">
        <path d="M0 720 C 240 660, 420 700, 640 690 C 860 680, 1000 620, 1240 660 C 1420 690, 1520 680, 1600 700 L1600 900 L0 900z" fill="url(#ws-hill-near)" />
        <path d="M0 720 C 240 660, 420 700, 640 690 C 860 680, 1000 620, 1240 660 C 1420 690, 1520 680, 1600 700 L1600 900 L0 900z" fill="url(#ws-grain)" />
        <path d="M760 905 C 700 840, 820 800, 780 760 C 750 730, 640 720, 560 700" stroke="var(--color-path)" strokeWidth="46" strokeLinecap="round" fill="none" />
        <path d="M760 905 C 700 840, 820 800, 780 760 C 750 730, 640 720, 560 700" stroke="rgb(74 46 34 / 0.08)" strokeWidth="46" strokeLinecap="round" fill="none" strokeDasharray="0 90" />
        {/* The Bakery */}
        <Bakery x={440} y={700} />
        {/* Cottages */}
        <House x={1300} y={735} s={0.95} roof="var(--color-roof)" />
        <House x={1400} y={760} s={0.8} roof="var(--color-toast)" />
        {/* Trees */}
        <Tree x={300} y={740} s={1.3} />
        <Tree x={1180} y={745} s={1.1} />
        <Tree x={1540} y={790} s={1} />
        {/* Flowers + mushrooms */}
        {[
          [120, 800],
          [210, 850],
          [980, 790],
          [1060, 840],
          [1120, 880],
          [1480, 860],
        ].map(([x, y], i) => (
          <Flower key={i} x={x} y={y} color={["var(--color-peach)", "var(--color-butter)", "var(--color-lavender)", "#fff"][i % 4]} />
        ))}
        <Mushroom x={880} y={820} />
        <Mushroom x={910} y={835} s={0.7} />
        {/* Signpost */}
        <g transform="translate(600 740)">
          <rect x="-4" y="0" width="8" height="70" fill="var(--color-toast)" />
          <rect x="-46" y="4" width="70" height="22" rx="6" fill="var(--color-paper)" stroke="var(--color-chocolate)" strokeWidth="3" />
          <rect x="-16" y="32" width="62" height="22" rx="6" fill="var(--color-paper)" stroke="var(--color-chocolate)" strokeWidth="3" />
        </g>
      </g>
    </svg>
  );
}

function Cloud({ x, y, s = 1, opacity = 1 }: { x: number; y: number; s?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <ellipse cx="0" cy="0" rx="70" ry="28" fill="#fff" />
      <circle cx="-30" cy="-12" r="30" fill="#fff" />
      <circle cx="18" cy="-20" r="38" fill="#fff" />
      <circle cx="52" cy="-6" r="26" fill="#fff" />
    </g>
  );
}

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="animate-sway" style={{ transformOrigin: `${x}px ${y + 40 * s}px` }}>
      <rect x="-6" y="10" width="12" height="40" rx="4" fill="var(--color-toast)" />
      <circle cx="0" cy="-10" r="34" fill="var(--color-pistachio)" />
      <circle cx="-22" cy="4" r="22" fill="var(--color-pistachio)" />
      <circle cx="22" cy="6" r="22" fill="var(--color-pistachio)" />
      <circle cx="-8" cy="-22" r="10" fill="#fff" opacity="0.25" />
    </g>
  );
}

function House({ x, y, s = 1, roof }: { x: number; y: number; s?: number; roof: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-40" y="-10" width="80" height="60" rx="8" fill="var(--color-wall)" stroke="var(--color-chocolate)" strokeWidth="3" />
      <path d="M-52 -6 L0 -50 L52 -6z" fill={roof} stroke="var(--color-chocolate)" strokeWidth="3" strokeLinejoin="round" />
      <rect x="-10" y="16" width="20" height="34" rx="8" fill="var(--color-chocolate)" />
      <circle cx="-22" cy="12" r="7" fill="var(--color-sun)" stroke="var(--color-chocolate)" strokeWidth="2" />
      <circle cx="22" cy="12" r="7" fill="var(--color-sun)" stroke="var(--color-chocolate)" strokeWidth="2" />
      <rect x="18" y="-46" width="10" height="18" fill="var(--color-chocolate)" />
    </g>
  );
}

function Bakery({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-90" y="-40" width="180" height="110" rx="14" fill="var(--color-wall)" stroke="var(--color-chocolate)" strokeWidth="4" />
      <path d="M-104 -34 Q0 -110 104 -34z" fill="var(--color-apricot)" stroke="var(--color-chocolate)" strokeWidth="4" strokeLinejoin="round" />
      {/* Awning */}
      <path d="M-94 6 h188 v14 a12 12 0 0 1 -12 12 h-164 a12 12 0 0 1 -12 -12z" fill="var(--color-brand)" stroke="var(--color-chocolate)" strokeWidth="4" />
      {[-70, -30, 10, 50].map((sx) => (
        <rect key={sx} x={sx} y={6} width="20" height="26" fill="var(--color-paper)" opacity="0.9" />
      ))}
      {/* Door + windows */}
      <rect x="-16" y="34" width="32" height="36" rx="12" fill="var(--color-chocolate)" />
      <rect x="-72" y="36" width="34" height="26" rx="6" fill="var(--color-sun)" stroke="var(--color-chocolate)" strokeWidth="3" />
      <rect x="38" y="36" width="34" height="26" rx="6" fill="var(--color-sun)" stroke="var(--color-chocolate)" strokeWidth="3" />
      {/* Sign */}
      <rect x="-50" y="-30" width="100" height="26" rx="13" fill="var(--color-paper)" stroke="var(--color-chocolate)" strokeWidth="3" />
      <text x="0" y="-11" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="700" fontSize="16" fill="var(--color-brand)">
        bakery
      </text>
      {/* Chimney smoke */}
      <g className="animate-float" style={{ transformOrigin: "60px -90px" }}>
        <circle cx="62" cy="-96" r="9" fill="#fff" opacity="0.8" />
        <circle cx="72" cy="-114" r="7" fill="#fff" opacity="0.6" />
      </g>
    </g>
  );
}

function Flower({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-2" y="0" width="4" height="22" fill="var(--color-pistachio-deep)" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-8" rx="5" ry="8" fill={color} transform={`rotate(${a})`} />
      ))}
      <circle cx="0" cy="0" r="4" fill="var(--color-butter-deep)" />
    </g>
  );
}

function Mushroom({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-9" y="0" width="18" height="22" rx="6" fill="var(--color-paper)" stroke="var(--color-chocolate)" strokeWidth="2.5" />
      <path d="M-26 4 a26 22 0 0 1 52 0z" fill="var(--color-dusty)" stroke="var(--color-chocolate)" strokeWidth="2.5" />
      <circle cx="-10" cy="-8" r="4" fill="#fff" />
      <circle cx="8" cy="-4" r="3" fill="#fff" />
    </g>
  );
}

/** A small hot-air balloon; a Mibbi rides in the basket. */
export function Balloon({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative", className ?? "w-24 sm:w-32")} aria-hidden="true">
      <svg viewBox="0 0 120 190" className="w-full">
        <path d="M60 6 C 20 6, 6 40, 6 70 C 6 100, 34 120, 52 148 L68 148 C 86 120, 114 100, 114 70 C 114 40, 100 6, 60 6z" fill="var(--color-peach)" stroke="var(--color-chocolate)" strokeWidth="4" />
        <path d="M60 6 C 44 6, 38 60, 52 148 L68 148 C 82 60, 76 6, 60 6z" fill="var(--color-butter)" stroke="var(--color-chocolate)" strokeWidth="3" />
        <path d="M52 148 L46 168 M68 148 L74 168" stroke="var(--color-chocolate)" strokeWidth="3" />
        <rect x="40" y="166" width="40" height="20" rx="6" fill="var(--color-toast)" stroke="var(--color-chocolate)" strokeWidth="3" />
      </svg>
      <div className="absolute inset-x-0 bottom-[6%] flex justify-center">{children}</div>
    </div>
  );
}
