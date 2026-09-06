import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Quests" };

export default function Page() {
  return <ComingSoon title="Quests" phase="Phase 4 · Engagement" blurb="Small tasks from your Mibbis. Crumb has a list. It's mostly worries." />;
}
