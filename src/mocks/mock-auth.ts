import type { LoginPayload, RegisterPayload, UpdateUserPayload } from "@/lib/api/auth";
import type { AuthTokens, User, UserRole } from "@/lib/auth/types";
import { findMockUserByEmail, findMockUserById, mockBuyers, mockRoles } from "@/mocks/mock-users";

const MOCK_SESSION_KEY = "realityng.mockSessionUserId";
const DEMO_PASSWORD = "password123";
const MOCK_PASSWORD_PREFIX = "realityng.mockPassword.";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function saveMockUser(user: User) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(`realityng.mockUser.${user.id}`, JSON.stringify(user));
  window.localStorage.setItem(`realityng.mockUserEmail.${user.email.toLowerCase()}`, user.id);
}

function getStoredMockUser(id: string): User | null {
  if (!canUseStorage()) {
    return null;
  }
  const raw = window.localStorage.getItem(`realityng.mockUser.${id}`);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function getMockSessionUser(): User | null {
  if (!canUseStorage()) {
    return null;
  }
  const userId = window.localStorage.getItem(MOCK_SESSION_KEY);
  if (!userId) {
    return null;
  }
  return getStoredMockUser(userId) ?? findMockUserById(userId) ?? null;
}

export function clearMockSession() {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(MOCK_SESSION_KEY);
}

export async function mockLoginUser(payload: LoginPayload): Promise<AuthTokens & { user: User }> {
  const storedUserId = canUseStorage()
    ? window.localStorage.getItem(`realityng.mockUserEmail.${payload.email.toLowerCase()}`)
    : null;
  const user =
    (storedUserId ? getStoredMockUser(storedUserId) : null) ?? findMockUserByEmail(payload.email);
  const storedPassword = canUseStorage()
    ? window.localStorage.getItem(`${MOCK_PASSWORD_PREFIX}${payload.email.toLowerCase()}`)
    : null;
  if (!user || payload.password !== (storedPassword ?? DEMO_PASSWORD)) {
    throw new Error("Invalid demo credentials.");
  }

  if (canUseStorage()) {
    saveMockUser(user);
    window.localStorage.setItem(MOCK_SESSION_KEY, user.id);
  }

  return {
    access: `mock-access-${user.id}`,
    refresh: `mock-refresh-${user.id}`,
    user,
  };
}

export async function mockRegisterUser(payload: RegisterPayload): Promise<User> {
  const buyerRole = mockRoles.find((role) => role.name === "buyer") ?? mockBuyers[0].roles[0].role;
  const firstName = payload.first_name || "Demo";
  const lastName = payload.last_name || "Buyer";
  const user: User = {
    id: `buyer-demo-${Date.now()}`,
    email: payload.email,
    phone_number: payload.phone_number ?? null,
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    is_email_verified: true,
    is_phone_verified: Boolean(payload.phone_number),
    is_active: true,
    is_suspended: false,
    last_login_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile: {
      avatar_url:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=320&q=80",
      bio: "New demo buyer exploring RealityNG properties.",
      country: "Nigeria",
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
        id: `buyer-demo-role-${Date.now()}`,
        role: buyerRole,
        status: "approved",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };
  saveMockUser(user);
  if (canUseStorage()) {
    window.localStorage.setItem(
      `${MOCK_PASSWORD_PREFIX}${payload.email.toLowerCase()}`,
      payload.password,
    );
  }
  return user;
}

export async function mockLogoutUser(): Promise<void> {
  clearMockSession();
}

export async function mockGetCurrentUser(): Promise<User> {
  const user = getMockSessionUser();
  if (!user) {
    throw new Error("No mock session.");
  }
  return user;
}

export async function mockUpdateCurrentUser(payload: UpdateUserPayload): Promise<User> {
  const user = await mockGetCurrentUser();
  const updated: User = {
    ...user,
    first_name: payload.first_name ?? user.first_name,
    last_name: payload.last_name ?? user.last_name,
    phone_number: payload.phone_number === undefined ? user.phone_number : payload.phone_number,
    full_name: `${payload.first_name ?? user.first_name} ${payload.last_name ?? user.last_name}`,
    updated_at: new Date().toISOString(),
    profile: {
      ...user.profile,
      ...payload.profile,
      avatar_url: user.profile.avatar_url,
    },
  };
  saveMockUser(updated);
  return updated;
}

export async function mockGetRoles() {
  return mockRoles;
}

export async function mockRequestRole(roleName: string): Promise<UserRole> {
  const role = mockRoles.find((item) => item.name === roleName);
  if (!role) {
    throw new Error("Demo role not found.");
  }
  return {
    id: `mock-role-request-${roleName}`,
    role,
    status: role.approval_required ? "pending" : "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
