/**
 * Validation for auth forms. Shared by server actions (authoritative) and
 * can be reused client-side for instant feedback.
 */
import { z } from "zod";

// A small blocklist for display names. Real moderation is a launch task
// (see docs/SECURITY.md) — this only stops the obvious.
const BLOCKED_NAME_FRAGMENTS = ["admin", "mibbi staff", "moderator", "support"];

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Pick a name with at least 2 characters.")
  .max(20, "Keep it under 20 characters.")
  .regex(/^[A-Za-z0-9][A-Za-z0-9 ]*[A-Za-z0-9]$/, "Letters, numbers and single spaces only.")
  .refine((v) => !BLOCKED_NAME_FRAGMENTS.some((b) => v.toLowerCase().includes(b)), "That name is reserved.");

export const emailSchema = z.string().trim().toLowerCase().email("That email doesn't look right.");

export const passwordSchema = z.string().min(10, "Use at least 10 characters.").max(128, "That's a very long password.");

export const signUpSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
  /** The grown-up in charge confirms they're okay with this. Legal review pending. */
  guardianConsent: z.literal("on", { message: "Please confirm you've read the parent information." }),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match." });

export const updateProfileSchema = z.object({ displayName: displayNameSchema });

/** Flattens zod issues into { fieldName: firstMessage }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
