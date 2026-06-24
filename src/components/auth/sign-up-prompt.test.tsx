import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SignUpPrompt } from "@/components/auth/sign-up-prompt";

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
  }),
}));

describe("SignUpPrompt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens during anonymous browsing and remembers dismissal", async () => {
    render(<SignUpPrompt />);

    act(() => {
      vi.advanceTimersByTime(12_000);
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute(
      "href",
      "/auth/sign-up?next=%2Fproperties",
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue browsing" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.localStorage.getItem("realityng.signUpPromptDismissedAt")).toBeTruthy();
  });
});
