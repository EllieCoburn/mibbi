import { Container } from "./container";
import { LinkButton } from "./button";
import { routes } from "@/lib/routes";

/**
 * Placeholder for routes whose feature lands in a later phase. Keeps the
 * whole route map navigable from day one.
 */
export function ComingSoon({ title, phase, blurb }: { title: string; phase: string; blurb: string }) {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-ink-mute text-sm font-semibold tracking-wide uppercase">{phase}</p>
        <h1 className="mt-2 text-4xl">{title}</h1>
        <p className="text-ink-soft mt-3">{blurb}</p>
        <div className="mt-6">
          <LinkButton href={routes.timeline} variant="secondary">
            Back to the timeline
          </LinkButton>
        </div>
      </div>
    </Container>
  );
}
