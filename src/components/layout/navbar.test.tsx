import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Navbar } from "@/components/layout/navbar";

const authMocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  auth: null as unknown,
}));

vi.mock("@/providers/auth-provider", () => ({
  useOptionalAuth: () => authMocks.auth,
}));

vi.mock("@/components/layout/notification-bell", () => ({
  NotificationBell: () => <a href="/dashboard/notifications">Notifications</a>,
}));

describe("Navbar", () => {
  beforeEach(() => {
    authMocks.auth = null;
    authMocks.signOut.mockClear();
  });

  it("shows task-based marketplace navigation on desktop", () => {
    render(<Navbar />);

    expect(screen.getAllByRole("link", { name: "RealityNG home" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Buy" })[0]).toHaveAttribute(
      "href",
      "/properties?listing_type=sale",
    );
    expect(screen.getAllByRole("link", { name: "Rent" })[0]).toHaveAttribute(
      "href",
      "/properties?listing_type=rent",
    );
    expect(screen.getAllByRole("link", { name: "Shortlets" })[0]).toHaveAttribute(
      "href",
      "/properties?property_type=shortlet",
    );
    expect(screen.getAllByRole("link", { name: "Land" })[0]).toHaveAttribute(
      "href",
      "/properties?property_type=land",
    );
    expect(screen.getAllByRole("link", { name: "Commercial" })[0]).toHaveAttribute(
      "href",
      "/properties?property_type=commercial",
    );
    expect(screen.getAllByText("Verification standards").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Safety").length).toBeGreaterThan(0);
  });

  it("opens the compact mobile navigation without showing the tagline there", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Toggle navigation" }));

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getAllByText("Where Dreams Find an Address")).toHaveLength(1);
  });

  it("can render the opt-in Reality navigation without changing the default shell", async () => {
    const user = userEvent.setup();
    render(<Navbar variant="reality" />);

    expect(screen.getAllByRole("link", { name: "For Professionals" })[0]).toHaveAttribute(
      "href",
      "/services",
    );
    expect(screen.getAllByRole("link", { name: "Get Started" })[0]).toHaveAttribute(
      "href",
      "/auth/sign-up",
    );
    expect(screen.getAllByText("For Rent").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Toggle navigation" }));

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Homes for rent" })[0]).toHaveAttribute(
      "href",
      "/properties?listing_type=rent",
    );
  });

  it("renders authenticated Reality account navigation with existing sign-out behavior", async () => {
    const user = userEvent.setup();
    authMocks.auth = {
      isAuthenticated: true,
      isLoading: false,
      signOut: authMocks.signOut,
    };

    render(<Navbar variant="reality" />);

    expect(screen.getAllByRole("link", { name: "Notifications" })[0]).toHaveAttribute(
      "href",
      "/dashboard/notifications",
    );
    expect(screen.getAllByRole("link", { name: "Saved" })[0]).toHaveAttribute(
      "href",
      "/saved-properties",
    );

    await user.click(screen.getAllByText("Sign out")[0]);

    expect(authMocks.signOut).toHaveBeenCalledTimes(1);
  });
});
