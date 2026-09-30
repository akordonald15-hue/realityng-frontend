"use client";

import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");

    const focusFirstControl = () => {
      const firstControl = dialog.querySelector<HTMLElement>(focusableSelector);
      (firstControl ?? dialog).focus();
    };

    focusFirstControl();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onCloseRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => {
      dialog.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      aria-describedby={description ? descriptionId : undefined}
      aria-label={title ? undefined : props["aria-label"]}
      aria-labelledby={title ? titleId : undefined}
      aria-modal="true"
      className={clsx(
        "reality-menu relative w-full max-w-reality-form rounded-[32px] border border-reality-border-secondary bg-white p-6 text-reality-text-primary shadow-reality-sm sm:p-8",
        className,
      )}
      ref={dialogRef}
      role="dialog"
      tabIndex={-1}
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
            <h2 className="font-display text-3xl font-medium leading-tight text-reality-text-primary" id={titleId}>
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-3 text-sm leading-6 text-reality-text-quaternary" id={descriptionId}>{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className={title || description ? "mt-8" : undefined}>{children}</div>
    </div>
  );
}
