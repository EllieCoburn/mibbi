/**
 * The journey through time: one continuous panorama, left to right, from
 * the first stars to right now. Each segment is a named group so final
 * illustration can replace it piece by piece. Pure SVG, no images.
 */
import { cn } from "@/lib/utils/cn";

export const JOURNEY_STOPS = [
  { key: "space", label: "The first stars", year: "13.8 bya", x: 5 },
  { key: "early-earth", label: "Early Earth", year: "4.5 bya", x: 16 },
  { key: "sea", label: "First life", year: "3.7 bya", x: 27 },
  { key: "dinos", label: "Dinosaurs", year: "160 mya", x: 40 },
  { key: "humans", label: "First humans", year: "300,000 ya", x: 53 },
  { key: "cities", label: "First cities", year: "3500 BCE", x: 65 },
  { key: "ships", label: "Ships cross oceans", year: "1500", x: 76 },
  { key: "machines", label: "Machines", year: "1800", x: 86 },
  { key: "now", label: "You are here", year: "today", x: 96 },
];

export function JourneyScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className={cn("absolute inset-0 size-full", className)}
    >
      <defs>
        <linearGradient id="js-sky" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2f2a4d" />
          <stop offset="0.14" stopColor="#4a3d6b" />
          <stop offset="0.26" stopColor="#7e9bc2" />
          <stop offset="0.45" stopColor="#a9c8e6" />
          <stop offset="0.7" stopColor="#cfe3f2" />
          <stop offset="1" stopColor="#fbe7a1" />
        </linearGradient>
        <linearGradient id="js-ground" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3b3550" />
          <stop offset="0.14" stopColor="#c8553d" />
          <stop offset="0.24" stopColor="#7e9bc2" />
          <stop offset="0.36" stopColor="#7fa36b" />
          <stop offset="0.55" stopColor="#c98a4b" />
          <stop offset="0.7" stopColor="#e3b341" />
          <stop offset="0.85" stopColor="#8fae8b" />
          <stop offset="1" stopColor="#a8cf8e" />
        </linearGradient>
        <pattern id="js-grain" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="rgb(74 46 34 / 0.06)" />
        </pattern>
      </defs>

      {/* Sky: night on the left, warm day on the right */}
      <rect width="1600" height="900" fill="url(#js-sky)" />

      {/* Stars fade out to the right */}
      {[
        [40, 80],
        [110, 200],
        [170, 60],
        [230, 260],
        [300, 120],
        [360, 40],
        [420, 210],
        [90, 330],
        [260, 380],
        [200, 470],
        [60, 520],
        [340, 300],
        [470, 90],
        [520, 330],
      ].map(([x, y], i) => (
        <g key={i} className="animate-twinkle" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${(i % 6) * 0.5}s` }}>
          <circle cx={x} cy={y} r={i % 3 === 0 ? 3 : 2} fill="#fff" opacity={Math.max(0.15, 1 - x / 560)} />
        </g>
      ))}
      {/* A galaxy swirl and the young Sun */}
      <g opacity="0.7">
        <ellipse cx="120" cy="240" rx="90" ry="26" fill="#b7a9d6" opacity="0.35" transform="rotate(-20 120 240)" />
        <ellipse cx="120" cy="240" rx="50" ry="14" fill="#fff" opacity="0.5" transform="rotate(-20 120 240)" />
      </g>
      <circle cx="1400" cy="170" r="110" fill="#fff6cf" opacity="0.9" />
      <circle cx="1400" cy="170" r="160" fill="#fbe7a1" opacity="0.35" />
      {/* Moon over early Earth */}
      <circle cx="330" cy="150" r="34" fill="#f5ede2" />
      <circle cx="318" cy="140" r="6" fill="#e6dccb" />

      {/* Clouds from the middle onward */}
      <g className="animate-drift-slow" style={{ willChange: "transform" }}>
        {[
          [700, 150, 0.9],
          [980, 110, 0.8],
          [1250, 220, 1],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <ellipse cx="0" cy="0" rx="70" ry="26" fill="#fff" />
            <circle cx="-28" cy="-12" r="28" fill="#fff" />
            <circle cx="20" cy="-18" r="36" fill="#fff" />
          </g>
        ))}
      </g>

      {/* Far hills / mountains */}
      <path
        d="M0 560 L120 500 L260 560 L400 470 L560 560 L700 480 L860 560 L1000 460 L1160 550 L1320 470 L1460 540 L1600 490 L1600 700 L0 700z"
        fill="#fff"
        opacity="0.18"
      />

      {/* Ground band that changes colour with the eras */}
      <path d="M0 720 C 200 660, 400 700, 600 690 C 820 680, 1000 620, 1240 660 C 1420 690, 1520 680, 1600 700 L1600 900 L0 900z" fill="url(#js-ground)" />
      <path d="M0 720 C 200 660, 400 700, 600 690 C 820 680, 1000 620, 1240 660 C 1420 690, 1520 680, 1600 700 L1600 900 L0 900z" fill="url(#js-grain)" />

      {/* The path of time */}
      <path
        d="M-20 860 C 200 800, 380 840, 600 790 C 820 740, 1000 780, 1200 730 C 1380 690, 1500 700, 1620 690"
        stroke="#fff4e3"
        strokeWidth="26"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M-20 860 C 200 800, 380 840, 600 790 C 820 740, 1000 780, 1200 730 C 1380 690, 1500 700, 1620 690"
        stroke="#4a2e22"
        strokeWidth="3"
        strokeDasharray="10 14"
        fill="none"
        opacity="0.35"
      />

      {/* Segment props, left to right */}
      {/* Early Earth: volcano */}
      <g transform="translate(250 700)">
        <path d="M-70 60 L-20 -40 L20 -40 L70 60z" fill="#7a3a2c" stroke="#4a2e22" strokeWidth="3" strokeLinejoin="round" />
        <path d="M-16 -40 Q0 -70 16 -40z" fill="#e0685a" />
        <g className="animate-float" style={{ transformOrigin: "0px -60px" }}>
          <circle cx="0" cy="-72" r="10" fill="#c9c2d4" opacity="0.8" />
          <circle cx="14" cy="-92" r="8" fill="#c9c2d4" opacity="0.6" />
        </g>
      </g>
      {/* Sea: waves and a trilobite */}
      <path d="M380 760 q20 -12 40 0 t40 0 t40 0 t40 0" stroke="#fff" strokeWidth="4" fill="none" opacity="0.7" strokeLinecap="round" />
      <ellipse cx="470" cy="800" rx="22" ry="12" fill="#5d7fa8" stroke="#4a2e22" strokeWidth="2.5" />
      <path d="M452 800 h36 M460 792 v16 M470 790 v20 M480 792 v16" stroke="#4a2e22" strokeWidth="2" />
      {/* Dinosaurs: fern + long-neck silhouette */}
      <g transform="translate(640 690)">
        <path
          d="M0 40 C -10 0, -60 -20, -70 -60 M0 40 C 10 0, 60 -20, 70 -60 M0 40 C 0 0, -20 -50, 0 -90"
          stroke="#3f6f45"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </g>
      <g transform="translate(740 700)">
        <ellipse cx="0" cy="0" rx="46" ry="26" fill="#6f9270" stroke="#4a2e22" strokeWidth="3" />
        <path d="M30 -10 C 60 -60, 80 -90, 96 -120" stroke="#6f9270" strokeWidth="18" strokeLinecap="round" fill="none" />
        <path d="M30 -10 C 60 -60, 80 -90, 96 -120" stroke="#4a2e22" strokeWidth="24" strokeLinecap="round" fill="none" opacity="0" />
        <circle cx="100" cy="-126" r="13" fill="#6f9270" stroke="#4a2e22" strokeWidth="3" />
        <circle cx="105" cy="-129" r="2.5" fill="#4a2e22" />
        <path d="M-40 8 C -70 20, -90 40, -110 60" stroke="#6f9270" strokeWidth="14" strokeLinecap="round" fill="none" />
        <rect x="-26" y="14" width="12" height="30" rx="5" fill="#6f9270" stroke="#4a2e22" strokeWidth="3" />
        <rect x="14" y="14" width="12" height="30" rx="5" fill="#6f9270" stroke="#4a2e22" strokeWidth="3" />
      </g>
      {/* Early humans: campfire and cave art */}
      <g transform="translate(880 720)">
        <path d="M-30 20 L-14 -30 L14 -30 L30 20z" fill="#7a5a44" stroke="#4a2e22" strokeWidth="3" strokeLinejoin="round" />
        <path d="M-6 -6 q6 -14 12 0 q4 8 -6 12 q-10 -4 -6 -12z" fill="#f2a65a" stroke="#c8553d" strokeWidth="2" />
        <g className="animate-float" style={{ transformOrigin: "0px 0px" }}>
          <path d="M-4 -28 q6 -12 10 0" stroke="#f6d68a" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      </g>
      <g transform="translate(940 690)" opacity="0.8">
        <path d="M0 0 h26 M6 -8 l8 -8 l8 8 M13 -16 v-10" stroke="#c8553d" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      {/* First cities: ziggurat + pyramid */}
      <g transform="translate(1040 700)">
        <rect x="-60" y="10" width="120" height="30" fill="#e3b341" stroke="#4a2e22" strokeWidth="3" />
        <rect x="-42" y="-16" width="84" height="26" fill="#e3b341" stroke="#4a2e22" strokeWidth="3" />
        <rect x="-24" y="-40" width="48" height="24" fill="#e3b341" stroke="#4a2e22" strokeWidth="3" />
      </g>
      <path d="M1120 740 L1180 660 L1240 740z" fill="#f6d68a" stroke="#4a2e22" strokeWidth="3" strokeLinejoin="round" />
      {/* Ships */}
      <g transform="translate(1300 690)" className="animate-bob">
        <path d="M-40 20 h80 l-12 22 h-56z" fill="#7a5a44" stroke="#4a2e22" strokeWidth="3" strokeLinejoin="round" />
        <rect x="-3" y="-40" width="6" height="60" fill="#4a2e22" />
        <path d="M3 -38 q38 20 0 44z" fill="#fff4e3" stroke="#4a2e22" strokeWidth="3" />
        <path d="M-3 -34 q-28 16 0 34z" fill="#fff4e3" stroke="#4a2e22" strokeWidth="3" />
      </g>
      {/* Machines: gear + train */}
      <g transform="translate(1400 700)">
        <circle cx="0" cy="0" r="24" fill="#7a635a" stroke="#4a2e22" strokeWidth="3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <rect key={a} x="-5" y="-34" width="10" height="12" rx="2" fill="#7a635a" stroke="#4a2e22" strokeWidth="2.5" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="8" fill="#fff4e3" stroke="#4a2e22" strokeWidth="2.5" />
      </g>
      {/* Modern world: skyline */}
      <g transform="translate(1500 700)">
        <rect x="-50" y="-40" width="26" height="70" rx="4" fill="#b9c9db" stroke="#4a2e22" strokeWidth="3" />
        <rect x="-18" y="-70" width="30" height="100" rx="4" fill="#dfe8f0" stroke="#4a2e22" strokeWidth="3" />
        <rect x="18" y="-30" width="24" height="60" rx="4" fill="#b9c9db" stroke="#4a2e22" strokeWidth="3" />
        {[
          [-44, -30],
          [-44, -12],
          [-10, -60],
          [0, -60],
          [-10, -42],
          [0, -42],
          [24, -20],
          [24, -4],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="7" height="9" rx="1.5" fill="#f6d68a" />
        ))}
      </g>
    </svg>
  );
}
