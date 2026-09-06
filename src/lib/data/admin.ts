import "server-only";

/**
 * Admin read models. These run with the admin's own session (RLS grants
 * admins read access), so a non-admin calling them gets zeros, not data.
 */
import { createClient } from "@/lib/supabase/server";

export interface AdminOverview {
  users: number;
  activeCharacters: number;
  activeSeries: number;
  codesTotal: number;
  codesRedeemed: number;
  mibbisAdopted: number;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = await createClient();
  const count = async (query: PromiseLike<{ count: number | null }>) => (await query).count ?? 0;

  const [users, activeCharacters, activeSeries, codesTotal, codesRedeemed, mibbisAdopted] = await Promise.all([
    count(supabase.from("profiles").select("id", { count: "exact", head: true })),
    count(supabase.from("characters").select("id", { count: "exact", head: true }).eq("status", "active")),
    count(supabase.from("series").select("id", { count: "exact", head: true }).eq("status", "active")),
    count(supabase.from("adoption_codes").select("id", { count: "exact", head: true })),
    count(supabase.from("adoption_codes").select("id", { count: "exact", head: true }).eq("status", "redeemed")),
    count(supabase.from("user_mibbis").select("id", { count: "exact", head: true })),
  ]);

  return { users, activeCharacters, activeSeries, codesTotal, codesRedeemed, mibbisAdopted };
}
