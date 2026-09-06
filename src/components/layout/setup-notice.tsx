import { publicEnvProblems } from "@/lib/env";

/**
 * Shown only while the deployment has no (or invalid) Supabase settings.
 * Disappears the moment the environment variables are present. Names the
 * variables that need attention so a founder can fix a typo without help.
 */
export function SetupNotice() {
  const problems = publicEnvProblems();
  if (problems.length === 0) return null;
  return (
    <div role="status" className="border-b border-butter-deep/50 bg-butter/60 px-4 py-2 text-center text-sm text-chocolate">
      <strong className="font-display">Almost there.</strong> Mibbi isn’t connected to its database yet. Check these hosting environment variables, then
      redeploy:{" "}
      {problems.map((p, i) => (
        <span key={p.name}>
          {i > 0 ? ", " : ""}
          <code className="rounded bg-paper px-1">{p.name}</code> ({p.reason})
        </span>
      ))}
      .
    </div>
  );
}
