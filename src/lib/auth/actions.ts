"use server";

/**
 * Auth server actions. Each returns an ActionState consumed by useActionState
 * in the form components. Redirects happen outside try/catch (Next throws
 * a special error to redirect).
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { routes, safeNextPath } from "@/lib/routes";
import { getPublicEnv, isSupabaseConfigured } from "@/lib/env";
import { fieldErrors, forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema, updateProfileSchema } from "./schemas";

export interface ActionState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Echoed values so the form doesn't clear on error. */
  values?: Record<string, string>;
}

const NOT_CONFIGURED: ActionState = {
  message: "Accounts aren't switched on yet. The site needs its database settings first (see the notice at the top of the page).",
};

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v : "";
}

async function siteUrl(): Promise<string> {
  // Prefer the configured URL; fall back to the request origin in dev.
  const configured = getPublicEnv().NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

/** Turns Supabase auth errors into friendly copy without leaking internals. */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for a link from Mibbi.";
  if (m.includes("already registered") || m.includes("already exists")) return "There's already an account with that email. Try signing in.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Take a breather and try again in a minute.";
  if (m.includes("password")) return "That password isn't strong enough. Try a longer one.";
  return "Something went wrong. Please try again.";
}

export async function signUp(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const raw = {
    displayName: str(form, "displayName"),
    email: str(form, "email"),
    password: str(form, "password"),
    guardianConsent: str(form, "guardianConsent"),
  };
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values: { displayName: raw.displayName, email: raw.email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${await siteUrl()}${routes.authCallback}?next=${encodeURIComponent(routes.app)}`,
      // Read by the handle_new_user() trigger to create the profile.
      data: { display_name: parsed.data.displayName },
    },
  });

  if (error) {
    return { message: friendlyAuthError(error.message), values: { displayName: raw.displayName, email: raw.email } };
  }

  redirect(`${routes.checkEmail}?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function signIn(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const raw = { email: str(form, "email"), password: str(form, "password") };
  const next = safeNextPath(str(form, "next"));
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values: { email: raw.email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { message: friendlyAuthError(error.message), values: { email: raw.email } };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(routes.home);
}

export async function requestPasswordReset(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const parsed = forgotPasswordSchema.safeParse({ email: str(form, "email") });
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  // Always report success so this form can't be used to check whether an
  // email has an account.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await siteUrl()}${routes.authCallback}?next=${encodeURIComponent(routes.resetPassword)}`,
  });

  return { ok: true, message: "If that email has a Mibbi account, a reset link is on its way." };
}

export async function updatePassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({ password: str(form, "password"), confirm: str(form, "confirm") });
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { message: "Your reset link has expired. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { message: friendlyAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(`${routes.app}?updated=password`);
}

export async function updateProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = updateProfileSchema.safeParse({ displayName: str(form, "displayName") });
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values: { displayName: str(form, "displayName") } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);

  const { error } = await supabase.from("profiles").update({ display_name: parsed.data.displayName }).eq("id", user.id);
  if (error) {
    return { message: "Couldn't save that name. Please try again.", values: { displayName: parsed.data.displayName } };
  }

  revalidatePath(routes.profile);
  revalidatePath(routes.app);
  return { ok: true, message: "Saved. Your Mibbis approve.", values: { displayName: parsed.data.displayName } };
}
