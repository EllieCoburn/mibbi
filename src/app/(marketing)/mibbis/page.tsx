import type { Metadata } from "next";
import { MeetTheMibbis } from "@/components/marketing/meet-the-mibbis";
import { getActiveCharacters } from "@/lib/data/characters";

export const metadata: Metadata = { title: "Meet the Mibbis" };

export default async function CharactersPage() {
  const characters = await getActiveCharacters();
  return <MeetTheMibbis characters={characters} />;
}
