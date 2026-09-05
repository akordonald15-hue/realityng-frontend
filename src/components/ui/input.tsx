import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

type InputVariant = "legacy" | "reality";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant;
};

const inputClasses: Record<InputVariant, string> = {
  legacy:
    "h-11 rounded-md border-white/10 bg-white/5 text-brand-text placeholder:text-brand-muted/60 focus:border-brand-secondary focus:ring-brand-secondary/20",
  reality:
    "h-14 rounded-[12px] border-reality-border-secondary bg-white text-reality-text-primary shadow-reality-sm placeholder:text-reality-text-quaternary focus:border-reality-brand-500 focus:ring-reality-brand-500/15",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, variant = "legacy", ...props },
  ref,
) {
  return (
    <input
      className={clsx(
        "w-full border px-3 text-sm outline-none transition focus:ring-2",
        inputClasses[variant],
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
