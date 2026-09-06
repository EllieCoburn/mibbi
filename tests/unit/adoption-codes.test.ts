import { describe, expect, it } from "vitest";
import {
  CODE_ALPHABET,
  CODE_LENGTH,
  adoptionCodeHint,
  formatAdoptionCode,
  generateAdoptionCode,
  isValidAdoptionCodeFormat,
  normalizeAdoptionCode,
} from "@/lib/adoption/codes";

describe("normalizeAdoptionCode", () => {
  it("uppercases and strips separators and whitespace", () => {
    expect(normalizeAdoptionCode(" crum-bdev aaaa ")).toBe("CRUMBDEVAAAA");
    expect(normalizeAdoptionCode("CRUM_BDEV.AAAA")).toBe("CRUMBDEVAAAA");
  });
});

describe("isValidAdoptionCodeFormat", () => {
  it("accepts a well-formed code", () => {
    expect(isValidAdoptionCodeFormat("CRUMBDEVAAAA")).toBe(true);
  });
  it("rejects wrong length", () => {
    expect(isValidAdoptionCodeFormat("CRUMB")).toBe(false);
    expect(isValidAdoptionCodeFormat("CRUMBDEVAAAAA")).toBe(false);
  });
  it("rejects ambiguous characters that are not in the alphabet", () => {
    for (const bad of ["0", "O", "1", "I", "L"]) {
      expect(isValidAdoptionCodeFormat(`CRUMBDEVAAA${bad}`)).toBe(false);
    }
  });
});

describe("formatAdoptionCode / adoptionCodeHint", () => {
  it("groups into fours", () => {
    expect(formatAdoptionCode("CRUMBDEVAAAA")).toBe("CRUM-BDEV-AAAA");
  });
  it("hint is the last four characters", () => {
    expect(adoptionCodeHint("CRUMBDEVAAAA")).toBe("AAAA");
  });
});

describe("generateAdoptionCode", () => {
  it("produces valid codes", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateAdoptionCode();
      expect(code).toHaveLength(CODE_LENGTH);
      expect(isValidAdoptionCodeFormat(code)).toBe(true);
    }
  });
  it("uses rejection sampling so bytes >= 248 are skipped (no modulo bias)", () => {
    // Feed bytes that would be rejected first, then valid ones.
    const seq = [255, 250, 248, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    let cursor = 0;
    const fake = (n: number) => {
      const out = new Uint8Array(n);
      for (let i = 0; i < n; i++) out[i] = seq[(cursor + i) % seq.length];
      cursor += n;
      return out;
    };
    const code = generateAdoptionCode(fake);
    expect(code).toBe(CODE_ALPHABET.slice(0, 12));
  });
  it("is unlikely to repeat", () => {
    const seen = new Set(Array.from({ length: 2000 }, () => generateAdoptionCode()));
    expect(seen.size).toBe(2000);
  });
});
