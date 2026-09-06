import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Mibbi World" };

export default function Page() {
  return (
    <ComingSoon
      title="Mibbi World"
      phase="Phase 6 · World"
      blurb="An illustrated map. The Bakery, Cozy Town, Mibbi Forest, Sunny Beach and the Night Market."
    />
  );
}
