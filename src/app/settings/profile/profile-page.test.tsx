import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ProfilePage from "@/app/settings/profile/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  setUser: vi.fn(),
  updateCurrentUser: vi.fn(),
  user: {
    first_name: "Ada",
    last_name: "Okafor",
    phone_number: "",
    profile: {
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
  },
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
  it("updates profile details", async () => {
    const user = userEvent.setup();
    mocks.updateCurrentUser.mockResolvedValueOnce({ id: "user-1", first_name: "Ada", profile: {} });

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
    expect(await screen.findByText("Profile updated.")).toBeInTheDocument();
  });
});
