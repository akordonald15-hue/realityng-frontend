import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ProfilePage from "@/app/settings/profile/page";
import { renderWithQueryClient } from "@/test/render";
import type { User } from "@/lib/auth/types";

const mocks = vi.hoisted(() => ({
  setUser: vi.fn(),
  updateCurrentUser: vi.fn(),
  user: {
    id: "user-1",
    email: "ada@example.test",
    first_name: "Ada",
    last_name: "Okafor",
    full_name: "Ada Okafor",
    phone_number: "",
    is_email_verified: true,
    is_phone_verified: false,
    is_active: true,
    is_suspended: false,
    last_login_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    profile: {
      avatar_url: null,
      bio: "",
      country: "",
      state: "",
      city: "",
      address: "",
      date_of_birth: null,
      gender: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
    },
    roles: [{ id: "role-1", role: { id: "r1", name: "buyer", description: "", created_at: "", approval_required: false }, status: "approved", created_at: "", updated_at: "" }],
  } as User,
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/layout/navbar", () => ({
  Navbar: () => <nav aria-label="Primary">Navbar</nav>,
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    setUser: mocks.setUser,
    user: mocks.user,
  }),
}));

vi.mock("@/lib/api/auth", () => ({
  updateCurrentUser: (payload: unknown) => mocks.updateCurrentUser(payload),
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    mocks.setUser.mockClear();
    mocks.updateCurrentUser.mockReset();
    mocks.user = {
      id: "user-1",
      email: "ada@example.test",
      first_name: "Ada",
      last_name: "Okafor",
      full_name: "Ada Okafor",
      phone_number: "",
      is_email_verified: true,
      is_phone_verified: false,
      is_active: true,
      is_suspended: false,
      last_login_at: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      profile: {
        avatar_url: null,
        bio: "",
        country: "",
        state: "",
        city: "",
        address: "",
        date_of_birth: null,
        gender: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
      },
      roles: [
        {
          id: "role-1",
          role: {
            id: "r1",
            name: "buyer",
            description: "",
            created_at: "",
            approval_required: false,
          },
          status: "approved",
          created_at: "",
          updated_at: "",
        },
      ],
    };
  });

  it("renders existing user values and read-only unsupported controls", async () => {
    renderWithQueryClient(<ProfilePage />);

    expect(await screen.findByRole("heading", { name: "Account Settings" })).toBeInTheDocument();
    expect(screen.getByText("ada@example.test")).toBeInTheDocument();
    expect(screen.getByText("Buyer approved")).toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toHaveValue("Ada");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /upload/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it("updates profile details, refreshes auth state, and disables save after success", async () => {
    const user = userEvent.setup();
    const updatedUser = {
      ...mocks.user,
      profile: { ...mocks.user.profile, city: "Lagos" },
    };
    mocks.updateCurrentUser.mockResolvedValueOnce(updatedUser);

    renderWithQueryClient(<ProfilePage />);

    await user.clear(await screen.findByLabelText("City"));
    await user.type(screen.getByLabelText("City"), "Lagos");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(mocks.updateCurrentUser).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: expect.objectContaining({ city: "Lagos" }),
        }),
      ),
    );
    expect(mocks.setUser).toHaveBeenCalledWith(updatedUser);
    expect(await screen.findByText("Profile updated.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });

  it("shows backend errors without discarding entered values", async () => {
    const user = userEvent.setup();
    mocks.updateCurrentUser.mockRejectedValueOnce(new Error("Phone number is already in use."));

    renderWithQueryClient(<ProfilePage />);

    await user.type(await screen.findByLabelText("Phone number"), "+2348012345678");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone number")).toHaveValue("+2348012345678");
    expect(mocks.setUser).not.toHaveBeenCalled();
  });

  it("presents approved agent profile status without exposing role editing", async () => {
    mocks.user = {
      ...mocks.user,
      roles: [
        {
          id: "role-agent",
          role: {
            id: "agent",
            name: "agent",
            description: "",
            created_at: "",
            approval_required: true,
          },
          status: "approved",
          created_at: "",
          updated_at: "",
        },
      ],
    };

    renderWithQueryClient(<ProfilePage />);

    expect(await screen.findByText("Agent approved")).toBeInTheDocument();
    expect(screen.queryByLabelText(/role/i)).not.toBeInTheDocument();
  });

  it("presents landlord and pending verification states from real roles", async () => {
    mocks.user = {
      ...mocks.user,
      is_email_verified: false,
      roles: [
        {
          id: "role-landlord",
          role: {
            id: "landlord",
            name: "landlord",
            description: "",
            created_at: "",
            approval_required: false,
          },
          status: "pending",
          created_at: "",
          updated_at: "",
        },
      ],
    };

    renderWithQueryClient(<ProfilePage />);

    expect(await screen.findByText("Verification pending")).toBeInTheDocument();
    expect(screen.getByText("Landlord pending")).toBeInTheDocument();
  });
});

