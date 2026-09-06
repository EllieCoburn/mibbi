import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SetupNotice } from "@/components/layout/setup-notice";
import { getCurrentUser } from "@/lib/data/profile";
import { routes } from "@/lib/routes";

/**
 * Account pages (adopt, collection, profile). Same floating header as the
 * rest of the world; requires a session. The proxy already bounces
 * anonymous visitors, but layouts never trust the proxy alone.
 */
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (!user) redirect(routes.login);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pt-20 pb-10 sm:pt-24">{children}</main>
      <div className="fixed inset-x-0 bottom-0 z-50">
        <SetupNotice />
      </div>
    </>
  );
}
