/**
 * Session refresh for the request proxy (src/proxy.ts).
 *
 * Supabase access tokens expire; this runs on every matched request, refreshes
 * the token if needed and mirrors the cookies onto the response so the
 * browser and Server Components stay in sync. It also returns the user so
 * the proxy can gate protected routes without a second round-trip.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getPublicEnv, isSupabaseConfigured } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Not configured yet (fresh deployment): behave as signed-out, never crash.
  if (!isSupabaseConfigured()) {
    return { response, user: null };
  }

  const env = getPublicEnv();

  const supabase = createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() validates the JWT against Supabase Auth. Do not replace with
  // getSession(), which trusts the cookie without verifying it.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
