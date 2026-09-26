import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RealityAuthFlow } from "@/components/auth/reality-auth-flow";

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ signIn: mocks.signIn, signUp: mocks.signUp }),
  useOptionalAuth: () => null,
}));

async function openSignUpForm(user: ReturnType<typeof userEvent.setup>) {
  render(<RealityAuthFlow mode="sign-up" />);
  // the flow asks for an email first, then reveals the rest of the form
  await user.type(screen.getByLabelText(/email/i), "qa@example.test");
  const next = screen.getByRole("button", { name: /continue|next|sign up/i });
  await user.click(next);
}

describe("sign-up phone field", () => {
  beforeEach(() => {
    mocks.signUp.mockReset();
    mocks.signIn.mockReset();
  });

  it("uses telephone input affordances", async () => {
    const user = userEvent.setup();
    await openSignUpForm(user);

    const phone = await screen.findByLabelText("Phone");
    expect(phone).toHaveAttribute("type", "tel");
    expect(phone).toHaveAttribute("inputmode", "tel");
    expect(phone).toHaveAttribute("autocomplete", "tel");
    expect(phone).toHaveAttribute("placeholder", "08031234567");
  });

  it("rejects a malformed Nigerian number before submitting", async () => {
    const user = userEvent.setup();
    await openSignUpForm(user);

    const phone = await screen.findByLabelText("Phone");
    await user.type(phone, "0803123");
    await user.tab();

    const submit = screen.getByRole("button", { name: /continue/i });
    await user.click(submit);

    expect(await screen.findByText(/Nigerian mobile number/i)).toBeInTheDocument();
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("accepts a valid Nigerian number", async () => {
    const user = userEvent.setup();
    await openSignUpForm(user);

    const phone = await screen.findByLabelText("Phone");
    await user.type(phone, "08031234567");
    await user.tab();

    expect(screen.queryByText(/Nigerian mobile number/i)).not.toBeInTheDocument();
  });
});
