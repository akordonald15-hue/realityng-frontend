import type { ButtonHTMLAttributes } from "react";

import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-secondary text-brand-background hover:bg-[#e4b12b] focus-visible:ring-brand-secondary",
  secondary:
    "border border-brand-secondary/70 bg-transparent text-brand-secondary hover:bg-brand-secondary/10 focus-visible:ring-brand-secondary",
  ghost: "bg-transparent text-brand-text hover:bg-white/10 focus-visible:ring-brand-secondary",
};

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-background disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
