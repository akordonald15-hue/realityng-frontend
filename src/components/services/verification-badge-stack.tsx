import { Badge } from "@/components/ui/badge";
import type { VerificationBadge } from "@/lib/api/services";

type VerificationBadgeStackProps = {
  badges: VerificationBadge[];
  variant?: "legacy" | "reality";
};

export function VerificationBadgeStack({ badges, variant = "reality" }: VerificationBadgeStackProps) {
  const pendingVariant = variant === "reality" ? "pending" : "muted";
  const approvedVariant = variant === "reality" ? "approved" : "green";

  if (badges.length === 0) {
    return <Badge variant={pendingVariant}>Verification pending</Badge>;
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="Verification badges">
      {badges.map((badge) => (
        <Badge key={`${badge.label}-${badge.verified_at ?? badge.status}`} variant={approvedVariant}>
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}


