import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Tables } from "@/types/supabase";

export type LocationSummary = Pick<
  Tables<"locations">,
  "id" | "slug" | "name" | "tagline" | "description" | "map_x" | "map_y" | "link_type" | "link_target" | "image_url"
>;

export async function getActiveLocations(): Promise<LocationSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("id, slug, name, tagline, description, map_x, map_y, link_type, link_target, image_url")
    .eq("status", "active")
    .order("sort_order");
  if (error) {
    console.error("Failed to load locations:", error.message);
    return [];
  }
  return data ?? [];
}
