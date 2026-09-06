import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Your Mibbis" };

export default function Page() {
  return (
    <ComingSoon
      title="Your Mibbis"
      phase="Next milestone · Companions"
      blurb="Every Mibbi you own, the adventures each one unlocks, and which of them is riding along on the timeline."
    />
  );
}
