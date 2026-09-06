/**
 * Adoption code format + helpers that are safe to run anywhere (no secrets).
 * Hashing (which needs the server-only pepper) lives in ./hash.ts.
 *
 * Format
 * ------
 * 12 characters from a 31-symbol alphabet that has no 0/O, 1/I/L so the code
 * survives being read off a printed card and typed on a phone.
 * Displayed as XXXX-XXXX-XXXX. ~59 bits of entropy per code; combined with
 * the per-user/IP attempt limits in redeem_adoption_code(), online guessing
 * is impractical, and the server-side HMAC pepper protects against offline
 * attacks if the hash table were ever exposed.
 */
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 12;
export const CODE_GROUP = 4;

const ALPHABET_SET = new Set(CODE_ALPHABET.split(""));

/**
 * Normalises user input: uppercase, strip spaces/dashes/anything that isn't
 * alphanumeric, and forgive the most common misreads (0→O is NOT applied
 * because neither exists in the alphabet; instead both are simply invalid).
 */
export function normalizeAdoptionCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** True when a normalised code has the right length and alphabet. */
export function isValidAdoptionCodeFormat(normalized: string): boolean {
  if (normalized.length !== CODE_LENGTH) return false;
  for (const ch of normalized) {
    if (!ALPHABET_SET.has(ch)) return false;
  }
  return true;
}

/** Pretty form for display / printing: ABCD-EFGH-JKMN */
export function formatAdoptionCode(normalized: string): string {
  const groups: string[] = [];
  for (let i = 0; i < normalized.length; i += CODE_GROUP) {
    groups.push(normalized.slice(i, i + CODE_GROUP));
  }
  return groups.join("-");
}

/** Last four characters, used as a support hint (never enough to redeem). */
export function adoptionCodeHint(normalized: string): string {
  return normalized.slice(-4);
}

/**
 * Generates a random code using the Web Crypto API (available in Node 20+
 * and browsers). Rejection sampling avoids modulo bias.
 */
export function generateAdoptionCode(random: (n: number) => Uint8Array = defaultRandom): string {
  const out: string[] = [];
  const max = 256 - (256 % CODE_ALPHABET.length); // 248: values >= max are rejected
  while (out.length < CODE_LENGTH) {
    const bytes = random(CODE_LENGTH * 2);
    for (const b of bytes) {
      if (b < max) out.push(CODE_ALPHABET[b % CODE_ALPHABET.length]);
      if (out.length === CODE_LENGTH) break;
    }
  }
  return out.join("");
}

function defaultRandom(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  globalThis.crypto.getRandomValues(buf);
  return buf;
}

/** Human-readable reasons for each redemption error code from the database. */
export const REDEMPTION_ERRORS: Record<string, { title: string; body: string }> = {
  invalid: {
    title: "That code doesn't look right.",
    body: "Check the card inside your box and try again. Codes never use the letters O, I or L, or the numbers 0 and 1.",
  },
  already_redeemed: {
    title: "This Mibbi already has a home.",
    body: "This code has been used on another account. If you think that's a mistake, get in touch and we'll help.",
  },
  already_yours: {
    title: "You've already adopted this one!",
    body: "This Mibbi is already in your collection. Go say hi.",
  },
  disabled: {
    title: "This code has been retired.",
    body: "Contact support with a photo of your card and we'll sort it out.",
  },
  unavailable: {
    title: "This Mibbi isn't ready yet.",
    body: "Something strange is happening at the Bakery. Try again soon.",
  },
  rate_limited: {
    title: "Take a breather.",
    body: "Too many attempts in a short time. Wait an hour and try again.",
  },
  suspended: {
    title: "This account is paused.",
    body: "Please contact support.",
  },
  not_authenticated: {
    title: "Sign in first.",
    body: "You need an account so your Mibbi has somewhere to live.",
  },
};
