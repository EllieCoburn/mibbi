import { HeroJourney } from "@/components/marketing/hero-journey";
import { TimelineTeaser } from "@/components/marketing/timeline-teaser";
import { WhatElseTeaser } from "@/components/marketing/what-else-teaser";
import { Companions } from "@/components/marketing/companions";
import { AdventuresTeaser } from "@/components/marketing/adventures-teaser";
import { MuseumTeaser } from "@/components/marketing/museum-teaser";
import { Bulletin } from "@/components/marketing/bulletin";
import { getActiveCharacters } from "@/lib/data/characters";
import { getAdventures } from "@/lib/data/timeline";
import { getCurrentUser } from "@/lib/data/profile";

/**
 * The front door to the story of everything. Order: the journey, the
 * timeline itself (to scale), the signature question, the companions,
 * portals (physical Mibbis), the museum, one line of explanation, news.
 */
export default async function HomePage() {
  const [characters, adventures, user] = await Promise.all([getActiveCharacters(), getAdventures(), getCurrentUser()]);
  const signedIn = user !== null;

  return (
    <>
      <HeroJourney characters={characters} signedIn={signedIn} />
      <TimelineTeaser />
      <WhatElseTeaser />
      <Companions characters={characters} />
      <MuseumTeaser signedIn={signedIn} />
      <AdventuresTeaser adventures={adventures} characters={characters} />
      <Bulletin characters={characters} />
    </>
  );
}
