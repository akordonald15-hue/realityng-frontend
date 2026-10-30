import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";

import { ManagementDemo } from "./management-demo";

vi.mock("@/lib/api/client", () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/providers/auth-provider", () => ({ useAuth: vi.fn() }));
const dashboard = { notice: "DEMO PAYMENT — NO MONEY CHARGED", policy: "PROPOSED", role: "owner", packages: [{ code: "starter", amount_minor: 250000, credits: 1, valid_days: 90 }], premium: [], listings: [], orders: [], lots: [] };

describe("isolated management demo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, isLoading: false, signIn: vi.fn(), signOut: vi.fn() } as unknown as ReturnType<typeof useAuth>);
    vi.mocked(apiClient.get).mockResolvedValue({ data: dashboard });
    vi.mocked(apiClient.post).mockResolvedValue({ data: dashboard });
  });
  it("always marks checkout as a proposed simulation without money", async () => {
    render(<ManagementDemo />);
    await screen.findByRole("button", { name: "Simulate starter checkout" });
    expect(screen.getByText("DEMO PAYMENT — NO MONEY CHARGED")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Simulate starter checkout" }));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith("/management-demo/", expect.objectContaining({ product: "starter", action: "checkout", key: expect.any(String) })));
  });
  it("retries an uncertain action using the same idempotency key", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("uncertain"));
    render(<ManagementDemo />);
    fireEvent.click(await screen.findByRole("button", { name: "Simulate starter checkout" }));
    fireEvent.click(await screen.findByRole("button", { name: "Retry same request" }));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(2));
    expect(vi.mocked(apiClient.post).mock.calls[0][1]).toEqual(vi.mocked(apiClient.post).mock.calls[1][1]);
  });
  it("does not expose publisher controls to an artisan", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { ...dashboard, role: "artisan" } });
    render(<ManagementDemo />);
    await screen.findByText("artisan");
    expect(screen.queryByRole("button", { name: /starter checkout/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create demo draft" })).not.toBeInTheDocument();
  });
  it("shows an accessible access failure without exposing payment controls", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("forbidden"));
    render(<ManagementDemo />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Demo access unavailable");
    expect(screen.queryByRole("button", { name: /checkout/ })).not.toBeInTheDocument();
  });
});
