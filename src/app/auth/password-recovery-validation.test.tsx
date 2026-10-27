import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPasswordPage from "@/app/auth/forgot-password/page";
import ResetPasswordPage from "@/app/auth/reset-password/page";

const mocks = vi.hoisted(() => ({ forgot: vi.fn(), reset: vi.fn() }));
vi.mock("@/lib/api/auth", () => ({
  forgotPassword: (email: string) => mocks.forgot(email),
  resetPassword: (payload: unknown) => mocks.reset(payload),
}));
describe("Password recovery Zod 4 validation", () => {
  beforeEach(() => {
    mocks.forgot.mockReset();
    mocks.reset.mockReset();
    mocks.forgot.mockResolvedValue(undefined);
    mocks.reset.mockResolvedValue(undefined);
  });
  it("shows an email field error, then submits the valid email to the existing handler", async () => {
    render(<ForgotPasswordPage />);
    const form = screen.getByRole("button", { name: "Send reset instructions" }).closest("form")!;
    fireEvent.submit(form);
    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(mocks.forgot).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a_b.c@example.com" } });
    fireEvent.submit(form);
    await waitFor(() => expect(mocks.forgot).toHaveBeenCalledWith("a_b.c@example.com"));
    expect(
      await screen.findByText("If the email exists, reset instructions have been sent."),
    ).toBeInTheDocument();
  });
  it("keeps reset identity, token and password required, then calls the reset handler", async () => {
    render(<ResetPasswordPage />);
    const form = screen.getByRole("button", { name: "Save new password" }).closest("form")!;
    fireEvent.submit(form);
    for (const message of [
      "Reset user id is required.",
      "Reset token is required.",
      "Password must be at least 8 characters.",
    ])
      expect(await screen.findByText(message)).toBeInTheDocument();
    expect(mocks.reset).not.toHaveBeenCalled();
    for (const [label, value] of [
      ["User ID", "synthetic-user"],
      ["Reset token", "synthetic-token"],
      ["New password", "SyntheticPassword123!"],
    ])
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.submit(form);
    await waitFor(() =>
      expect(mocks.reset).toHaveBeenCalledWith({
        uid: "synthetic-user",
        token: "synthetic-token",
        password: "SyntheticPassword123!",
      }),
    );
    expect(await screen.findByText("Password reset. You can now sign in.")).toBeInTheDocument();
  });
});
