import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

export type LocationSummary = Pick<
  Tables<"locations">,
  "id" | "slug" | "name" | "tagline" | "description" | "map_x" | "map_y" | "link_type" | "link_target" | "image_url"
>;

export async function getActiveLocations(): Promise<LocationSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("id, slug, name, tagline, description, map_x, map_y, link_type, link_target, image_url")
    .eq("status", "active")
    .order("sort_order");
  if (error) throw new Error(`Failed to load locations: ${error.message}`);
  return data ?? [];
}
