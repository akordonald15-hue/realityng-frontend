import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SignUpPrompt } from "@/components/auth/sign-up-prompt";

const mocks = vi.hoisted(() => ({
  openRoleSelection: vi.fn(),
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
  }),
}));

vi.mock("@/components/auth/role-selection-modal", () => ({
  useRoleSelection: () => ({ openRoleSelection: mocks.openRoleSelection }),
}));

describe("SignUpPrompt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.history.pushState({}, "", "/");
    mocks.openRoleSelection.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens role selection during anonymous browsing", async () => {
    render(<SignUpPrompt />);

    act(() => {
      vi.advanceTimersByTime(12_000);
    });

    expect(mocks.openRoleSelection).toHaveBeenCalledWith({
      actionLabel: "Create account",
      nextPath: "/properties",
    });
  });

  it("does not override explicit protected action return URLs", async () => {
    window.history.pushState(
      {},
      "",
      "/properties/waterfront-banana-island-duplex?action=show-interest",
    );

    render(<SignUpPrompt />);

    act(() => {
      vi.advanceTimersByTime(12_000);
    });

    expect(mocks.openRoleSelection).not.toHaveBeenCalled();
  });
});
