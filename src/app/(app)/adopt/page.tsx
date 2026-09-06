import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Unlock a Mibbi" };

export default function Page() {
  return (
    <ComingSoon
      title="Unlock a Mibbi"
      phase="Next milestone · Portals"
      blurb="Scan the code inside your box. Your Mibbi becomes a companion on the timeline and opens its own adventure."
    />
  );
}
