import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/container";

/** Centred card layout for sign-in, sign-up and password screens. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="bg-grain flex flex-1 flex-col items-center justify-center py-10">
      <Container width="narrow" className="flex flex-col items-center gap-6">
        <Logo size="lg" />
        <div className="border-line bg-paper shadow-lift w-full rounded-2xl border p-6 sm:p-8">{children}</div>
      </Container>
    </main>
  );
}
