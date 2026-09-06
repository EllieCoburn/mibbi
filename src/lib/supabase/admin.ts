import "server-only";

/**
 * Service-role Supabase client. BYPASSES Row Level Security.
 *
 * Only for trusted server code: admin dashboard actions, code generation,
 * webhooks. Never pass its results to the client unfiltered, and never
 * import this file from anything that could be bundled for the browser.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getPublicEnv, getServerEnv } from "@/lib/env";

export function createAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set; admin operations are unavailable.");
  }
  return createSupabaseClient<Database>(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
