import Image from "next/image";

import fullLogo from "../../../assets/full logo.png";
import iconLogo from "../../../assets/logo.png";

type BrandLogoProps = {
  variant?: "full" | "icon";
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ variant = "full", className, priority = false }: BrandLogoProps) {
  const image = variant === "full" ? fullLogo : iconLogo;
  return (
    <Image
      alt="RealityNG"
      className={className}
      height={variant === "full" ? 72 : 48}
      priority={priority}
      src={image}
      width={variant === "full" ? 220 : 64}
    />
  );
}
