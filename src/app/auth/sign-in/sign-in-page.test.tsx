import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignInPage from "@/app/auth/sign-in/page";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ signIn: mocks.signIn }),
}));

vi.mock("@/lib/demo-mode", () => ({
  USE_MOCKS: true,
}));

describe("SignInPage", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/auth/sign-in");
    mocks.signIn.mockReset();
  });

  it("shows demo mode without exposing demo credentials", () => {
    render(<SignInPage />);

    expect(screen.getByRole("status")).toHaveTextContent("Demo mode is active");
    expect(screen.queryByText(/password123/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/admin@realityng.com/i)).not.toBeInTheDocument();
  });

  it("validates email and password", async () => {
    const user = userEvent.setup();
    render(<SignInPage />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("submits valid login details", async () => {
    const user = userEvent.setup();
    mocks.signIn.mockResolvedValueOnce(undefined);
    render(<SignInPage />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "Str0ngPass123!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mocks.signIn).toHaveBeenCalledWith(
      { email: "ada@example.com", password: "Str0ngPass123!" },
      undefined,
    );
  });

  it("preserves the selected role when returning to onboarding", async () => {
    const user = userEvent.setup();
    mocks.signIn.mockResolvedValueOnce(undefined);
    window.history.pushState({}, "", "/auth/sign-in?next=%2Fonboarding%2Frole-setup&role=buyer");
    render(<SignInPage />);

    await user.type(screen.getByLabelText("Email"), "buyer@realityng.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mocks.signIn).toHaveBeenCalledWith(
      { email: "buyer@realityng.com", password: "password123" },
      "/onboarding/role-setup?role=buyer",
    );
  });
});
