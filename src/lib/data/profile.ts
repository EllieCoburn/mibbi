import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Tables } from "@/types/supabase";

export type Profile = Tables<"profiles">;

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: Profile;
  isAdmin: boolean;
  adminRole: Tables<"admin_users">["role"] | null;
}

/**
 * The signed-in user with their profile and admin status, or null.
 * Wrapped in React `cache` so layouts and pages in one request share a call.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: admin }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!profile) {
    // The bootstrap trigger normally creates this row. If it is missing
    // (e.g. trigger not yet deployed), fail loudly rather than half-render.
    throw new Error("Profile row missing for signed-in user. Has the database been migrated?");
  }

  return {
    id: user.id,
    email: user.email ?? null,
    profile,
    isAdmin: admin !== null,
    adminRole: admin?.role ?? null,
  };
});

export interface HomeSnapshot {
  coins: number;
  mibbiCount: number;
  recentActivity: Array<Pick<Tables<"activity_log">, "id" | "kind" | "title" | "created_at">>;
}

/** Numbers for the signed-in home screen. */
export async function getHomeSnapshot(userId: string): Promise<HomeSnapshot> {
  const supabase = await createClient();
  const [balance, mibbis, activity] = await Promise.all([
    supabase.from("user_balances").select("balance").eq("user_id", userId).eq("currency_slug", "coins").maybeSingle(),
    supabase.from("user_mibbis").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("activity_log").select("id, kind, title, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
  ]);
  return {
    coins: balance.data?.balance ?? 0,
    mibbiCount: mibbis.count ?? 0,
    recentActivity: activity.data ?? [],
  };
}
