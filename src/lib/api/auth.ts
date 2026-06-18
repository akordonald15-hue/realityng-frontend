import { apiClient } from "@/lib/api/client";
import type { AuthTokens, Role, User, UserRole } from "@/lib/auth/types";

export type RegisterPayload = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string | null;
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
  const response = await apiClient.post<User>("/auth/register/", payload);
  return response.data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthTokens & { user: User }> {
  const response = await apiClient.post<AuthTokens & { user: User }>("/auth/login/", payload);
  return response.data;
}

export async function logoutUser(refresh: string): Promise<void> {
  await apiClient.post("/auth/logout/", { refresh });
}

export async function forgotPassword(email: string): Promise<{ status: string }> {
  const response = await apiClient.post<{ status: string }>("/auth/forgot-password/", { email });
  return response.data;
}

export async function resetPassword(payload: { uid: string; token: string; password: string }): Promise<{ status: string }> {
  const response = await apiClient.post<{ status: string }>("/auth/reset-password/", payload);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/users/me/");
  return response.data;
}

export async function updateCurrentUser(payload: UpdateUserPayload): Promise<User> {
  const response = await apiClient.patch<User>("/users/me/", payload);
  return response.data;
}

export async function getRoles(): Promise<Role[]> {
  const response = await apiClient.get<{ results?: Role[] } | Role[]>("/roles/");
  return Array.isArray(response.data) ? response.data : response.data.results ?? [];
}

export async function requestRole(role: string): Promise<UserRole> {
  const response = await apiClient.post<UserRole>("/roles/request/", { role });
  return response.data;
}
