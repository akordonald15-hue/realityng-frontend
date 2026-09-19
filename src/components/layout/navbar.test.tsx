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

  it("shows task-based marketplace navigation on desktop", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    expect(screen.getAllByRole("link", { name: "RealityNG home" })).toHaveLength(1);
    expect(screen.getAllByText("For Rent").length).toBeGreaterThan(0);
    expect(screen.getAllByText("For Sale").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "For Professionals" })[0]).toHaveAttribute(
      "href",
      "/for-professionals",
    );
    expect(screen.getAllByRole("link", { name: "Services" })[0]).toHaveAttribute(
      "href",
      "/services",
    );
    await user.hover(screen.getByRole("button", { name: /Company/i }));
    expect(screen.getByRole("menuitem", { name: "Verification standards" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Safety" })).toBeInTheDocument();
  });

  it("opens the compact mobile navigation without showing the tagline there", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Toggle navigation" }));

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Properties" })).toHaveAttribute("href", "/properties");
    expect(document.body.style.overflow).toBe("hidden");
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(document.body.style.overflow).toBe("");
    expect(screen.queryByText("Where Dreams Find an Address")).not.toBeInTheDocument();
  });

  it("can render the opt-in Reality navigation without changing the default shell", async () => {
    const user = userEvent.setup();
    render(<Navbar variant="reality" />);

    expect(screen.getAllByRole("link", { name: "For Professionals" })[0]).toHaveAttribute(
      "href",
      "/for-professionals",
    );
    expect(screen.getAllByRole("link", { name: "Services" })[0]).toHaveAttribute(
      "href",
      "/services",
    );
    expect(screen.getAllByRole("link", { name: "Get Started" })[0]).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getAllByText("For Rent").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Toggle navigation" }));

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Properties" })).toHaveAttribute("href", "/properties");
  });

  it("keeps only one desktop Reality dropdown open while switching menus", async () => {
    const user = userEvent.setup();
    render(<Navbar variant="reality" />);

    const rent = screen.getByRole("button", { name: /For Rent/i });
    const sale = screen.getByRole("button", { name: /For Sale/i });
    const company = screen.getByRole("button", { name: /Company/i });

    await user.hover(rent);

    expect(rent).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menuitem", { name: "Homes for rent" })).toBeVisible();
    expect(screen.queryByRole("menuitem", { name: "Homes for sale" })).not.toBeInTheDocument();

    await user.hover(sale);

    expect(rent).toHaveAttribute("aria-expanded", "false");
    expect(sale).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByRole("menuitem", { name: "Homes for rent" })).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Homes for sale" })).toBeVisible();

    await user.hover(company);

    expect(sale).toHaveAttribute("aria-expanded", "false");
    expect(company).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByRole("menuitem", { name: "Homes for sale" })).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "About RealityNG" })).toBeVisible();

    const openMenus = screen.getAllByRole("menu");
    expect(openMenus).toHaveLength(1);

    await user.keyboard("{Escape}");

    expect(company).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menuitem", { name: "About RealityNG" })).not.toBeInTheDocument();
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

