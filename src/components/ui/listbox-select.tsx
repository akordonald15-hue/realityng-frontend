"use client";

import { clsx } from "clsx";
import { createPortal } from "react-dom";
import { useId, useRef, useState } from "react";

type ListboxSelectOption = {
  label: string;
  value: string;
};

type ListboxSelectProps = {
  "aria-label"?: string;
  className?: string;
  label?: string;
  onChange: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  options: ListboxSelectOption[];
  placeholder?: string;
  value: string;
  variant?: "hero" | "reality";
};

export function ListboxSelect({
  "aria-label": ariaLabel,
  className,
  label,
  onChange,
  onOpenChange,
  options,
  placeholder = "Select",
  value,
  variant = "hero",
}: ListboxSelectProps) {
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((option) => option.value === value),
    ),
  );
  const selected = options.find((option) => option.value === value);
  const listboxId = `${id}-listbox`;

  function updateOpen(nextOpen: boolean) {
    setIsOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function closeAndFocus() {
    updateOpen(false);
    buttonRef.current?.focus();
  }

  function choose(index: number) {
    const option = options[index];
    if (!option) {
      return;
    }
    onChange(option.value);
    setActiveIndex(index);
    closeAndFocus();
  }

  function move(delta: number) {
    setActiveIndex((current) => (current + delta + options.length) % options.length);
  }

  function containsInteractiveTarget(target: EventTarget | null) {
    if (!(target instanceof Node)) {
      return false;
    }

    return Boolean(buttonRef.current?.contains(target) || document.getElementById(listboxId)?.contains(target));
  }

  const menu = isOpen ? (
    <div
      className={clsx(
        "border border-reality-border-secondary bg-white text-reality-text-primary shadow-[0_20px_45px_rgba(3,37,31,0.22)] ring-1 ring-black/5",
        variant === "hero"
          ? "fixed left-1/2 top-[58%] z-50 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-[24px] p-2.5 max-md:top-1/2 max-md:w-[calc(100vw-32px)]"
          : "reality-menu absolute left-0 top-full z-50 mt-4 max-h-80 w-56 overflow-y-auto rounded-[16px] p-1.5",
      )}
      onBlur={(event) => {
        if (!containsInteractiveTarget(event.relatedTarget)) {
          updateOpen(false);
        }
      }}
      role="presentation"
    >
      <div
        aria-activedescendant={`${id}-option-${activeIndex}`}
        className={clsx(variant === "hero" && "grid grid-cols-2 gap-1.5 sm:grid-cols-3")}
        id={listboxId}
        role="listbox"
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const isActive = index === activeIndex;
          return (
            <button
              aria-selected={isSelected}
              className={clsx(
                "flex w-full items-center text-left text-sm transition focus:outline-none",
                variant === "hero"
                  ? "min-h-11 justify-center rounded-[16px] px-3 text-center font-medium"
                  : "min-h-10 rounded-[12px] px-3",
                isSelected
                  ? "bg-reality-brand-500 text-white"
                  : "text-reality-text-secondary hover:bg-reality-bg-muted hover:text-reality-text-primary",
                isActive && !isSelected && "bg-reality-bg-muted text-reality-text-primary",
              )}
              id={`${id}-option-${index}`}
              key={option.value || "empty"}
              onClick={() => choose(index)}
              onMouseEnter={() => setActiveIndex(index)}
              role="option"
              tabIndex={-1}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div className={clsx(variant === "hero" ? "relative max-md:static" : "relative", className)}>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel ?? label}
        className={clsx(
          "flex w-full min-w-0 items-center justify-between gap-2 bg-transparent text-left text-sm outline-none transition focus-visible:ring-2",
          variant === "hero"
            ? "h-5 rounded-[6px] p-0 text-white/75 hover:text-white focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#062820]"
            : "h-14 rounded-[12px] border border-reality-border-secondary bg-white px-4 text-reality-text-primary shadow-reality-sm hover:border-reality-brand-500 focus-visible:ring-reality-brand-500/20",
        )}
        onBlur={(event) => {
          if (!containsInteractiveTarget(event.relatedTarget)) {
            updateOpen(false);
          }
        }}
        onClick={() => updateOpen(!isOpen)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!isOpen) {
              updateOpen(true);
            } else {
              move(1);
            }
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!isOpen) {
              updateOpen(true);
            } else {
              move(-1);
            }
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (isOpen) {
              choose(activeIndex);
            } else {
              updateOpen(true);
            }
          }
          if (event.key === "Escape") {
            event.preventDefault();
            closeAndFocus();
          }
        }}
        ref={buttonRef}
        type="button"
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <span
          aria-hidden="true"
          className={clsx("text-xs", variant === "hero" ? "text-white/60" : "text-reality-text-muted")}
        >
          v
        </span>
      </button>
      {variant === "hero" && typeof document !== "undefined" ? createPortal(menu, document.body) : menu}
    </div>
  );
}
