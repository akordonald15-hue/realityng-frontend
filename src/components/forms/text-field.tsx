import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import type { FieldError } from "react-hook-form";

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
    <label className="block text-sm font-medium text-ink" htmlFor={inputId}>
      <span>{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        id={inputId}
        ref={ref}
        {...props}
      />
      {error ? <span className="mt-1 block text-sm text-red-600">{error.message}</span> : null}
    </label>
  );
});
