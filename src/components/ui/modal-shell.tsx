import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

import { IconButton } from "@/components/ui/icon-button";

type ModalShellProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  onClose?: () => void;
  closeLabel?: string;
  children: ReactNode;
};

export function ModalShell({
  children,
  className,
  closeLabel = "Close",
  description,
  onClose,
  title,
  ...props
}: ModalShellProps) {
  return (
    <div
      className={clsx(
        "reality-menu relative w-full max-w-reality-form rounded-[32px] border border-reality-border-secondary bg-white p-6 text-reality-text-primary shadow-reality-sm sm:p-8",
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      {...props}
    >
      {onClose ? (
        <IconButton
          className="absolute right-4 top-4 h-10 w-10"
          icon={<span aria-hidden="true">x</span>}
          label={closeLabel}
          onClick={onClose}
          variant="reality"
        />
      ) : null}
      {title || description ? (
        <div className="max-w-sm">
          {title ? (
            <h2 className="font-display text-3xl font-medium leading-tight text-reality-text-primary">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-3 text-sm leading-6 text-reality-text-quaternary">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className={title || description ? "mt-8" : undefined}>{children}</div>
    </div>
  );
}
