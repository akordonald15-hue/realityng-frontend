import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import AdminVerificationsPage from "@/app/(admin)/admin/verifications/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  listAdminVerificationRequests: vi.fn(),
  listAdminPropertyVerifications: vi.fn(),
  performVerificationAction: vi.fn(),
  performPropertyVerificationAction: vi.fn(),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/api/admin-verification", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/admin-verification")>(
    "@/lib/api/admin-verification",
  );
  return {
    ...actual,
    listAdminVerificationRequests: (...args: unknown[]) =>
      mocks.listAdminVerificationRequests(...args),
    listAdminPropertyVerifications: (...args: unknown[]) =>
      mocks.listAdminPropertyVerifications(...args),
    performVerificationAction: (...args: unknown[]) =>
      mocks.performVerificationAction(...args),
    performPropertyVerificationAction: (...args: unknown[]) =>
      mocks.performPropertyVerificationAction(...args),
  };
});

describe("AdminVerificationsPage", () => {
  it("renders pending requests and approves one", async () => {
    mocks.listAdminVerificationRequests.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: "req-1",
          verification_type: "artisan",
          business_name: "Ada Repairs",
          cac_registration_number: "RC123",
          trade_category: "Plumbing",
          years_experience: 3,
          phone_number: "08000000000",
          contact_address: "1 Test Street",
          city: "Lagos",
          status: "pending",
          submitted_at: "2026-07-01T00:00:00Z",
        },
      ],
    });
    mocks.listAdminPropertyVerifications.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
    mocks.performVerificationAction.mockResolvedValue({});

    renderWithQueryClient(<AdminVerificationsPage />);

    expect(await screen.findByText("Ada Repairs")).toBeInTheDocument();
    expect(screen.getByText("No property verification requests yet.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => {
      expect(mocks.performVerificationAction).toHaveBeenCalledWith("req-1", "approve", {});
    });
  });

  it("sends backend decision fields when rejecting a request", async () => {
    vi.spyOn(window, "prompt").mockReturnValue("Document is unreadable");
    mocks.listAdminVerificationRequests.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: "req-2",
          verification_type: "agent",
          business_name: "Prime Realty",
          cac_registration_number: "RC456",
          trade_category: "",
          years_experience: null,
          phone_number: "08000000001",
          contact_address: "2 Test Street",
          city: "Abuja",
          status: "pending",
          submitted_at: "2026-07-01T00:00:00Z",
        },
      ],
    });
    mocks.listAdminPropertyVerifications.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
    mocks.performVerificationAction.mockResolvedValue({});

    renderWithQueryClient(<AdminVerificationsPage />);

    await screen.findByText("Prime Realty");
    await userEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() => {
      expect(mocks.performVerificationAction).toHaveBeenCalledWith("req-2", "reject", {
        rejection_reason: "Document is unreadable",
        review_notes: "Document is unreadable",
      });
    });
  });

  it("shows an empty state when there are no requests", async () => {
    mocks.listAdminVerificationRequests.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
    mocks.listAdminPropertyVerifications.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });

    renderWithQueryClient(<AdminVerificationsPage />);

    expect(
      await screen.findByText("No business or artisan verification requests yet."),
    ).toBeInTheDocument();
    expect(screen.getByText("No property verification requests yet.")).toBeInTheDocument();
  });
});
