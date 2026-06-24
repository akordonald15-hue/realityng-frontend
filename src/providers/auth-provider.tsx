"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getCurrentUser, loginUser, logoutUser, registerUser } from "@/lib/api/auth";
import { getRoleDashboardPath } from "@/lib/auth/permissions";
import { clearTokens, getRefreshToken, setTokens } from "@/lib/auth/token-storage";
import type { LoginPayload, RegisterPayload } from "@/lib/api/auth";
import type { User } from "@/lib/auth/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  signIn: (payload: LoginPayload, redirectTo?: string) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<User>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signIn = useCallback(
    async (payload: LoginPayload, redirectTo?: string) => {
      const response = await loginUser(payload);
      setTokens(response.access, response.refresh);
      setUser(response.user);
      router.push(redirectTo || getRoleDashboardPath(response.user));
    },
    [router],
  );

  const signUp = useCallback(async (payload: RegisterPayload) => registerUser(payload), []);

  const signOut = useCallback(async () => {
    const refresh = getRefreshToken();
    try {
      if (refresh) {
        await logoutUser(refresh);
      }
    } finally {
      clearTokens();
      setUser(null);
      router.push("/auth/sign-in");
    }
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      refreshSession,
      signIn,
      signUp,
      signOut,
      setUser,
    }),
    [isLoading, refreshSession, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
