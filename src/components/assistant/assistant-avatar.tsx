"use client";

import Image from "next/image";
import { useState } from "react";
import { clsx } from "clsx";
import { AssistantOrb } from "./assistant-orb";

type Props = {
  state?: "idle" | "thinking" | "listening";
  size?: "sm" | "md" | "lg" | "launcher";
  className?: string;
};
const sizes = {
  sm: "h-11 w-11",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  launcher: "h-11 w-11 sm:h-14 sm:w-14",
};

/** Fictional AI concierge; decorative portrait, never a human-presence indicator. */
export function AssistantAvatar({ state = "idle", size = "md", className }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) return <AssistantOrb state={state} size={size} className={className} />;
  return (
    <span
      aria-hidden="true"
      data-assistant-avatar
      className={clsx(
        "relative inline-flex shrink-0 rounded-full ring-2 ring-emerald-100 shadow-reality-sm",
        state === "thinking" && "ring-emerald-500",
        sizes[size],
        className,
      )}
    >
      <span className="relative block h-full w-full overflow-hidden rounded-full bg-[#fff7ed]">
        <Image
          src="/assistant/concierge-portrait.png"
          alt=""
          fill
          sizes={size === "lg" ? "80px" : size === "sm" ? "44px" : "56px"}
          className="object-cover object-[50%_38%] motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:scale-[1.03]"
          onError={() => setFailed(true)}
        />
      </span>
      <span className="absolute -bottom-1 -right-1 rounded-full border border-white bg-[#064e3b] px-1 text-[10px] font-bold leading-4 text-white">
        AI
      </span>
    </span>
  );
}
