import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import type { FieldError } from "react-hook-form";

import { Input } from "@/components/ui/input";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: FieldError;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;

  return (
    <label className="block text-sm font-medium text-brand-text" htmlFor={inputId}>
      <span>{label}</span>
      <Input className="mt-2" id={inputId} ref={ref} {...props} />
      {error ? <span className="mt-1 block text-sm text-red-300">{error.message}</span> : null}
    </label>
  );
});
