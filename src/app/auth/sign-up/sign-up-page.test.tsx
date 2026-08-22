import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SignUpPage from "@/app/auth/sign-up/page";

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ signUp: mocks.signUp }),
}));

describe("SignUpPage", () => {
  it("validates required account fields", async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("submits valid registration details", async () => {
    const user = userEvent.setup();
    mocks.signUp.mockResolvedValueOnce({ id: "user-1" });
    render(<SignUpPage />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "Str0ngPass123!");
    await user.click(screen.getByLabelText(/I accept the Terms/));
    await user.click(screen.getByLabelText(/I acknowledge the Privacy Notice/));
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Account created. Continue to sign in.")).toBeInTheDocument();
    expect(mocks.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ada@example.com", password: "Str0ngPass123!" }),
    );
  });
});
