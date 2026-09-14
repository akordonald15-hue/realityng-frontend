import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NotificationBell } from "@/components/layout/notification-bell";

const mocks = vi.hoisted(() => ({
  listNotifications: vi.fn(),
}));

vi.mock("@/providers/auth-provider", () => ({
  useOptionalAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("@/hooks/use-notification-socket", () => ({
  useNotificationSocket: () => undefined,
}));

vi.mock("@/lib/api/notifications", () => ({
  getUnreadNotificationCount: () => Promise.resolve(0),
  listNotifications: () => mocks.listNotifications(),
  markNotificationRead: (id: string) => Promise.resolve({ id, is_read: true }),
}));

describe("NotificationBell", () => {
  it("renders the customer Reality dropdown without legacy action colors", async () => {
    mocks.listNotifications.mockResolvedValueOnce([]);

    render(<NotificationBell variant="reality" />);

    expect(screen.getByLabelText("Notifications")).toHaveClass("text-reality-text-tertiary");
    expect(screen.getByText("No notifications yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toHaveClass("hover:underline");
    expect(screen.getByText("Notifications").closest("div")).toHaveClass(
      "text-reality-text-primary",
    );
  });
});

