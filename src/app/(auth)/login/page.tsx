import type { Metadata } from "next";
import Link from "next/link";
import { FormField, FormShell } from "@/components/auth/form-shell";
import { signIn } from "@/lib/auth/actions";
import { routes, safeNextPath } from "@/lib/routes";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = safeNextPath(typeof sp.next === "string" ? sp.next : null);
  const confirmed = sp.confirmed === "1";

  return (
    <>
      <h1 className="text-3xl">Welcome back.</h1>
      <p className="text-ink-soft mt-1">Your Mibbi has been waiting for you.</p>
      {confirmed ? (
        <p className="bg-pistachio/25 text-chocolate mt-3 rounded-md px-3 py-2 text-sm font-semibold">Email confirmed. You can sign in now.</p>
      ) : null}
      <div className="mt-6">
        <FormShell action={signIn} submitLabel="Sign in" extra={<input type="hidden" name="next" value={next} />}>
          <FormField label="Email" name="email" type="email" autoComplete="email" inputMode="email" required />
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            labelAside={
              <Link href={routes.forgotPassword} className="text-brand text-sm font-semibold hover:underline">
                Forgot?
              </Link>
            }
          />
        </FormShell>
      </div>
      <p className="text-ink-soft mt-6 text-center text-sm">
        New here?{" "}
        <Link href={routes.signup} className="text-brand font-semibold hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
