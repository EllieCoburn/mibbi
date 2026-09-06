import { ToyLink } from "@/components/ui/toy-button";
import { routes } from "@/lib/routes";

const EXHIBITS = [
  { what: "Tiktaalik", when: "375 million years ago", why: "A fish with wrists. Life walks onto land.", color: "#c98a4b" },
  { what: "The first writing", when: "3,200 BCE", why: "Marks in clay that held words.", color: "#e3b341" },
  { what: "Polynesians reach Hawaii", when: "1000", why: "Navigation by stars and swells.", color: "#9fc6e0" },
];

export function MuseumTeaser({ signedIn }: { signedIn: boolean }) {
  return (
    <section aria-labelledby="museum-heading" className="py-16 sm:py-20">
      <div className="chunky bg-butter/50 mx-auto max-w-5xl rounded-[2rem] p-6 sm:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <h2 id="museum-heading" className="text-4xl sm:text-5xl">
              Your own museum
            </h2>
            <p className="font-display text-chocolate mt-2 text-lg">Everything you find gets a card and a place on your timeline.</p>
            <p className="text-ink-soft mt-2 max-w-md">What it is. When it was. Where it happened. Why it matters. Your museum grows as the story fills in.</p>
            <div className="mt-6">
              <ToyLink href={signedIn ? routes.museum : routes.signup} size="lg">
                {signedIn ? "Open my museum" : "Start a museum"}
              </ToyLink>
            </div>
          </div>
          <ul className="flex flex-col gap-2 sm:w-72">
            {EXHIBITS.map((e, i) => (
              <li
                key={e.what}
                className={`chunky-sm bg-paper rounded-2xl px-4 py-3 ${["-rotate-2", "rotate-1", "-rotate-1"][i]}`}
                style={{ borderColor: e.color }}
              >
                <p className="font-display text-chocolate font-bold">{e.what}</p>
                <p className="text-ink-mute text-[11px] font-bold tracking-wider uppercase">{e.when}</p>
                <p className="text-ink-soft text-xs">{e.why}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
