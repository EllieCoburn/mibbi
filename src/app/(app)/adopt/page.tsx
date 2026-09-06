import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Adopt a Mibbi" };

export default function Page() {
  return (
    <ComingSoon
      title="Adopt a Mibbi"
      phase="Phase 2 · Adoption"
      blurb="Scan or type the code from inside your box and meet your digital Mibbi. Coming in the next milestone."
    />
  );
}
