import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RoleSelectionProvider, useRoleSelection } from "@/components/auth/role-selection-modal";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

function Trigger() {
  const { openRoleSelection } = useRoleSelection();

  return (
    <button
      onClick={() =>
        openRoleSelection({
          actionLabel: "Save property",
          nextPath: "/properties/lekki-apartment",
        })
      }
      type="button"
    >
      Open account prompt
    </button>
  );
}

describe("RoleSelectionProvider", () => {
  it("shows value-based account guidance and preserves the selected action", () => {
    render(
      <RoleSelectionProvider>
        <Trigger />
      </RoleSelectionProvider>,
    );

    fireEvent.click(screen.getByText("Open account prompt"));

    expect(screen.getByText("Create an account to continue.")).toBeInTheDocument();
    expect(screen.getByText("Continue to:")).toBeInTheDocument();
    expect(screen.getByText("Save property")).toBeInTheDocument();
    expect(screen.getByText("Your account unlocks")).toBeInTheDocument();
    expect(screen.getByText("Request viewings or send inquiries")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Buyer / Tenant"));

    expect(mocks.push).toHaveBeenCalledWith(
      "/auth/sign-up?role=buyer&next=%2Fproperties%2Flekki-apartment",
    );
  });
});
