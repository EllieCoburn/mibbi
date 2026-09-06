import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app/app-header";
import { AppNav } from "@/components/app/app-nav";
import { getCurrentUser, getHomeSnapshot } from "@/lib/data/profile";
import { routes } from "@/lib/routes";

/**
 * Signed-in app shell. The proxy already bounces anonymous visitors, but we
 * check again here: layouts must never trust the proxy alone.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (!user) redirect(routes.login);

  const snapshot = await getHomeSnapshot(user.id);

  return (
    <div className="flex min-h-full flex-1 flex-col sm:pl-20 lg:pl-56">
      <AppNav />
      <AppHeader user={user} coins={snapshot.coins} />
      <main className="flex-1 pb-24 sm:pb-8">{children}</main>
    </div>
  );
}
