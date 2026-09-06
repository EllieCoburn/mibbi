import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Games" };

export default function Page() {
  return <ComingSoon title="Games" phase="Phase 5 · Gameplay" blurb="Bakery Catch and friends. Earn Mibbi Coins by playing." />;
}
