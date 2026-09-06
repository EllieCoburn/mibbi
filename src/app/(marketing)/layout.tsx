import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SetupNotice } from "@/components/layout/setup-notice";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SetupNotice />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
