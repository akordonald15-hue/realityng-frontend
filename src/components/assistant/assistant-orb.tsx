"use client";

import { clsx } from "clsx";

type AssistantOrbState = "idle" | "speaking" | "listening";

type AssistantOrbProps = {
  state?: AssistantOrbState;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-11 w-11",
  md: "h-14 w-14",
  lg: "h-20 w-20",
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
      <span className="assistant-orb-halo" />
      <span className="assistant-orb-ripple" />
      <span className="assistant-orb-particle assistant-orb-particle-one" />
      <span className="assistant-orb-particle assistant-orb-particle-two" />
      <span className="assistant-orb-particle assistant-orb-particle-three" />
      <span className="assistant-orb-core" />
    </span>
  );
}
