import type { Metadata } from "next";
import Link from "next/link";
import { FormError, FormField, FormShell } from "@/components/auth/form-shell";
import { signUp } from "@/lib/auth/actions";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-3xl">Make a home for your Mibbi.</h1>
      <p className="text-ink-soft mt-1">A grown-up’s email, a password, and a name for your collection.</p>
      <div className="mt-6">
        <FormShell action={signUp} submitLabel="Create account">
          <FormField
            label="Display name"
            name="displayName"
            autoComplete="nickname"
            maxLength={20}
            required
            hint="Only you will see this. Letters and numbers, 2–20 characters."
          />
          <FormField label="Email" name="email" type="email" autoComplete="email" inputMode="email" required hint="A parent or guardian’s email." />
          <FormField label="Password" name="password" type="password" autoComplete="new-password" required hint="At least 10 characters." />
          <label className="text-ink-soft mt-1 flex items-start gap-3 text-sm">
            <input type="checkbox" name="guardianConsent" className="accent-brand mt-1 size-4" required />
            <span>
              I’m a parent or guardian (or over 18) and I’ve read the{" "}
              <Link href={routes.parents} className="text-brand font-semibold hover:underline" target="_blank">
                parent information
              </Link>
              .
            </span>
          </label>
          <FormError name="guardianConsent" />
        </FormShell>
      </div>
      <p className="text-ink-soft mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link href={routes.login} className="text-brand font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
