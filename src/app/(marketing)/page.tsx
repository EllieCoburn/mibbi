import { HeroWorld } from "@/components/marketing/hero-world";
import { MeetTheMibbis } from "@/components/marketing/meet-the-mibbis";
import { ExploreWorld } from "@/components/marketing/explore-world";
import { GotAMibbi } from "@/components/marketing/got-a-mibbi";
import { WhatIsMibbi } from "@/components/marketing/what-is-mibbi";
import { Bulletin } from "@/components/marketing/bulletin";
import { getActiveCharacters } from "@/lib/data/characters";
import { getActiveLocations } from "@/lib/data/world";
import { getCurrentUser } from "@/lib/data/profile";

/**
 * The front door to Mibbi World. Order: the world itself, the Mibbis,
 * places to go, the physical → digital bridge, one line of explanation,
 * and news from inside the world.
 */
export default async function HomePage() {
  const [characters, locations, user] = await Promise.all([getActiveCharacters(), getActiveLocations(), getCurrentUser()]);

  return (
    <>
      <HeroWorld characters={characters} signedIn={user !== null} />
      <MeetTheMibbis characters={characters} limit={6} />
      <ExploreWorld locations={locations} />
      <GotAMibbi character={characters[0]} />
      <WhatIsMibbi characters={characters} />
      <Bulletin characters={characters} />
    </>
  );
}
