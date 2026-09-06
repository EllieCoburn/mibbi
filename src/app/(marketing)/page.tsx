import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MeetTheMibbis } from "@/components/marketing/meet-the-mibbis";
import { CollectThemAll } from "@/components/marketing/collect-them-all";
import { WorldTeaser } from "@/components/marketing/world-teaser";
import { ParentsTeaser } from "@/components/marketing/parents-teaser";
import { getActiveCharacters, getActiveSeriesWithCharacters } from "@/lib/data/characters";
import { getActiveLocations } from "@/lib/data/world";

export default async function HomePage() {
  const [characters, series, locations] = await Promise.all([getActiveCharacters(), getActiveSeriesWithCharacters(), getActiveLocations()]);

  return (
    <>
      <Hero characters={characters} />
      <HowItWorks />
      <MeetTheMibbis characters={characters} limit={6} />
      <CollectThemAll series={series} />
      <WorldTeaser locations={locations} />
      <ParentsTeaser />
    </>
  );
}
