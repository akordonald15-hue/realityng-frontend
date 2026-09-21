"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getCurrentUser, loginUser, loginWithGoogle, logoutUser, registerUser } from "@/lib/api/auth";
import { getRoleDashboardPath } from "@/lib/auth/permissions";
import { mergeAnonymousShortlist } from "@/lib/anonymous-shortlist";
import { clearTokens, getRefreshToken, setTokens } from "@/lib/auth/token-storage";
import type { GoogleAuthResponse, LoginPayload, RegisterPayload } from "@/lib/api/auth";
import type { AuthTokens, User } from "@/lib/auth/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  signIn: (payload: LoginPayload, redirectTo?: string | null) => Promise<void>;
  signInWithGoogle: (
    credential: string,
    redirectTo?: string | null,
  ) => Promise<GoogleAuthResponse>;
  signUp: (payload: RegisterPayload) => Promise<User>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reconcileShortlist = useCallback(() => {
    void mergeAnonymousShortlist().then(() => {
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["public-properties"] });
    }).catch(() => {
      // A shortlist storage failure must never invalidate an authenticated session.
    });
  }, [queryClient]);

  const refreshSession = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      reconcileShortlist();
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [reconcileShortlist]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  /**
   * Single place where a successful authentication becomes a session, so
   * password and Google sign-in cannot drift apart.
   */
  const establishSession = useCallback(
    (response: AuthTokens & { user: User }, redirectTo?: string | null) => {
      setTokens(response.access, response.refresh);
      setUser(response.user);
      reconcileShortlist();
      if (redirectTo !== null) {
        router.push(redirectTo || getRoleDashboardPath(response.user));
      }
    },
    [reconcileShortlist, router],
  );

  const signIn = useCallback(
    async (payload: LoginPayload, redirectTo?: string | null) => {
      establishSession(await loginUser(payload), redirectTo);
    },
    [establishSession],
  );

  const signInWithGoogle = useCallback(
    async (credential: string, redirectTo?: string | null) => {
      const response = await loginWithGoogle(credential);
      establishSession(response, redirectTo);
      return response;
    },
    [establishSession],
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
      signInWithGoogle,
      signUp,
      signOut,
      setUser,
    }),
    [isLoading, refreshSession, signIn, signInWithGoogle, signOut, signUp, user],
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
