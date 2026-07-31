import { Badge } from "@/components/ui/badge";
import type { VerificationBadge } from "@/lib/api/services";

type VerificationBadgeStackProps = {
  badges: VerificationBadge[];
};

export function VerificationBadgeStack({ badges }: VerificationBadgeStackProps) {
  if (badges.length === 0) {
    return <Badge variant="muted">Verification pending</Badge>;
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="Verification badges">
      {badges.map((badge) => (
        <Badge key={`${badge.label}-${badge.verified_at ?? badge.status}`} variant="green">
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
