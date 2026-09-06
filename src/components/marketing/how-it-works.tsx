import { Container } from "@/components/ui/container";
import { copy } from "@/lib/content/copy";

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="bg-paper py-16 sm:py-20">
      <Container>
        <h2 id="how-heading" className="text-center text-3xl sm:text-4xl">
          How it works
        </h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {copy.howItWorks.map((s) => (
            <li key={s.step} className="flex flex-col items-center gap-3 text-center">
              <span className="bg-butter font-display text-chocolate flex size-12 items-center justify-center rounded-full text-xl font-bold">{s.step}</span>
              <h3 className="text-xl">{s.title}</h3>
              <p className="text-ink-soft text-sm">{s.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
