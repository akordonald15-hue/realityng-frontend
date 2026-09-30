import type { InputHTMLAttributes } from "react";
import { forwardRef, useId } from "react";
import type { FieldError } from "react-hook-form";

import { Input } from "@/components/ui/input";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: FieldError;
  variant?: "legacy" | "reality";
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { "aria-describedby": ariaDescribedBy, label, error, id, variant = "reality", ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="block">
      <label className="block text-sm font-medium text-reality-text-primary" htmlFor={inputId}>
        {label}
      </label>
      <Input
        aria-describedby={[ariaDescribedBy, error ? errorId : undefined].filter(Boolean).join(" ") || undefined}
        aria-invalid={error ? true : undefined}
        className="mt-2"
        id={inputId}
        ref={ref}
        variant={variant}
        {...props}
      />
      {error ? (
        <span
          className={`mt-1 block text-sm ${variant === "reality" ? "text-red-700" : "text-red-300"}`}
          id={errorId}
          role="alert"
        >
          {error.message}
        </span>
      ) : null}
    </div>
  );
});
