"use client";

/**
 * The river of time: a glowing ribbon that flows from the beginning to
 * YOU ARE HERE, changing colour with the ages. Drawn as SVG so the gradient
 * is sampled from the current viewport (cosmic indigo on the left of a
 * wide view, terracotta at the right; at a tight zoom, one hue).
 */
import { PRESENT_YEAR, riverColorAt, xFor, yearAtX, yearsAgo, type Viewport } from "@/lib/timeline/time";

export function River({ view, width, height, y }: { view: Viewport; width: number; height: number; y: number }) {
  const samples = 24;
  const stops = Array.from({ length: samples + 1 }, (_, i) => {
    const x = (i / samples) * width;
    const ago = yearsAgo(yearAtX(x, view, width));
    return { offset: i / samples, color: riverColorAt(Math.max(ago, 0)) };
  });
  const hereX = xFor(PRESENT_YEAR, view, width);
  const end = Math.min(width + 40, hereX);
  // A gentle wave; amplitude shrinks with height so it never crowds lanes.
  const amp = Math.min(10, height * 0.02);
  const d = Array.from({ length: 41 }, (_, i) => {
    const x = (i / 40) * Math.max(end, 0);
    const yy = y + Math.sin((i / 40) * Math.PI * 4) * amp;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${yy.toFixed(1)}`;
  }).join(" ");

  return (
    <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
      <defs>
        <linearGradient id="river-grad" x1="0" y1="0" x2="1" y2="0">
          {stops.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
        <filter id="river-glow" x="-5%" y="-200%" width="110%" height="500%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      {end > 0 ? (
        <>
          <path d={d} stroke="url(#river-grad)" strokeWidth="34" strokeLinecap="round" fill="none" opacity="0.45" filter="url(#river-glow)" />
          <path d={d} stroke="url(#river-grad)" strokeWidth="18" strokeLinecap="round" fill="none" />
          <path d={d} stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.35" strokeDasharray="2 22" />
        </>
      ) : null}
    </svg>
  );
}

/** Stars for cosmic scales; fade out as the view narrows. */
export function Stars({ opacity }: { opacity: number }) {
  if (opacity <= 0.02) return null;
  const pts = [
    [3, 8],
    [9, 22],
    [14, 6],
    [21, 30],
    [27, 12],
    [33, 4],
    [40, 24],
    [47, 9],
    [52, 31],
    [58, 15],
    [64, 5],
    [70, 27],
    [76, 11],
    [82, 33],
    [88, 7],
    [94, 20],
    [98, 36],
    [18, 40],
    [45, 42],
    [72, 44],
    [8, 46],
    [35, 47],
    [61, 48],
    [90, 45],
  ];
  return (
    <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden="true" style={{ opacity }}>
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={`${x}%`}
          cy={`${y}%`}
          r={i % 4 === 0 ? 2.2 : 1.4}
          fill="#fff"
          className="animate-twinkle"
          style={{ animationDelay: `${(i % 7) * 0.6}s`, transformOrigin: `${x}% ${y}%` }}
        />
      ))}
    </svg>
  );
}
