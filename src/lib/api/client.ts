import axios from "axios";

import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/auth/token-storage";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const requestId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  config.headers["X-Request-ID"] = requestId;
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1"}/auth/token/refresh/`,
        { refresh },
      );
      setTokens(response.data.access, response.data.refresh ?? refresh);
      originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearTokens();
      return Promise.reject(refreshError);
    }
  },
);

export type ApiError = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
};
