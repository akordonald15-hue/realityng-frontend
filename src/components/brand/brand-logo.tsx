import Image from "next/image";
import { clsx } from "clsx";

type BrandLogoProps = {
  variant?: "full" | "icon";
  className?: string;
  showTagline?: boolean;
  taglineClassName?: string;
  tagline?: string;
  priority?: boolean;
};

export function BrandLogo({
  variant = "full",
  className,
  showTagline = false,
  taglineClassName,
  tagline = "Where Dreams Find an Address",
  priority = false,
}: BrandLogoProps) {
  const isFull = variant === "full";

  const logo = (
    <Image
      alt="RealityNG"
      className={className}
      height={isFull ? 274 : 512}
      priority={priority}
      src={isFull ? "/brand/realityng-logo-header.png" : "/icons/realityng-icon-512.png"}
      width={isFull ? 1200 : 512}
    />
  );

  if (!showTagline || !isFull) {
    return logo;
  }

  return (
    <span className="inline-flex flex-col items-start">
      {logo}
      <span
        className={clsx(
          "ml-[31%] block whitespace-nowrap font-body text-[0.55rem] font-medium tracking-[0.16em] text-brand-secondary",
          taglineClassName,
        )}
      >
        {tagline}
      </span>
    </span>
  );
}
