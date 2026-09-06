/**
 * Central route map. Keeps paths in one place so navigation, the proxy and
 * redirects never drift apart.
 */
export const routes = {
  home: "/",
  parents: "/parents",
  news: "/news",
  store: "/store",
  characters: "/mibbis",
  character: (slug: string) => `/mibbis/${slug}`,
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  checkEmail: "/check-email",
  authCallback: "/auth/callback",
  authConfirm: "/auth/confirm",
  // The product
  timeline: "/timeline",
  atlas: "/atlas",
  museum: "/museum",
  adventures: "/adventures",
  adventure: (slug: string) => `/adventures/${slug}`,
  entry: (slug: string) => `/timeline?focus=${slug}`,
  // Signed-in app
  app: "/timeline",
  adopt: "/adopt",
  collection: "/collection",
  world: "/atlas",
  profile: "/profile",
  admin: "/admin",
} as const;

/** Routes that require a signed-in user. Prefix match. */
const PROTECTED_PREFIXES = ["/home", "/adopt", "/collection", "/museum", "/profile", "/admin"];

/** Routes a signed-in user should not see (they bounce to /home). */
const AUTH_ROUTES = new Set<string>(["/login", "/signup"]);

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.has(pathname);
}

/**
 * Only allow same-origin relative redirects after login, so a crafted link
 * can't bounce a user to another site.
 */
export function safeNextPath(next: string | null | undefined, fallback: string = routes.app): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
