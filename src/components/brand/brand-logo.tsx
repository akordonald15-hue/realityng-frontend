import Image from "next/image";

type BrandLogoProps = {
  variant?: "full" | "icon";
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ variant = "full", className, priority = false }: BrandLogoProps) {
  const isFull = variant === "full";

  return (
    <Image
      alt="RealityNG"
      className={className}
      height={isFull ? 274 : 512}
      priority={priority}
      src={isFull ? "/brand/realityng-logo-header.png" : "/icons/realityng-icon-512.png"}
      width={isFull ? 1200 : 512}
    />
  );
}
