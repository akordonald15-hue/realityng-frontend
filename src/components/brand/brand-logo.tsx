import Image from "next/image";

import fullLogo from "../../../assets/full logo.png";
import iconLogo from "../../../assets/logo.png";

type BrandLogoProps = {
  variant?: "full" | "icon";
  className?: string;
  priority?: boolean;
  treatment?: "transparent" | "light";
};

export function BrandLogo({
  variant = "full",
  className,
  priority = false,
  treatment = "transparent",
}: BrandLogoProps) {
  const image = variant === "full" ? fullLogo : iconLogo;
  const logo = (
    <Image
      alt="RealityNG"
      className={className}
      height={variant === "full" ? 72 : 48}
      priority={priority}
      src={image}
      width={variant === "full" ? 220 : 64}
    />
  );

  if (treatment === "light") {
    return <span className="inline-flex rounded-md bg-white px-3 py-1.5 shadow-sm">{logo}</span>;
  }

  return logo;
}
