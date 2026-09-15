import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { ProtectedActionLink } from "@/components/auth/protected-action-link";
import { RealityAuthModalProvider } from "@/components/auth/reality-auth-modal";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/providers/auth-provider", () => ({ useOptionalAuth: () => ({ isAuthenticated: false }) }));
vi.mock("@/components/auth/reality-auth-flow", () => ({
  RealityAuthFlow: () => <div><div data-legal-dialog>Legal document</div><button type="button">Cancel</button></div>,
}));

it("does not close the parent auth popup while a legal document handles Escape", async () => {
  const user = userEvent.setup();
  render(
    <RealityAuthModalProvider>
      <ProtectedActionLink actionLabel="list" href="/properties/new">Get started</ProtectedActionLink>
    </RealityAuthModalProvider>,
  );

  await user.click(screen.getByRole("link", { name: "Get started" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
