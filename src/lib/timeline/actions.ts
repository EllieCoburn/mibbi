"use server";

/**
 * Mutations for the timeline experience. All rows are the user's own
 * (discoveries, progress, concept signals); nothing here moves value, so
 * plain RLS-protected inserts are appropriate.
 */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/lib/routes";

export interface SimpleResult {
  ok: boolean;
  error?: "not_signed_in" | "failed";
}

export async function addDiscovery(entryId: string, via: "timeline" | "atlas" | "adventure" | "game" = "timeline"): Promise<SimpleResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_signed_in" };

  const { error } = await supabase
    .from("user_discoveries")
    .upsert({ user_id: user.id, entry_id: entryId, discovered_via: via }, { onConflict: "user_id,entry_id", ignoreDuplicates: true });
  if (error) return { ok: false, error: "failed" };

  revalidatePath(routes.museum);
  return { ok: true };
}

export async function recordConceptSignal(concept: string, correct: boolean, context: Record<string, unknown> = {}): Promise<SimpleResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: true }; // visitors play too; nothing to store
  const { error } = await supabase.from("concept_signals").insert({ user_id: user.id, concept, correct, context: context as never });
  return error ? { ok: false, error: "failed" } : { ok: true };
}

export async function saveAdventureProgress(adventureId: string, stepIndex: number, completed: boolean, stepEntryIds: string[] = []): Promise<SimpleResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_signed_in" };

  const { error } = await supabase.from("user_adventure_progress").upsert(
    {
      user_id: user.id,
      adventure_id: adventureId,
      step_index: stepIndex,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,adventure_id" },
  );
  if (error) return { ok: false, error: "failed" };

  if (completed && stepEntryIds.length > 0) {
    await supabase.from("user_discoveries").upsert(
      stepEntryIds.map((entry_id) => ({ user_id: user.id, entry_id, discovered_via: "adventure" as const })),
      { onConflict: "user_id,entry_id", ignoreDuplicates: true },
    );
  }
  revalidatePath(routes.adventures);
  revalidatePath(routes.museum);
  return { ok: true };
}
