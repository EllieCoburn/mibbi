import type { Metadata } from "next";
import { Bulletin } from "@/components/marketing/bulletin";
import { getActiveCharacters } from "@/lib/data/characters";

export const metadata: Metadata = { title: "The Mibbi Bulletin", description: "News from inside Mibbi World." };

export default async function NewsPage() {
  const characters = await getActiveCharacters();
  return (
    <div className="pt-16 sm:pt-20">
      <Bulletin characters={characters} limit={20} />
    </div>
  );
}
