import { describe, expect, it } from "vitest";

import {
  isAdmin,
  getRoleDashboardPath,
  isApprovedProfessional,
  isApprovedSupplyUser,
} from "@/lib/auth/permissions";
import type { User } from "@/lib/auth/types";

function userWithRole(roleName: string, status: "pending" | "approved" | "rejected" = "approved") {
  return {
    roles: [
      {
        role: { name: roleName },
        status,
      },
    ],
  } as User;
}

describe("role permissions", () => {
  it("routes server-approved native beta accounts through normal dashboards", () => {
    for (const role of ["buyer", "landlord", "agent", "artisan"]) {
      expect(getRoleDashboardPath({ ...userWithRole(role), is_beta_test_account: true, beta_native_enabled: true })).toBe("/dashboard");
    }
    expect(getRoleDashboardPath({ ...userWithRole("buyer"), is_beta_test_account: true, beta_native_enabled: true, beta_native_role: "admin" })).toBe("/admin");
    expect(isAdmin({ ...userWithRole("buyer"), beta_native_role: "admin" })).toBe(false);
  });
  it("sends sealed beta roles to the private portal", () => {
    for (const role of ["buyer", "agent", "landlord", "artisan", "admin"]) {
      expect(getRoleDashboardPath({ ...userWithRole(role), is_beta_test_account: true })).toBe("/management-demo");
    }
    expect(getRoleDashboardPath(userWithRole("admin"))).toBe("/admin");
  });
  it("treats only approved agents and landlords as supply users", () => {
    expect(isApprovedSupplyUser(userWithRole("agent"))).toBe(true);
    expect(isApprovedSupplyUser(userWithRole("landlord"))).toBe(true);
    expect(isApprovedSupplyUser(userWithRole("agent", "pending"))).toBe(false);
    expect(isApprovedSupplyUser(userWithRole("landlord", "pending"))).toBe(false);
    expect(isApprovedSupplyUser(userWithRole("agent", "rejected"))).toBe(false);
    expect(isApprovedSupplyUser(userWithRole("landlord", "rejected"))).toBe(false);
    expect(isApprovedSupplyUser(userWithRole("buyer"))).toBe(false);
    expect(isApprovedSupplyUser(userWithRole("artisan"))).toBe(false);
    expect(isApprovedSupplyUser(userWithRole("inspector"))).toBe(false);
    expect(isApprovedSupplyUser(userWithRole("admin"))).toBe(false);
  });

  it("keeps professional and admin helpers semantically separate", () => {
    expect(isApprovedProfessional(userWithRole("artisan"))).toBe(true);
    expect(isApprovedProfessional(userWithRole("inspector"))).toBe(true);
    expect(isApprovedProfessional(userWithRole("landlord"))).toBe(false);
    expect(isAdmin(userWithRole("admin"))).toBe(true);
    expect(isAdmin(userWithRole("landlord"))).toBe(false);
  });
});
