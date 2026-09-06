import "server-only";

/**
 * Read access for characters. All queries go through the user's Supabase
 * session so RLS decides visibility (public sees active only; admins see all).
 */
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Tables } from "@/types/supabase";

export type Rarity = Pick<Tables<"rarities">, "slug" | "name" | "color_hex" | "sort_order" | "odds_label">;

export type CharacterSummary = Pick<
  Tables<"characters">,
  | "id"
  | "slug"
  | "name"
  | "species"
  | "personality_key"
  | "personality_label"
  | "tagline"
  | "placeholder_color"
  | "placeholder_shape"
  | "image_url"
  | "thumbnail_url"
  | "rarity_slug"
  | "sort_order"
  | "curiosity_key"
> & { rarity: Rarity };

export type CharacterDetail = Tables<"characters"> & {
  rarity: Rarity;
  home_location: Pick<Tables<"locations">, "slug" | "name"> | null;
  variants: Array<Pick<Tables<"character_variants">, "id" | "slug" | "name" | "description" | "placeholder_color" | "image_url"> & { rarity: Rarity }>;
  series: Array<Pick<Tables<"series">, "slug" | "name" | "code">>;
};

const SUMMARY_SELECT =
  "id, slug, name, species, personality_key, personality_label, tagline, placeholder_color, placeholder_shape, image_url, thumbnail_url, rarity_slug, sort_order, curiosity_key, rarity:rarities(slug, name, color_hex, sort_order, odds_label)";

export async function getActiveCharacters(): Promise<CharacterSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("characters").select(SUMMARY_SELECT).eq("status", "active").order("sort_order");
  if (error) {
    console.error("Failed to load characters:", error.message);
    return [];
  }
  return (data ?? []) as unknown as CharacterSummary[];
}

export async function getCharacterBySlug(slug: string): Promise<CharacterDetail | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("characters")
    .select(
      "*, rarity:rarities(slug, name, color_hex, sort_order, odds_label), home_location:locations(slug, name), " +
        "variants:character_variants(id, slug, name, description, placeholder_color, image_url, rarity:rarities(slug, name, color_hex, sort_order, odds_label)), " +
        "series_characters(series:series(slug, name, code))",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("Failed to load character:", error.message);
    return null;
  }
  if (!data) return null;

  const { series_characters, ...rest } = data as unknown as CharacterDetail & {
    series_characters: Array<{ series: { slug: string; name: string; code: string } | null }>;
  };
  return {
    ...rest,
    series: series_characters.map((sc) => sc.series).filter((s): s is NonNullable<typeof s> => s !== null),
  };
}

export type SeriesWithCharacters = Pick<Tables<"series">, "id" | "slug" | "code" | "name" | "tagline" | "description" | "status"> & {
  characters: CharacterSummary[];
};

/** Active series with their characters, for the "Collect them all" checklist. */
export async function getActiveSeriesWithCharacters(): Promise<SeriesWithCharacters[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("series")
    .select(`id, slug, code, name, tagline, description, status, series_characters(sort_order, character:characters(${SUMMARY_SELECT}))`)
    .eq("status", "active")
    .order("sort_order");
  if (error) {
    console.error("Failed to load series:", error.message);
    return [];
  }

  type Raw = Omit<SeriesWithCharacters, "characters"> & {
    series_characters: Array<{ sort_order: number; character: CharacterSummary | null }>;
  };
  return ((data ?? []) as unknown as Raw[]).map(({ series_characters, ...s }) => ({
    ...s,
    characters: series_characters
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((sc) => sc.character)
      .filter((c): c is CharacterSummary => c !== null),
  }));
}
