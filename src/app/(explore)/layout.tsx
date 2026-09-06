import { SiteHeader } from "@/components/layout/site-header";
import { SetupNotice } from "@/components/layout/setup-notice";

/**
 * Full-height layout for the product surfaces (timeline, atlas, museum,
 * adventures). The floating header sits over the page; content clears it.
 */
export default function ExploreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[100svh] flex-1 flex-col pt-20 pb-4 sm:pt-24">{children}</main>
      <div className="fixed inset-x-0 bottom-0 z-50">
        <SetupNotice />
      </div>
    </>
  );
}
