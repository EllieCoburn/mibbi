/**
 * Environment variable access with validation.
 *
 * Two tiers:
 *  - `publicEnv`  : safe to ship to the browser (NEXT_PUBLIC_*). The anon key is
 *                   designed to be public; Row Level Security is what protects data.
 *  - `serverEnv`  : secrets. Importing this from a client component is a build error
 *                   thanks to the `server-only` guard.
 *
 * Fail fast: a missing variable throws at first access with a readable message
 * instead of a confusing runtime error deep in a request.
 */
import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, "NEXT_PUBLIC_SUPABASE_ANON_KEY looks wrong"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  /** Secret used to HMAC adoption codes before they touch the database. */
  ADOPTION_CODE_PEPPER: z.string().min(16, "ADOPTION_CODE_PEPPER must be at least 16 characters"),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

function formatIssues(issues: z.ZodIssue[]): string {
  return issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
}

let cachedPublic: PublicEnv | undefined;
let cachedServer: ServerEnv | undefined;

/**
 * Public (browser-safe) configuration. Next.js inlines NEXT_PUBLIC_* at build
 * time, so each variable has to be referenced explicitly rather than via
 * `process.env[name]`.
 */
export function getPublicEnv(): PublicEnv {
  if (cachedPublic) return cachedPublic;
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
  if (!parsed.success) {
    throw new Error(
      `Missing or invalid public environment variables:\n${formatIssues(parsed.error.issues)}\n` +
        "Copy .env.example to .env.local and fill in your Supabase project values.",
    );
  }
  cachedPublic = parsed.data;
  return cachedPublic;
}

/** Server-only secrets. Never import from a client component. */
export function getServerEnv(): ServerEnv {
  if (cachedServer) return cachedServer;
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() was called in the browser. This is a bug.");
  }
  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADOPTION_CODE_PEPPER: process.env.ADOPTION_CODE_PEPPER,
  });
  if (!parsed.success) {
    throw new Error(`Missing or invalid server environment variables:\n${formatIssues(parsed.error.issues)}`);
  }
  cachedServer = parsed.data;
  return cachedServer;
}

/** Test helper: clears the cache so tests can vary process.env. */
export function resetEnvCacheForTests(): void {
  cachedPublic = undefined;
  cachedServer = undefined;
}

/**
 * True when the public Supabase settings are present and valid. The site is
 * designed to render its public pages even when this is false, so a fresh
 * deployment shows a clear setup notice instead of crashing.
 */
export function isSupabaseConfigured(): boolean {
  return publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  }).success;
}
