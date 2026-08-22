import { apiClient } from "@/lib/api/client";
import { USE_MOCKS } from "@/lib/demo-mode";
import type { AuthTokens, Role, User, UserRole } from "@/lib/auth/types";
import {
  mockGetCurrentUser,
  mockGetRoles,
  mockLoginUser,
  mockLogoutUser,
  mockRegisterUser,
  mockRequestRole,
  mockUpdateCurrentUser,
} from "@/mocks/mock-auth";

export type RegisterPayload = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string | null;
  accepts_terms: boolean;
  accepts_privacy: boolean;
  terms_version: string;
  privacy_version: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UpdateUserPayload = {
  first_name?: string;
  last_name?: string;
  phone_number?: string | null;
  profile?: {
    bio?: string;
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    date_of_birth?: string | null;
    gender?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  };
};

export async function registerUser(payload: RegisterPayload): Promise<User> {
  if (USE_MOCKS) {
    return mockRegisterUser(payload);
  }
  const response = await apiClient.post<User>("/auth/register/", payload);
  return response.data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthTokens & { user: User }> {
  if (USE_MOCKS) {
    return mockLoginUser(payload);
  }
  const response = await apiClient.post<AuthTokens & { user: User }>("/auth/login/", payload);
  return response.data;
}

export async function logoutUser(refresh: string): Promise<void> {
  if (USE_MOCKS) {
    await mockLogoutUser();
    return;
  }
  await apiClient.post("/auth/logout/", { refresh });
}

export async function forgotPassword(email: string): Promise<{ status: string }> {
  if (USE_MOCKS) {
    return { status: `Demo reset instructions prepared for ${email}.` };
  }
  const response = await apiClient.post<{ status: string }>("/auth/forgot-password/", { email });
  return response.data;
}

export async function resetPassword(payload: {
  uid: string;
  token: string;
  password: string;
}): Promise<{ status: string }> {
  if (USE_MOCKS) {
    return { status: "Demo password reset complete." };
  }
  const response = await apiClient.post<{ status: string }>("/auth/reset-password/", payload);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  if (USE_MOCKS) {
    return mockGetCurrentUser();
  }
  const response = await apiClient.get<User>("/users/me/");
  return response.data;
}

export async function updateCurrentUser(payload: UpdateUserPayload): Promise<User> {
  if (USE_MOCKS) {
    return mockUpdateCurrentUser(payload);
  }
  const response = await apiClient.patch<User>("/users/me/", payload);
  return response.data;
}

export async function getRoles(): Promise<Role[]> {
  if (USE_MOCKS) {
    return mockGetRoles();
  }
  const response = await apiClient.get<{ results?: Role[] } | Role[]>("/roles/");
  return Array.isArray(response.data) ? response.data : (response.data.results ?? []);
}

export async function requestRole(role: string): Promise<UserRole> {
  if (USE_MOCKS) {
    return mockRequestRole(role);
  }
  const response = await apiClient.post<UserRole>("/roles/request/", { role });
  return response.data;
}
