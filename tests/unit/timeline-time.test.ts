import { describe, expect, it } from "vitest";
import {
  FULL_VIEW,
  MIN_SPAN,
  clampViewport,
  fitViewport,
  formatDuration,
  formatYear,
  jumpViewport,
  niceTickInterval,
  panViewport,
  spanOf,
  ticksFor,
  viewportFromParams,
  viewportToParams,
  xFor,
  yearAtX,
  zoomViewport,
} from "@/lib/timeline/time";

describe("formatYear", () => {
  it("speaks deep time in billions and millions", () => {
    expect(formatYear(-13_800_000_000)).toBe("13.8 billion years ago");
    expect(formatYear(-66_000_000)).toBe("66 million years ago");
    expect(formatYear(-300_000)).toBe("300,000 years ago");
  });
  it("uses BCE / CE for human history", () => {
    expect(formatYear(-3200)).toBe("3,200 BCE");
    expect(formatYear(-753)).toBe("753 BCE");
    expect(formatYear(-9700)).toBe("9,700 BCE");
    expect(formatYear(-63000)).toBe("65,000 years ago");
    expect(formatYear(105)).toBe("105 CE");
    expect(formatYear(1215)).toBe("1215");
    expect(formatYear(2026)).toBe("today");
  });
  it("is proportional: T. rex is nearer to us than to the first dinosaurs", () => {
    const rexToNow = 66_000_000;
    const rexToFirstDino = 233_000_000 - 66_000_000;
    expect(rexToNow).toBeLessThan(rexToFirstDino);
  });
});

describe("formatDuration", () => {
  it("rounds sensibly", () => {
    expect(formatDuration(66_000_000)).toBe("66 million years");
    expect(formatDuration(4_800)).toBe("4,800 years");
    expect(formatDuration(12_000)).toBe("12,000 years");
  });
});

describe("viewport math", () => {
  it("maps years to x proportionally", () => {
    const v = { older: 100, newer: 0 };
    expect(xFor(2026 - 50, v, 1000)).toBeCloseTo(500);
    expect(yearAtX(500, v, 1000)).toBeCloseTo(2026 - 50);
  });
  it("zooming keeps the anchor year fixed", () => {
    const v = { older: 1000, newer: 0 };
    const anchorYear = yearAtX(300, v, 1000);
    const z = zoomViewport(v, 2, 0.3);
    expect(yearAtX(300, z, 1000)).toBeCloseTo(anchorYear, 6);
    expect(spanOf(z)).toBeCloseTo(500);
  });
  it("never zooms tighter than MIN_SPAN or wider than the universe", () => {
    expect(spanOf(zoomViewport({ older: 20, newer: 0 }, 1000, 0.5))).toBeCloseTo(MIN_SPAN);
    expect(zoomViewport(FULL_VIEW, 0.1, 0.5)).toEqual(FULL_VIEW);
  });
  it("pans and clamps at today", () => {
    const v = { older: 100, newer: 0 };
    const p = panViewport(v, -0.5);
    expect(p.newer).toBe(-6);
    expect(spanOf(p)).toBeCloseTo(100);
  });
  it("fits two events with padding", () => {
    const f = fitViewport(-66_000_000, -300_000);
    expect(f.older).toBeGreaterThan(66_000_000 + 2026);
    expect(f.newer).toBeLessThan(300_000 + 2026);
  });
  it("round-trips through URL params", () => {
    const v = clampViewport({ older: 123_456_789, newer: 1234 });
    const p = viewportToParams(v);
    const back = viewportFromParams(p.from, p.to)!;
    expect(back.older).toBeCloseTo(v.older, -2);
    expect(viewportFromParams("10", "20")).toBeNull();
  });
});

describe("ticks", () => {
  it("chooses nice intervals", () => {
    expect(niceTickInterval(1000, 8)).toBe(200);
    expect(niceTickInterval(13_800_000_000, 8)).toBe(2_000_000_000);
  });
  it("labels ticks in the right vocabulary", () => {
    const t = ticksFor({ older: 3000, newer: 0 }, 6);
    expect(t.some((x) => x.label.endsWith("BCE"))).toBe(true);
    expect(t.length).toBeGreaterThan(3);
  });
  it("tick labels stay distinct deep in time", () => {
    const t = ticksFor({ older: 438_310_000 + 2026, newer: 438_300_000 + 2026 }, 5);
    const labels = t.map((x) => x.label);
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels[0]).toMatch(/mya$/);
  });
  it("jump chips produce views containing their year", () => {
    const v = jumpViewport("dinos");
    expect(v.older).toBeGreaterThan(2026 + 160_000_000);
    expect(v.newer).toBeLessThan(2026 + 160_000_000);
  });
});
