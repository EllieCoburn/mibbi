import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SetupNotice } from "@/components/layout/setup-notice";

/**
 * Public layout. The header floats over the page (the homepage hero runs
 * under it), so inner pages add their own top padding via <PageTop>.
 */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <div className="fixed inset-x-0 bottom-0 z-50">
        <SetupNotice />
      </div>
    </>
  );
}
