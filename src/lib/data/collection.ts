import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

export type OwnedMibbi = Pick<Tables<"user_mibbis">, "id" | "nickname" | "is_favorite" | "adopted_at" | "mood"> & {
  character: Pick<
    Tables<"characters">,
    "id" | "slug" | "name" | "personality_key" | "personality_label" | "placeholder_color" | "placeholder_shape" | "image_url" | "thumbnail_url" | "rarity_slug"
  >;
  variant: Pick<Tables<"character_variants">, "id" | "slug" | "name" | "placeholder_color" | "image_url" | "rarity_slug"> | null;
};

/** Everything the user has adopted, newest first. RLS scopes this to the caller. */
export async function getOwnedMibbis(userId: string): Promise<OwnedMibbi[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_mibbis")
    .select(
      "id, nickname, is_favorite, adopted_at, mood, " +
        "character:characters(id, slug, name, personality_key, personality_label, placeholder_color, placeholder_shape, image_url, thumbnail_url, rarity_slug), " +
        "variant:character_variants(id, slug, name, placeholder_color, image_url, rarity_slug)",
    )
    .eq("user_id", userId)
    .order("adopted_at", { ascending: false });
  if (error) throw new Error(`Failed to load collection: ${error.message}`);
  return (data ?? []) as unknown as OwnedMibbi[];
}
