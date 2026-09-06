"use client";

import { clsx } from "clsx";
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

  function closeAndFocus() {
    setIsOpen(false);
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

  return (
    <div className={clsx("relative", className)}>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel ?? label}
        className={clsx(
          "flex w-full min-w-0 items-center justify-between gap-2 bg-transparent text-left text-sm outline-none transition focus-visible:rounded-sm focus-visible:ring-2",
          variant === "hero"
            ? "h-5 p-0 text-white/75 hover:text-white focus-visible:ring-white/70"
            : "h-14 rounded-[12px] border border-reality-border-secondary bg-white px-4 text-reality-text-primary shadow-reality-sm hover:border-reality-brand-500 focus-visible:ring-reality-brand-500/20",
        )}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) {
            setIsOpen(false);
          }
        }}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
            } else {
              move(1);
            }
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
            } else {
              move(-1);
            }
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (isOpen) {
              choose(activeIndex);
            } else {
              setIsOpen(true);
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
      {isOpen ? (
        <div
          className="reality-menu absolute left-0 top-full z-50 mt-4 w-56 overflow-hidden rounded-[16px] border border-reality-border-secondary bg-white p-1.5 text-reality-text-primary shadow-reality-sm"
          onBlur={(event) => {
            if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) {
              setIsOpen(false);
            }
          }}
          role="presentation"
        >
          <div aria-activedescendant={`${id}-option-${activeIndex}`} id={listboxId} role="listbox">
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <button
                  aria-selected={isSelected}
                  className={clsx(
                    "flex min-h-10 w-full items-center rounded-[12px] px-3 text-left text-sm transition focus:outline-none",
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
      ) : null}
    </div>
  );
}
