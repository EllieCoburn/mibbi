import Link from "next/link";
import { Container } from "@/components/ui/container";
import { routes } from "@/lib/routes";

export function ParentsTeaser() {
  return (
    <section className="bg-paper py-14">
      <Container className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl">Built for kids. Designed for peace of mind.</h2>
          <p className="text-ink-soft mt-2 max-w-xl">
            No chat. No messaging. No public profiles. No real-money purchases inside the world. Just soft friends and small, kind adventures.
          </p>
        </div>
        <Link href={routes.parents} className="font-display text-brand font-semibold hover:underline">
          Read the parent information →
        </Link>
      </Container>
    </section>
  );
}
