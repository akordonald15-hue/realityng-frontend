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

  it("renders the identifier step with demo mode context", () => {
    render(<SignInPage />);

    expect(screen.getByRole("heading", { name: "Sign in/Sign up" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute(
      "href",
      "/auth/sign-up",
    );
    expect(screen.getByText(/Demo mode is active/)).toBeInTheDocument();
    expect(screen.queryByText(/password123/i)).not.toBeInTheDocument();
  });

  it("validates the identifier before showing the password step", async () => {
    const user = userEvent.setup();
    render(<SignInPage />);

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Enter password" })).not.toBeInTheDocument();
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("moves from identifier to password and submits valid login details", async () => {
    const user = userEvent.setup();
    mocks.signIn.mockResolvedValueOnce(undefined);
    render(<SignInPage />);

    await user.type(screen.getByLabelText("Email address"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByRole("heading", { name: "Enter password" });
    await user.type(screen.getByLabelText("Password"), "Str0ngPass123!");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(mocks.signIn).toHaveBeenCalledWith(
      { email: "ada@example.com", password: "Str0ngPass123!" },
      undefined,
    );
    expect(await screen.findByRole("heading", { name: "Logged In" })).toBeInTheDocument();
  });

  it("shows backend errors without leaving the password step", async () => {
    const user = userEvent.setup();
    mocks.signIn.mockRejectedValueOnce(new Error("Invalid login"));
    render(<SignInPage />);

    await user.type(screen.getByLabelText("Email address"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(await screen.findByLabelText("Password"), "bad-password");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Enter password" })).toBeInTheDocument();
  });

  it("keeps forgot-password navigation on the password step", async () => {
    const user = userEvent.setup();
    render(<SignInPage />);

    await user.type(screen.getByLabelText("Email address"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByRole("link", { name: "Forgot Password" })).toHaveAttribute(
      "href",
      "/auth/forgot-password",
    );
  });

  it("preserves the selected role when returning to onboarding", async () => {
    const user = userEvent.setup();
    mocks.signIn.mockResolvedValueOnce(undefined);
    window.history.pushState({}, "", "/auth/sign-in?next=%2Fonboarding%2Frole-setup&role=buyer");
    render(<SignInPage />);

    await user.type(screen.getByLabelText("Email address"), "buyer@realityng.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(await screen.findByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(mocks.signIn).toHaveBeenCalledWith(
      { email: "buyer@realityng.com", password: "password123" },
      "/onboarding/role-setup?role=buyer",
    );
  });
});
