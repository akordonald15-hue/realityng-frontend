import { Badge } from "@/components/ui/badge";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  variant?: "legacy" | "reality";
};

export function SectionHeader({ eyebrow, title, description, variant = "reality" }: SectionHeaderProps) {
  const isReality = variant === "reality";

  return (
    <div className="max-w-3xl">
      {eyebrow ? <Badge variant={isReality ? "approved" : "gold"}>{eyebrow}</Badge> : null}
      <h2
        className={
          isReality
            ? "mt-4 font-display text-3xl font-semibold text-reality-text-primary sm:text-4xl"
            : "mt-4 font-display text-3xl font-semibold text-reality-text-primary sm:text-4xl"
        }
      >
        {title}
      </h2>
      {description ? (
        <p
          className={
            isReality
              ? "mt-3 text-base leading-7 text-reality-text-secondary"
              : "mt-3 text-base leading-7 text-reality-text-secondary"
          }
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

