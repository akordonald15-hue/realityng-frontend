"use client";

import { clsx } from "clsx";

type AssistantOrbState = "idle" | "thinking" | "listening";

type AssistantOrbProps = {
  state?: AssistantOrbState;
  size?: "sm" | "md" | "lg" | "launcher";
  className?: string;
};

const sizeClasses = {
  sm: "h-11 w-11",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  // Narrow phones get a smaller visible orb so the floating launcher covers
  // less body copy. The button around it keeps its full touch target.
  launcher: "h-11 w-11 sm:h-14 sm:w-14",
};

export function AssistantOrb({ state = "idle", size = "md", className }: AssistantOrbProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "assistant-orb relative inline-flex shrink-0 items-center justify-center rounded-full",
        `assistant-orb-${state}`,
        sizeClasses[size],
        className,
      )}
    >
      <span className="assistant-orb-aura" />
      <span className="assistant-orb-glass" />
      <span className="assistant-orb-ripple" />
      <span className="assistant-orb-core">
        <svg
          className="assistant-orb-icon"
          fill="none"
          viewBox="0 0 36 36"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="assistant-orb-house"
            d="M9.25 19.2 18 11.85l8.75 7.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            className="assistant-orb-house assistant-orb-house-base"
            d="M12.15 18.6v6.55h11.7V18.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle className="assistant-orb-core-node" cx="18" cy="20.2" r="3.2" />
          <path
            className="assistant-orb-circuit"
            d="M18 16.9v-2.1M15.1 20.2h-2.2M20.9 20.2h2.2M16 22.55l-1.35 1.35M20 22.55l1.35 1.35"
            strokeLinecap="round"
          />
          <path
            className="assistant-orb-spark"
            d="M25.25 9.1l.72 1.76 1.76.72-1.76.72-.72 1.76-.72-1.76-1.76-.72 1.76-.72.72-1.76z"
          />
        </svg>
      </span>
    </span>
  );
}

