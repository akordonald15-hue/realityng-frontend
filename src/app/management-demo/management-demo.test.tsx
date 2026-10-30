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
    expect(await screen.findByRole("alert")).toHaveTextContent("Beta demo is disabled");
    expect(screen.queryByRole("button", { name: /checkout/ })).not.toBeInTheDocument();
  });
  it("requires password rotation before exposing workflows and never retains password retries", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { ...dashboard, require_password_change: true } });
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("invalid"));
    render(<ManagementDemo />);
    fireEvent.change(await screen.findByLabelText("Current password"), { target: { value: "synthetic-current" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "synthetic-new-strong" } });
    expect(screen.queryByRole("button", { name: /starter checkout/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Change beta password" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Password change failed");
    expect(screen.queryByRole("button", { name: "Retry same request" })).not.toBeInTheDocument();
  });
  it("removes controls and retry intent immediately after server-side disable", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({ response: { status: 403 } });
    render(<ManagementDemo />);
    fireEvent.click(await screen.findByRole("button", { name: "Simulate starter checkout" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("disabled or your access was revoked");
    expect(screen.queryByRole("button", { name: /starter checkout/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry same request" })).not.toBeInTheDocument();
  });
  it("offers customer messaging only for scoped synthetic listings", async () => {
    const listing = { id: "synthetic-id", title: "Synthetic home", state: "published", participant_id: 7, assigned_agent_id: 8, expires_at: "2026-12-01T00:00:00Z", premium_until: null, needs_review: false };
    vi.mocked(apiClient.get).mockResolvedValue({ data: { ...dashboard, role: "customer", member_id: 9, listings: [listing], threads: [{ id: "synthetic-thread", demo_binding__listing__title: "Synthetic home" }] } });
    render(<ManagementDemo />);
    fireEvent.click(await screen.findByRole("button", { name: "Message synthetic agent" }));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith("/management-demo/", { action: "start-conversation", listing_id: "synthetic-id", target: "agent" }));
    // The link stays inside the fenced demo rather than the real customer dashboard.
    vi.mocked(apiClient.get).mockResolvedValue({ data: dashboard });
  });
  it("displays private conversation links and no production-admin controls", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { ...dashboard, role: "admin", threads: [{ id: "synthetic-thread", demo_binding__listing__title: "Synthetic home" }] } });
    render(<ManagementDemo />);
    expect(await screen.findByText(/no production administrator privileges/)).toBeVisible();
    expect(screen.getByRole("link", { name: /Synthetic home/ })).toHaveAttribute("href", "/management-demo/messages/synthetic-thread");
    expect(screen.queryByRole("button", { name: /checkout/ })).not.toBeInTheDocument();
  });
});
