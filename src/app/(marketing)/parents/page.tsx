import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = { title: "For parents", description: "How Mibbi keeps kids safe online." };

const PROMISES = [
  {
    title: "No chat, no messaging.",
    body: "Kids can't talk to strangers here, because nobody can talk to anybody. There is no chat, no direct messaging and no comments.",
  },
  { title: "No public profiles.", body: "Display names and collections are private to the account. Nothing a child does is visible to other users." },
  {
    title: "No real-money purchases in the world.",
    body: "Mibbi Coins are earned by playing. They can't be bought, and there are no loot boxes, timers or pressure mechanics.",
  },
  { title: "Minimal data.", body: "We ask for an email (for the grown-up), a password and a display name. That's it. No birthdays, no photos, no location." },
  { title: "No trading between users.", body: "Items can't be traded or given away, so nobody can be pressured or tricked out of what they've earned." },
  {
    title: "Calm by design.",
    body: "Daily gifts and quests are gentle reasons to come back, not hooks. The world is made to be visited, not to be impossible to leave.",
  },
];

export default function ParentsPage() {
  return (
    <Container className="pt-28 pb-16 sm:pt-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-display text-ink-mute text-sm font-semibold tracking-wide uppercase">For parents and guardians</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">A softer internet for brighter days.</h1>
        <p className="text-ink-soft mt-4 text-lg">Mibbi is a world of small, kind characters. Here is exactly how it works, and what we will never do.</p>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2">
        {PROMISES.map((p) => (
          <li key={p.title}>
            <Card className="h-full">
              <CardBody>
                <h2 className="text-xl">{p.title}</h2>
                <p className="text-ink-soft mt-2 text-sm">{p.body}</p>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>

      <div className="text-ink-soft mx-auto mt-12 max-w-2xl space-y-4 text-sm">
        <h2 className="text-chocolate text-2xl">Accounts and consent</h2>
        <p>
          An account is created by a parent or guardian with their own email address. The email is used only to confirm the account and reset the password. We
          recommend the grown-up keeps the password.
        </p>
        <h2 className="text-chocolate text-2xl">Privacy review</h2>
        <p>
          Mibbi is being built with children in mind from day one, including COPPA and similar laws. A full legal and privacy review will be completed before
          public launch, and this page will link to the resulting privacy policy.
        </p>
        <p>Questions? Write to us at hello@mibbi.com.</p>
      </div>
    </Container>
  );
}
