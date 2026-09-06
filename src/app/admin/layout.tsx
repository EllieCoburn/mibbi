import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { getCurrentUser } from "@/lib/data/profile";
import { routes } from "@/lib/routes";

/**
 * Admin gate. Admin status comes from the admin_users table, never from the
 * profile the user can edit. Non-admins are sent to the app, not shown a 403,
 * so the existence of /admin isn't advertised.
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentUser();
  if (!user) redirect(`${routes.login}?next=${routes.admin}`);
  if (!user.isAdmin) redirect(routes.app);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-line bg-paper border-b">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo href={routes.admin} size="sm" />
            <span className="bg-chocolate font-display text-paper rounded-full px-2 py-0.5 text-xs font-semibold">Admin · {user.adminRole}</span>
          </div>
          <Link href={routes.app} className="font-display text-ink-soft hover:text-brand text-sm font-semibold">
            ← Back to app
          </Link>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
