import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Mibbi Market" };

export default function Page() {
  return (
    <ComingSoon title="Mibbi Market" phase="Phase 4 · Engagement" blurb="Furniture, decorations and snacks for your room, paid for with coins you earned." />
  );
}
