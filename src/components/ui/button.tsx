import type { ButtonHTMLAttributes } from "react";

import { clsx } from "clsx";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "reality"
  | "realitySecondary"
  | "realityGhost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-secondary text-brand-background hover:bg-[#e4b12b] focus-visible:ring-brand-secondary",
  secondary:
    "border border-brand-secondary/70 bg-transparent text-brand-secondary hover:bg-brand-secondary/10 focus-visible:ring-brand-secondary",
  ghost: "bg-transparent text-brand-text hover:bg-white/10 focus-visible:ring-brand-secondary",
  reality:
    "rounded-full border-2 border-white/10 bg-reality-brand-500 text-white shadow-reality-xs hover:bg-reality-brand-600 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-white",
  realitySecondary:
    "rounded-full border border-reality-border-primary bg-white text-reality-text-secondary shadow-reality-xs hover:bg-reality-bg-subtle focus-visible:ring-reality-brand-500 focus-visible:ring-offset-white",
  realityGhost:
    "rounded-full bg-transparent text-reality-text-primary hover:bg-reality-bg-muted focus-visible:ring-reality-brand-500 focus-visible:ring-offset-white",
};

export function buttonClasses(variant: ButtonVariant = "primary", className?: string) {
  return clsx(
    "reality-pressable inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-background disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    className,
  );
}

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, className)} type={type} {...props} />;
}
