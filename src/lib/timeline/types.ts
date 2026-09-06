import type { Tables } from "@/types/supabase";

export type TimelineEntry = Tables<"timeline_entries">;
export type Region = Tables<"regions">;
export type Adventure = Tables<"adventures">;

export interface AdventureStep {
  title: string;
  text: string;
  entry_slug: string;
  companion_line?: string;
}

export const CURIOSITIES: Record<string, { label: string; blurb: string; verb: string }> = {
  fossil: { label: "Fossil Mibbi", blurb: "dinosaurs, rocks and ancient life", verb: "dug up" },
  sprout: { label: "Sprout Mibbi", blurb: "plants, animals and how life changes", verb: "noticed growing" },
  wonder: { label: "Wonder Mibbi", blurb: "space, stars and big questions", verb: "gazed at" },
  story: { label: "Story Mibbi", blurb: "people, cities and the past", verb: "heard a story about" },
  maker: { label: "Maker Mibbi", blurb: "inventions, tools and machines", verb: "tinkered with" },
  muse: { label: "Muse Mibbi", blurb: "art, music and writing", verb: "fell in love with" },
  explorer: { label: "Explorer Mibbi", blurb: "maps, journeys and faraway places", verb: "found a path to" },
};

export function curiosityOf(key: string | null | undefined) {
  return (key && CURIOSITIES[key]) || { label: "Mibbi", blurb: "everything", verb: "noticed" };
}
