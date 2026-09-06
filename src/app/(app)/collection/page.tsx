import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Your collection" };

export default function Page() {
  return (
    <ComingSoon
      title="Your collection"
      phase="Phase 2 · Collection"
      blurb="Every Mibbi you own, every one you're missing, and how close you are to completing each series."
    />
  );
}
