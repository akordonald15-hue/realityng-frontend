import type { ButtonHTMLAttributes } from "react";

import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500",
  secondary: "border border-brand-600 bg-white text-brand-700 hover:bg-brand-50 focus-visible:ring-brand-500",
};

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
