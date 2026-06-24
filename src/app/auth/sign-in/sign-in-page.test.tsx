import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SignInPage from "@/app/auth/sign-in/page";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ signIn: mocks.signIn }),
}));

describe("SignInPage", () => {
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
});
