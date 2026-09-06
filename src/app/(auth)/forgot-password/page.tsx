import type { Metadata } from "next";
import Link from "next/link";
import { FormField, FormShell } from "@/components/auth/form-shell";
import { requestPasswordReset } from "@/lib/auth/actions";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-3xl">Forgot your password?</h1>
      <p className="text-ink-soft mt-1">It happens. We’ll email you a link to set a new one.</p>
      <div className="mt-6">
        <FormShell action={requestPasswordReset} submitLabel="Send reset link">
          <FormField label="Email" name="email" type="email" autoComplete="email" inputMode="email" required />
        </FormShell>
      </div>
      <p className="text-ink-soft mt-6 text-center text-sm">
        <Link href={routes.login} className="text-brand font-semibold hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
