/**
 * Request proxy (Next.js 16's replacement for middleware.ts).
 *
 * Responsibilities:
 *  1. Refresh the Supabase session cookie on every page request.
 *  2. Send signed-out visitors to /login when they hit a protected route,
 *     remembering where they were going.
 *  3. Send signed-in users away from /login and /signup.
 *
 * Authorization for admin routes is NOT decided here: the /admin layout
 * checks admin_users server-side, and RLS is the final gate. The proxy only
 * cheaply rejects obviously-anonymous traffic.
 */
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { isAuthRoute, isProtectedRoute } from "@/lib/routes";

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Skip static assets and images; run on everything else (pages + API).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
