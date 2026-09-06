"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Button, LinkButton } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center">
      <Container width="narrow" className="py-16 text-center">
        <h1 className="text-3xl">Something strange is happening at the Bakery.</h1>
        <p className="text-ink-soft mt-2">Crumb is on it. Try again in a moment.</p>
        {error.digest ? <p className="text-ink-mute mt-2 text-xs">Reference: {error.digest}</p> : null}
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <LinkButton href={routes.home} variant="secondary">
            Go home
          </LinkButton>
        </div>
      </Container>
    </main>
  );
}
