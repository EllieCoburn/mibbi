/**
 * Personality metadata keyed by characters.personality_key.
 *
 * The database is the source of truth for *which* personality a character
 * has; this file holds the presentation layer that needs code anyway
 * (face expressions for placeholder art, quiz copy, voice lines).
 * Unknown keys fall back to `default`, so admins can add personalities
 * without a deploy — they'll just get the neutral face until art lands.
 */
export type Expression = "worried" | "happy" | "sleepy" | "dramatic" | "chaotic" | "kind" | "curious" | "shy" | "mysterious" | "neutral";

export interface Personality {
  key: string;
  label: string;
  expression: Expression;
  /** One-line "I'm such a ___" copy. */
  identity: string;
  /** Lines the character says in the UI. Keep them short, warm, slightly weird. */
  lines: string[];
}

export const PERSONALITIES: Record<string, Personality> = {
  worrier: {
    key: "worrier",
    label: "The Worrier",
    expression: "worried",
    identity: "I'm such a Crumb.",
    lines: ["Are we sure about this?", "Did you eat? I'm worried you didn't eat.", "I made a list. It's mostly worries."],
  },
  optimist: {
    key: "optimist",
    label: "The Optimist",
    expression: "happy",
    identity: "I'm such a Mochi.",
    lines: ["Good things ahead!", "Today feels lucky.", "Rain is just sky confetti."],
  },
  sleepy: {
    key: "sleepy",
    label: "The Sleepy One",
    expression: "sleepy",
    identity: "I'm such a Toast.",
    lines: ["Five more minutes.", "...zzz.", "Rest is a superpower."],
  },
  dramatic: {
    key: "dramatic",
    label: "The Drama",
    expression: "dramatic",
    identity: "I'm such a Peach.",
    lines: ["I cannot believe this is happening.", "This is the best day of my entire life.", "Everything is a big deal. That's okay."],
  },
  chaotic: {
    key: "chaotic",
    label: "The Chaos",
    expression: "chaotic",
    identity: "I'm such a Pickle.",
    lines: ["Watch this.", "Chaos is a love language.", "I have made another questionable decision."],
  },
  supportive: {
    key: "supportive",
    label: "The Supporter",
    expression: "kind",
    identity: "I'm such a Butter.",
    lines: ["You've got this.", "I saved you the good seat.", "Kindness changes things."],
  },
  adventurous: {
    key: "adventurous",
    label: "The Adventurer",
    expression: "curious",
    identity: "I'm such a Noodle.",
    lines: ["Let's go find out.", "I found a path. It might be a puddle.", "New places, new friends."],
  },
  shy: {
    key: "shy",
    label: "The Shy One",
    expression: "shy",
    identity: "I'm such a Berri.",
    lines: ["...hi.", "I like it here.", "So much inside."],
  },
  mysterious: {
    key: "mysterious",
    label: "The Mystery",
    expression: "mysterious",
    identity: "I'm... not telling.",
    lines: ["...", "You weren't supposed to find me.", "Shh."],
  },
  default: {
    key: "default",
    label: "A Mibbi",
    expression: "neutral",
    identity: "I'm such a Mibbi.",
    lines: ["Hi there!"],
  },
};

export function getPersonality(key: string | null | undefined): Personality {
  return (key && PERSONALITIES[key]) || PERSONALITIES.default;
}

/** Picks a stable-ish line for a given day so the same Mibbi doesn't change mid-visit. */
export function dailyLine(personality: Personality, seed: number = new Date().getUTCDate()): string {
  return personality.lines[seed % personality.lines.length];
}
