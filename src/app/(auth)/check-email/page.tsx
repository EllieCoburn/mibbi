import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Check your email" };

export default async function CheckEmailPage({ searchParams }: PageProps<"/check-email">) {
  const sp = await searchParams;
  const email = typeof sp.email === "string" ? sp.email : null;
  return (
    <div className="text-center">
      <span aria-hidden="true" className="text-5xl">
        ✉️
      </span>
      <h1 className="mt-3 text-3xl">Check your inbox.</h1>
      <p className="text-ink-soft mt-2">
        We sent a confirmation link
        {email ? (
          <>
            {" "}
            to <strong className="text-chocolate">{email}</strong>
          </>
        ) : null}
        . Tap it and your account is ready.
      </p>
      <p className="text-ink-mute mt-6 text-sm">
        Nothing there? Check spam, or{" "}
        <Link href={routes.signup} className="text-brand font-semibold hover:underline">
          try again
        </Link>
        .
      </p>
    </div>
  );
}
