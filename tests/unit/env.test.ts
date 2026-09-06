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
