// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { getPublicEnv, getServerEnv, resetEnvCacheForTests } from "@/lib/env";

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
  resetEnvCacheForTests();
});

describe("env validation", () => {
  it("throws a readable error when public vars are missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(() => getPublicEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
  it("parses valid public vars", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "a".repeat(40);
    expect(getPublicEnv().NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });
  it("requires a long pepper", () => {
    process.env.ADOPTION_CODE_PEPPER = "short";
    expect(() => getServerEnv()).toThrow(/ADOPTION_CODE_PEPPER/);
  });
});

describe("cleanEnvValue", () => {
  it("forgives whitespace, quotes and a missing scheme", async () => {
    const { cleanEnvValue } = await import("@/lib/env");
    expect(cleanEnvValue("  https://abc.supabase.co\n", "url")).toBe("https://abc.supabase.co");
    expect(cleanEnvValue('"https://abc.supabase.co"', "url")).toBe("https://abc.supabase.co");
    expect(cleanEnvValue("abc.supabase.co", "url")).toBe("https://abc.supabase.co");
    expect(cleanEnvValue(" sb_publishable_x ")).toBe("sb_publishable_x");
    expect(cleanEnvValue("   ")).toBeUndefined();
  });
  it("accepts a pasted URL with trailing whitespace end to end", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co \n";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "a".repeat(40);
    expect(getPublicEnv().NEXT_PUBLIC_SUPABASE_URL).toBe("https://abc.supabase.co");
  });
});
