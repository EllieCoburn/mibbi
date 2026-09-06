import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { getAdminOverview } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Admin" };

/** Phase 1 overview. Phase 7 replaces this with the full CMS. */
export default async function AdminHome() {
  const o = await getAdminOverview();
  const tiles: Array<[string, number]> = [
    ["Users", o.users],
    ["Characters (active)", o.activeCharacters],
    ["Series (active)", o.activeSeries],
    ["Codes generated", o.codesTotal],
    ["Codes redeemed", o.codesRedeemed],
    ["Mibbis adopted", o.mibbisAdopted],
  ];
  const sections = ["Characters", "Series", "Redemption codes", "Items", "Quests", "Achievements", "Locations", "Users", "Analytics"];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl">Overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {tiles.map(([label, value]) => (
          <Card key={label}>
            <CardBody className="py-4">
              <p className="font-display text-ink-mute text-xs font-semibold tracking-wide uppercase">{label}</p>
              <p className="font-display text-chocolate mt-1 text-3xl font-bold">{value.toLocaleString()}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      <h2 className="mt-10 text-2xl">Management</h2>
      <p className="text-ink-soft mt-1 text-sm">These tools arrive in Phase 7. Until then, content is managed through the seed file and SQL.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {sections.map((s) => (
          <li key={s} className="border-line bg-paper/60 font-display text-ink-mute rounded-md border border-dashed px-4 py-3 text-sm font-semibold">
            {s} · soon
          </li>
        ))}
      </ul>
    </div>
  );
}
