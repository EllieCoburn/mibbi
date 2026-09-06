import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center">
      <Container width="narrow" className="py-16 text-center">
        <Logo size="lg" />
        <h1 className="mt-6 text-3xl">Nobody’s home here.</h1>
        <p className="text-ink-soft mt-2">Pickle may have moved the sign. Let’s head back somewhere familiar.</p>
        <div className="mt-6">
          <LinkButton href={routes.home}>Go home</LinkButton>
        </div>
      </Container>
    </main>
  );
}
