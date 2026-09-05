import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import type { FieldError } from "react-hook-form";

import { Input } from "@/components/ui/input";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: FieldError;
  variant?: "legacy" | "reality";
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, id, variant = "legacy", ...props },
  ref,
) {
  const inputId = id ?? props.name;

  return (
    <label
      className={
        variant === "reality"
          ? "block text-sm font-medium text-reality-text-primary"
          : "block text-sm font-medium text-brand-text"
      }
      htmlFor={inputId}
    >
      <span>{label}</span>
      <Input className="mt-2" id={inputId} ref={ref} variant={variant} {...props} />
      {error ? <span className="mt-1 block text-sm text-red-300">{error.message}</span> : null}
    </label>
  );
});
