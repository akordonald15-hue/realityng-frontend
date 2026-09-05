import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: "reality" | "narrow" | "full";
};

const sizeClasses: Record<NonNullable<PageContainerProps["size"]>, string> = {
  reality: "max-w-reality",
  narrow: "max-w-reality-form",
  full: "max-w-none",
};

export function PageContainer({
  children,
  className,
  size = "reality",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={clsx("mx-auto w-full px-5 sm:px-6 lg:px-0", sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
