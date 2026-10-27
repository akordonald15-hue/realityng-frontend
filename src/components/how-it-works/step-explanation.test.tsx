import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StepExplanation } from "@/components/how-it-works/step-explanation";

const auth = vi.hoisted(() => ({ requireAuth: vi.fn() }));
vi.mock("@/components/auth/reality-auth-modal", () => ({ useRealityAuthModal: () => auth }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("StepExplanation", () => {
  it("opens by keyboard, traps focus, locks scroll, closes on Escape and restores focus", async () => {
    const user = userEvent.setup();
    render(
      <StepExplanation
        className=""
        guide={{
          explanation: "Choose a listing first.",
          action: "Browse properties",
          href: "/properties",
        }}
        title="Inspect"
      >
        Inspect
      </StepExplanation>,
    );
    const trigger = screen.getByRole("button", { name: "Inspect" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog", { name: "Inspect" })).toHaveAccessibleDescription(
      "Choose a listing first.",
    );
    expect(document.body.style.overflow).toBe("hidden");
    const close = screen.getByRole("button", { name: "Close" });
    const next = screen.getByRole("link", { name: "Browse properties" });
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(next).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("closes the explanation before requesting existing protected authentication", async () => {
    const user = userEvent.setup();
    render(
      <StepExplanation
        className=""
        guide={{
          explanation: "Track existing records.",
          action: "Open my dashboard",
          href: "/dashboard",
          protected: true,
        }}
        title="Payment"
      >
        Payment
      </StepExplanation>,
    );
    await user.click(screen.getByRole("button", { name: "Payment" }));
    await user.click(screen.getByRole("link", { name: "Open my dashboard" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(auth.requireAuth).toHaveBeenCalledWith(
      expect.objectContaining({ nextPath: "/dashboard" }),
    );
  });
});
