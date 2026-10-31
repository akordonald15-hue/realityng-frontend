import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListingPayments } from "./listing-payments";
import { NativeBetaGate } from "./native-beta-gate";

const mocks = vi.hoisted(() => ({ get: vi.fn(), command: vi.fn(), user: { id: "synthetic-owner", is_beta_test_account: true, beta_native_enabled: true } }));
vi.mock("@/providers/auth-provider", () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock("@/lib/api/beta-listing-payments", () => ({ getBetaPayments: mocks.get, betaCommand: mocks.command }));
const state = { notice: "DEMO PAYMENT — NO MONEY CHARGED", role: "owner", member_id: 1, require_password_change: false, packages: [{ code: "starter", amount_minor: 250000, credits: 1, valid_days: 90 }], premium: [], orders: [], lots: [], listings: [], agents: [] };
function mount(content: React.ReactNode) { return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>{content}</QueryClientProvider>); }
beforeEach(() => { vi.clearAllMocks(); mocks.get.mockResolvedValue(state); });
describe("native synthetic workflows", () => {
  it("shows simulation notice in the listing-payment screen and reuses an uncertain intent", async () => {
    mocks.command.mockRejectedValueOnce(new Error("Uncertain connection")).mockResolvedValueOnce(state);
    mount(<ListingPayments />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Simulate starter purchase" }));
    expect(screen.getByRole("note")).toHaveTextContent("DEMO PAYMENT — NO MONEY CHARGED");
    const intent = mocks.command.mock.calls[0][0];
    expect(intent).toEqual({ action: "checkout", product: "starter", key: expect.any(String) });
    await user.click(await screen.findByRole("button", { name: "Retry same request" }));
    expect(mocks.command.mock.calls[1][0]).toEqual(intent);
    expect(screen.queryByText("RealityNG management demo")).not.toBeInTheDocument();
  });
  it("requires first-use password change before mounting native child screens", async () => {
    mocks.get.mockResolvedValue({ ...state, require_password_change: true });
    mocks.command.mockResolvedValue(state);
    mount(<NativeBetaGate><p>Normal dashboard content</p></NativeBetaGate>);
    expect(screen.queryByText("Normal dashboard content")).not.toBeInTheDocument();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Current password"), "Synthetic-old!");
    await user.type(screen.getByLabelText("New password"), "Synthetic-new-password!");
    await user.click(screen.getByRole("button", { name: "Change password" }));
    expect(await screen.findByText("Normal dashboard content")).toBeVisible();
    expect(mocks.command).toHaveBeenCalledWith({ action: "change-password", current_password: "Synthetic-old!", new_password: "Synthetic-new-password!" });
  });
  it("fails closed when the runtime access check fails", async () => {
    mocks.get.mockRejectedValue(new Error("Access revoked"));
    mount(<NativeBetaGate><p>Private dashboard</p></NativeBetaGate>);
    expect(await screen.findByRole("alert")).toHaveTextContent("disabled, expired or unavailable");
    await waitFor(() => expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument());
  });
});
