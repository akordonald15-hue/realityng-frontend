import Image from "next/image";

type BrandLogoProps = {
  variant?: "full" | "icon";
  className?: string;
  showTagline?: boolean;
  taglineClassName?: string;
  priority?: boolean;
};

export function BrandLogo({
  variant = "full",
  className,
  showTagline = false,
  taglineClassName,
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
        className={
          taglineClassName ??
          "mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-brand-secondary"
        }
      >
        ...where dreams find an address
      </span>
    </span>
  );
}
