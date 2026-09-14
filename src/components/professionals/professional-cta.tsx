"use client";

import Link from "next/link";

import { ProtectedActionLink } from "@/components/auth/protected-action-link";
import { buttonClasses } from "@/components/ui/button";
import { hasApprovedRole } from "@/lib/auth/permissions";
import { useOptionalAuth } from "@/providers/auth-provider";

type ProfessionalCtaProps = {
  children: React.ReactNode;
  className?: string;
  role: "agent" | "landlord";
  variant?: "reality" | "realitySecondary";
};

const roleLabels = {
  agent: "agent",
  landlord: "property owner",
};

export function ProfessionalCta({
  children,
  className,
  role,
  variant = "reality",
}: ProfessionalCtaProps) {
  const auth = useOptionalAuth();
  const user = auth?.user ?? null;
  const matchingRole = user?.roles.find((userRole) => userRole.role.name === role);

  if (hasApprovedRole(user, role)) {
    return (
      <Link className={buttonClasses(variant, className)} href="/dashboard">
        Go to Dashboard
      </Link>
    );
  }

  if (matchingRole?.status === "pending") {
    return (
      <Link className={buttonClasses(variant, className)} href="/verification">
        Check verification
      </Link>
    );
  }

  if (matchingRole?.status === "rejected") {
    return (
      <Link className={buttonClasses(variant, className)} href="/settings/profile">
        Review account status
      </Link>
    );
  }

  const nextPath = role === "landlord" ? "/properties/new" : "/dashboard";

  return (
    <ProtectedActionLink
      actionLabel={role === "landlord" ? "list a property" : "join as an agent"}
      className={buttonClasses(variant, className)}
      href={nextPath}
      role={role}
    >
      {children || `Join as ${roleLabels[role]}`}
    </ProtectedActionLink>
  );
}

