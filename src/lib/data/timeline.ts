import "server-only";

/**
 * Read access for the timeline, atlas, museum and adventures.
 * Everything goes through the caller's session so RLS applies.
 */
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Adventure, Region, TimelineEntry } from "@/lib/timeline/types";
import type { Tables } from "@/types/supabase";

export const getTimelineEntries = cache(async (): Promise<TimelineEntry[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("timeline_entries").select("*").eq("status", "active").order("start_year");
  if (error) {
    console.error("Failed to load timeline:", error.message);
    return [];
  }
  return data ?? [];
});

export const getRegions = cache(async (): Promise<Region[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("regions").select("*").order("sort_order");
  if (error) {
    console.error("Failed to load regions:", error.message);
    return [];
  }
  return data ?? [];
});

export async function getEntryBySlug(slug: string): Promise<TimelineEntry | null> {
  const entries = await getTimelineEntries();
  return entries.find((e) => e.slug === slug) ?? null;
}

/** Entries active around a year, via the SQL helper (same rule the Atlas uses). */
export async function getEntriesAroundYear(year: number, tolerance?: number): Promise<TimelineEntry[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("entries_around_year", { p_year: year, p_tolerance: tolerance });
  if (error) {
    console.error("entries_around_year failed:", error.message);
    return [];
  }
  return (data ?? []) as TimelineEntry[];
}

export const getAdventures = cache(async (): Promise<Adventure[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("adventures").select("*").eq("status", "active").order("sort_order");
  if (error) {
    console.error("Failed to load adventures:", error.message);
    return [];
  }
  return data ?? [];
});

export async function getAdventureBySlug(slug: string): Promise<Adventure | null> {
  const all = await getAdventures();
  return all.find((a) => a.slug === slug) ?? null;
}

export type Discovery = Tables<"user_discoveries"> & { entry: TimelineEntry };

/** The signed-in user's museum, newest first. Empty for anonymous visitors. */
export async function getUserDiscoveries(userId: string | null): Promise<Discovery[]> {
  if (!userId || !isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_discoveries")
    .select("*, entry:timeline_entries(*)")
    .eq("user_id", userId)
    .order("discovered_at", { ascending: false });
  if (error) {
    console.error("Failed to load discoveries:", error.message);
    return [];
  }
  return (data ?? []).filter((d) => d.entry !== null) as unknown as Discovery[];
}

export async function getUserAdventureProgress(userId: string | null): Promise<Tables<"user_adventure_progress">[]> {
  if (!userId || !isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("user_adventure_progress").select("*").eq("user_id", userId);
  return data ?? [];
}

/** Slugs of characters the user owns (physical Mibbis = adventure portals). */
export async function getOwnedCharacterSlugs(userId: string | null): Promise<Set<string>> {
  if (!userId || !isSupabaseConfigured()) return new Set();
  const supabase = await createClient();
  const { data } = await supabase.from("user_mibbis").select("character:characters(slug)").eq("user_id", userId);
  const slugs = (data ?? []).map((r) => (r.character as unknown as { slug: string } | null)?.slug).filter((s): s is string => !!s);
  return new Set(slugs);
}

export interface Companion {
  name: string;
  slug: string;
  color: string;
  shape: string;
  personalityKey: string;
  curiosityKey: string;
  imageUrl: string | null;
}

/** The user's first Mibbi, or Mochi (the optimist) for visitors. */
export async function getCompanion(userId: string | null): Promise<Companion | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  if (userId) {
    const { data } = await supabase
      .from("user_mibbis")
      .select("nickname, character:characters(slug, name, placeholder_color, placeholder_shape, personality_key, curiosity_key, thumbnail_url)")
      .eq("user_id", userId)
      .order("adopted_at")
      .limit(1)
      .maybeSingle();
    const c = data?.character as unknown as Tables<"characters"> | null;
    if (c) {
      return {
        name: data?.nickname ?? c.name,
        slug: c.slug,
        color: c.placeholder_color,
        shape: c.placeholder_shape,
        personalityKey: c.personality_key,
        curiosityKey: c.curiosity_key ?? "wonder",
        imageUrl: c.thumbnail_url,
      };
    }
  }
  const { data: mochi } = await supabase.from("characters").select("*").eq("status", "active").order("sort_order").limit(2);
  const c = mochi?.find((x) => x.slug === "mochi") ?? mochi?.[0];
  if (!c) return null;
  return {
    name: c.name,
    slug: c.slug,
    color: c.placeholder_color,
    shape: c.placeholder_shape,
    personalityKey: c.personality_key,
    curiosityKey: c.curiosity_key ?? "wonder",
    imageUrl: c.thumbnail_url,
  };
}
