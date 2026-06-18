import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      className={clsx(
        "h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text outline-none transition placeholder:text-brand-muted/60 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
