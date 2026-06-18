import type { User } from "@/lib/auth/types";

export function hasApprovedRole(user: User | null, roleName: string): boolean {
  return Boolean(user?.roles.some((role) => role.role.name === roleName && role.status === "approved"));
}

export function isAdmin(user: User | null): boolean {
  return hasApprovedRole(user, "admin") || hasApprovedRole(user, "super_admin");
}

export function isApprovedProfessional(user: User | null): boolean {
  return ["agent", "artisan", "lawyer", "inspector"].some((role) => hasApprovedRole(user, role));
}
