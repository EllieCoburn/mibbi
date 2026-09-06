import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormField, FormShell } from "@/components/auth/form-shell";
import { updatePassword } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/data/profile";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  // The reset link signs the user in through /auth/callback first.
  const user = await getCurrentUser();
  if (!user) redirect(`${routes.forgotPassword}?expired=1`);

  return (
    <>
      <h1 className="text-3xl">Choose a new password.</h1>
      <p className="text-ink-soft mt-1">Make it a good one. Crumb is worried about security.</p>
      <div className="mt-6">
        <FormShell action={updatePassword} submitLabel="Save password">
          <FormField label="New password" name="password" type="password" autoComplete="new-password" required hint="At least 10 characters." />
          <FormField label="Confirm password" name="confirm" type="password" autoComplete="new-password" required />
        </FormShell>
      </div>
    </>
  );
}
