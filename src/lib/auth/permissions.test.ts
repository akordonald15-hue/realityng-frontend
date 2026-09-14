import { describe, expect, it } from "vitest";

import {
  isAdmin,
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
