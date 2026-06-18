import { Badge } from "@/components/ui/badge";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <h2 className="mt-4 font-heading text-3xl font-semibold text-brand-text sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="mt-3 text-base leading-7 text-brand-muted">{description}</p> : null}
    </div>
  );
}
