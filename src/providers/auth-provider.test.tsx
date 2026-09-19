import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ANONYMOUS_SHORTLIST_KEY, readAnonymousShortlist, toggleAnonymousSave } from "@/lib/anonymous-shortlist";
import { clearTokens } from "@/lib/auth/token-storage";
import { AuthProvider, useAuth } from "@/providers/auth-provider";

const mocks = vi.hoisted(() => ({
  createFavorite: vi.fn(),
  getCurrentUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/lib/api/auth", () => ({
  getCurrentUser: () => mocks.getCurrentUser(),
  loginUser: () => mocks.loginUser(),
  logoutUser: () => mocks.logoutUser(),
  registerUser: vi.fn(),
}));
vi.mock("@/lib/api/properties", () => ({ createFavorite: (id: string) => mocks.createFavorite(id) }));

function Controls() {
  const auth = useAuth();
  return <>
    <button onClick={() => void auth.signIn({ email: "qa@example.com", password: "test" })}>Sign in</button>
    <button onClick={() => void auth.signOut()}>Sign out</button>
    <span>{auth.isLoading ? "Loading" : auth.isAuthenticated ? "Authenticated" : "Guest"}</span>
  </>;
}

describe("AuthProvider shortlist lifecycle", () => {
  beforeEach(() => {
    clearTokens();
    localStorage.removeItem(ANONYMOUS_SHORTLIST_KEY);
    vi.clearAllMocks();
    mocks.getCurrentUser.mockRejectedValue(new Error("No session"));
    mocks.loginUser.mockResolvedValue({ access: "access", refresh: "refresh", user: { id: "buyer", roles: [{ role: { name: "buyer" }, status: "approved" }] } });
    mocks.logoutUser.mockResolvedValue(undefined);
    mocks.createFavorite.mockResolvedValue({});
  });

  it("merges after sign-in and does not copy account favorites to device on logout", async () => {
    toggleAnonymousSave("before-login");
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><AuthProvider><Controls /></AuthProvider></QueryClientProvider>);
    const user = userEvent.setup();
    await screen.findByText("Guest");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(mocks.createFavorite).toHaveBeenCalledWith("before-login"));
    await waitFor(() => expect(readAnonymousShortlist()).toEqual([]));
    toggleAnonymousSave("unrelated-pending");
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(await screen.findByText("Guest")).toBeInTheDocument();
    expect(readAnonymousShortlist().map((item) => item.property_id)).toEqual(["unrelated-pending"]);
  });
});
