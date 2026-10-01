import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import RoleSetupPage from "@/app/onboarding/role-setup/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  refreshSession: vi.fn(),
  requestRole: vi.fn(),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { roles: [] },
    refreshSession: mocks.refreshSession,
  }),
}));

vi.mock("@/lib/api/auth", () => ({
  getRoles: () =>
    Promise.resolve([
      {
        id: "role-agent",
        name: "agent",
        description: "Real estate agent.",
        created_at: "2026-06-16T00:00:00Z",
        approval_required: true,
      },
      {
        id: "role-admin",
        name: "admin",
        description: "Internal administration.",
        created_at: "2026-06-16T00:00:00Z",
        approval_required: true,
      },
    ]),
  requestRole: (role: string) => mocks.requestRole(role),
}));

describe("RoleSetupPage", () => {
  it("requests a role and displays pending approval status", async () => {
    const user = userEvent.setup();
    mocks.requestRole.mockResolvedValueOnce({
      id: "user-role-1",
      status: "pending",
      role: { name: "agent" },
    });

    renderWithQueryClient(<RoleSetupPage />);

    await user.click(await screen.findByRole("button", { name: "Request" }));

    await waitFor(() => expect(mocks.requestRole).toHaveBeenCalledWith("agent"));
    expect(await screen.findByText("agent role requested and awaiting approval.")).toBeInTheDocument();
    expect(screen.queryByText("Internal administration.")).not.toBeInTheDocument();
  });

  it("preserves a safe continuation without automatically granting a role", async () => {
    window.history.pushState({}, "", "/onboarding/role-setup?role=agent&next=%2Fproperties%2Fnew");
    renderWithQueryClient(<RoleSetupPage />);

    expect(await screen.findByText(/Continue with agent/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue to your next step" })).toHaveAttribute(
      "href",
      "/properties/new",
    );
    expect(mocks.requestRole).not.toHaveBeenCalled();
  });
});
