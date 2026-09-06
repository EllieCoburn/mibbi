import { isSupabaseConfigured } from "@/lib/env";

/**
 * Shown only while the deployment has no Supabase settings. Disappears the
 * moment the environment variables are present. Never visible in a
 * configured production site.
 */
export function SetupNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <div role="status" className="border-b border-butter-deep/50 bg-butter/60 px-4 py-2 text-center text-sm text-chocolate">
      <strong className="font-display">Almost there.</strong> Mibbi isn’t connected to its database yet. Add{" "}
      <code className="rounded bg-paper px-1">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="rounded bg-paper px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
      your hosting environment variables, then redeploy.
    </div>
  );
}
