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
  it("renders the identifier step", () => {
    render(<SignUpPage />);

    expect(screen.getByRole("heading", { name: "Sign in/Sign up" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in instead" })).toHaveAttribute(
      "href",
      "/auth/sign-in?next=%2Fonboarding%2Frole-setup",
    );
  });

  it("validates the identifier before showing account details", async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Complete sign up" })).not.toBeInTheDocument();
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("progresses through supported visual steps and submits the registration payload", async () => {
    const user = userEvent.setup();
    mocks.signUp.mockResolvedValueOnce({ id: "user-1" });
    render(<SignUpPage />);

    await user.type(screen.getByLabelText("Email address"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByRole("heading", { name: "Complete sign up" });
    await user.type(screen.getByLabelText("First name"), "Ada");
    await user.type(screen.getByLabelText("Last name"), "Okafor");
    await user.type(screen.getByLabelText("Phone"), "08123834240");
    await user.type(screen.getByLabelText("Password"), "Str0ngPass123!");
    await user.click(screen.getByLabelText(/I accept the Terms/));
    await user.click(screen.getByLabelText(/I acknowledge the Privacy Notice/));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByRole("heading", { name: "Account created" })).toBeInTheDocument();
    expect(mocks.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        accepts_privacy: true,
        accepts_terms: true,
        email: "ada@example.com",
        first_name: "Ada",
        last_name: "Okafor",
        password: "Str0ngPass123!",
        phone_number: "08123834240",
        privacy_version: "2026-08",
        terms_version: "2026-08",
      }),
    );
  });

  it("validates required details before registration", async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    await user.type(screen.getByLabelText("Email address"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(await screen.findByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Password must be at least 8 characters.")).toBeInTheDocument();
    expect(screen.getByText("Accept the Terms to continue.")).toBeInTheDocument();
    expect(screen.getByText("Acknowledge the Privacy Notice to continue.")).toBeInTheDocument();
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("shows backend errors on the details step", async () => {
    const user = userEvent.setup();
    mocks.signUp.mockRejectedValueOnce(new Error("Registration failed"));
    render(<SignUpPage />);

    await user.type(screen.getByLabelText("Email address"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(await screen.findByLabelText("Password"), "Str0ngPass123!");
    await user.click(screen.getByLabelText(/I accept the Terms/));
    await user.click(screen.getByLabelText(/I acknowledge the Privacy Notice/));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Complete sign up" })).toBeInTheDocument();
  });

  it("opens Terms and Privacy in dismissible dialogs without leaving sign-up", async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    await user.type(screen.getByLabelText("Email address"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByRole("heading", { name: "Complete sign up" });

    await user.click(screen.getByRole("button", { name: "Terms and Conditions" }));
    expect(screen.getByRole("dialog", { name: "Terms and Conditions" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "I accept the Terms and Conditions" })).not.toBeChecked();
    expect(screen.getByText("Using the marketplace")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Complete sign up" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog", { name: "Terms and Conditions" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Privacy Notice" }));
    expect(screen.getByRole("dialog", { name: "Privacy Notice" })).toBeInTheDocument();
    expect(screen.getByText("Information users provide")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Privacy Notice" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Complete sign up" })).toBeInTheDocument();
    expect(mocks.signUp).not.toHaveBeenCalled();
  });
});

