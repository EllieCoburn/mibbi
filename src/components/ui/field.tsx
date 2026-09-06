import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  /** Rendered to the right of the label, e.g. a "Forgot?" link. */
  labelAside?: ReactNode;
}

/**
 * Labelled text input with hint and inline error. Errors are announced to
 * screen readers through aria-describedby + role="alert".
 */
export function Field({ label, name, hint, error, labelAside, className, id, ...rest }: FieldProps) {
  const inputId = id ?? name;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={inputId} className="font-display text-chocolate text-sm font-semibold">
          {label}
        </label>
        {labelAside}
      </div>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "bg-paper text-ink placeholder:text-ink-mute h-12 w-full rounded-md border-2 px-4 text-base",
          "focus:border-dusty transition-colors focus:outline-none",
          error ? "border-brand" : "border-line hover:border-toast/50",
          className,
        )}
        {...rest}
      />
      {hint && !error ? (
        <p id={hintId} className="text-ink-soft text-sm">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-brand text-sm font-semibold">
          {error}
        </p>
      ) : null}
    </div>
  );
}
