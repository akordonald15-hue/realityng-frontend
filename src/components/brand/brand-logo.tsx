import Image from "next/image";
import { clsx } from "clsx";

type BrandLogoProps = {
  variant?: "full" | "icon";
  tone?: "dark" | "light";
  className?: string;
  showTagline?: boolean;
  taglineClassName?: string;
  tagline?: string;
  priority?: boolean;
};

export function BrandLogo({
  variant = "full",
  tone = "dark",
  className,
  showTagline = false,
  taglineClassName,
  tagline = "Where Dreams Find an Address",
  priority = false,
}: BrandLogoProps) {
  const isFull = variant === "full";
  const logoSrc = isFull
    ? tone === "light"
      ? "/brand/realityng-logo-white.svg"
      : "/brand/realityng-logo-black.svg"
    : "/icons/realityng-icon.svg";

  const logo = (
    <Image
      alt="RealityNG"
      className={className}
      height={isFull ? 33 : 32}
      priority={priority}
      src={logoSrc}
      unoptimized
      width={isFull ? 139 : 39}
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
          "ml-[36%] -mt-1 block whitespace-nowrap font-body text-[0.55rem] font-medium tracking-[0.16em] text-brand-secondary",
          taglineClassName,
        )}
      >
        {tagline}
      </span>
    </span>
  );
}
