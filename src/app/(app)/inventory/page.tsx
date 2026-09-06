import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Inventory" };

export default function Page() {
  return <ComingSoon title="Inventory" phase="Phase 3 · Character experience" blurb="Everything you own, ready to place in your room." />;
}
