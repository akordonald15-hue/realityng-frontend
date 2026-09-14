import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

export type SegmentedTabItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SegmentedTabsProps = {
  items: SegmentedTabItem[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
  buttonProps?: Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onChange" | "onClick" | "role" | "type" | "value"
  >;
};

export function SegmentedTabs({
  buttonProps,
  className,
  items,
  label,
  onChange,
  value,
}: SegmentedTabsProps) {
  return (
    <div
      aria-label={label}
      className={clsx("inline-flex gap-2 rounded-full bg-white/80 p-1", className)}
      role="tablist"
    >
      {items.map((item) => (
        <button
          aria-selected={item.value === value}
          {...buttonProps}
          className={clsx(
            "reality-pressable h-9 rounded-full px-5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 disabled:cursor-not-allowed disabled:opacity-60",
            item.value === value
              ? "bg-reality-brand-500 text-white shadow-reality-xs"
              : "text-reality-text-secondary hover:bg-reality-bg-muted",
            buttonProps?.className,
          )}
          disabled={item.disabled}
          key={item.value}
          onClick={() => onChange(item.value)}
          role="tab"
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

