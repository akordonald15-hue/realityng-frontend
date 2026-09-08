import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonVariant = "legacy" | "reality" | "realityGhost";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
};

const variantClasses: Record<IconButtonVariant, string> = {
  legacy:
    "rounded-md border border-white/10 bg-white/5 text-brand-text hover:bg-white/10 focus-visible:ring-brand-secondary focus-visible:ring-offset-brand-background",
  reality:
    "rounded-full border border-reality-border-secondary bg-white text-reality-text-primary shadow-reality-xs hover:bg-reality-bg-subtle focus-visible:ring-reality-brand-500 focus-visible:ring-offset-white",
  realityGhost:
    "rounded-full bg-reality-alpha-black20 text-white hover:bg-black/30 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-white",
};

export function IconButton({
  className,
  icon,
  label,
  type = "button",
  variant = "reality",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={clsx(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      title={label}
      type={type}
      {...props}
    >
      {icon}
    </button>
  );
}
