"use client";

import { createContext, useActionState, useContext, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { ActionState } from "@/lib/auth/actions";

const FormStateContext = createContext<ActionState>({});

interface FormShellProps {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  submitLabel: string;
  children: ReactNode;
  /** Hidden inputs, etc. */
  extra?: ReactNode;
}

/**
 * Wraps a server action with useActionState. Shows the top-level message,
 * puts the submit button into a pending state, and exposes field errors /
 * echoed values to <FormField> children through context. Server components
 * can therefore compose forms without passing functions across the boundary.
 */
export function FormShell({ action, submitLabel, children, extra }: FormShellProps) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <FormStateContext.Provider value={state}>
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        {extra}
        {state.message ? <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert> : null}
        {children}
        <Button type="submit" loading={pending} className="mt-2 w-full">
          {submitLabel}
        </Button>
      </form>
    </FormStateContext.Provider>
  );
}

export function useFormState(): ActionState {
  return useContext(FormStateContext);
}

type FormFieldProps = Omit<Parameters<typeof Field>[0], "error"> & { name: string };

/** A <Field> wired to the surrounding FormShell's errors and echoed values. */
export function FormField({ name, defaultValue, ...rest }: FormFieldProps) {
  const state = useFormState();
  return <Field name={name} error={state.errors?.[name]} defaultValue={state.values?.[name] ?? defaultValue} {...rest} />;
}

/** Inline error for non-Field inputs (checkboxes). */
export function FormError({ name }: { name: string }) {
  const state = useFormState();
  const message = state.errors?.[name];
  if (!message) return null;
  return (
    <p role="alert" className="text-brand -mt-2 text-sm font-semibold">
      {message}
    </p>
  );
}
