"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FormMessage } from "@/components/forms/form-message";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRoles, requestRole } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/providers/auth-provider";

export default function RoleSetupPage() {
  const { refreshSession, user } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [nextPath, setNextPath] = useState("/dashboard");
  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: getRoles });
  const mutation = useMutation({
    mutationFn: requestRole,
    onSuccess: async (userRole) => {
      setError("");
      setMessage(
        userRole.status === "approved"
          ? `${userRole.role.name} role approved.`
          : `${userRole.role.name} role requested and awaiting approval.`,
      );
      await refreshSession();
    },
    onError: (err) => {
      setMessage("");
      setError(getApiErrorMessage(err));
    },
  });

  const ownedRoleNames = new Set(user?.roles.map((role) => role.role.name) ?? []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedRole(params.get("role") ?? "");
    const requestedNext = params.get("next");
    if (requestedNext?.startsWith("/") && !requestedNext.startsWith("//")) {
      setNextPath(requestedNext);
    }
  }, []);

  const publicRoles = rolesQuery.data?.filter(
    (role) => role.name !== "admin" && role.name !== "super_admin",
  );

  return (
    <ProtectedRoute>
      <main className="min-h-[calc(100svh-5.5rem)] bg-reality-canvas px-5 py-10 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-reality-brand-600">
          Professional setup
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-medium leading-tight text-reality-text-primary sm:text-5xl">
          Choose how you work with RealityNG
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-reality-text-secondary">
          Your standard account already supports browsing, saving, inquiries, viewings, and
          applications. Request an additional role only when you need professional tools.
        </p>
        {selectedRole ? (
          <div className="mt-6 rounded-reality border border-reality-brand-200 bg-reality-surfaceBrand px-5 py-4 text-reality-text-secondary">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-reality-brand-600">
              Suggested role
            </p>
            <p className="mt-1 capitalize text-reality-text-primary">
              Continue with {selectedRole.replace("_", " ")} or choose another role below.
            </p>
          </div>
        ) : null}
        <div className="mt-6 space-y-3">
          <FormMessage tone="success">{message}</FormMessage>
          <FormMessage tone="error">{error}</FormMessage>
        </div>
        {rolesQuery.isError ? (
          <div className="mt-8 rounded-reality border border-red-200 bg-red-50 p-5" role="alert">
            <h2 className="font-semibold text-red-900">Roles could not be loaded</h2>
            <p className="mt-1 text-sm text-red-800">Check your connection and try again.</p>
            <Button
              className="mt-4"
              onClick={() => void rolesQuery.refetch()}
              variant="realitySecondary"
            >
              Try again
            </Button>
          </div>
        ) : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {publicRoles?.map((role) => {
            const alreadyRequested = ownedRoleNames.has(role.name);
            return (
              <Card
                className={
                  role.name === selectedRole
                    ? "border-reality-brand-300 bg-reality-surfaceBrand p-5 shadow-reality-sm"
                    : "bg-reality-surface p-5"
                }
                key={role.id}
              >
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                  <div>
                    <h2 className="text-lg font-semibold capitalize text-reality-text-primary">
                      {role.name.replace("_", " ")}
                    </h2>
                    <p className="mt-1 text-sm text-reality-text-secondary">{role.description}</p>
                    <p className="mt-3 text-sm font-medium text-reality-brand-600">
                      {role.approval_required ? "Approval required" : "Available immediately"}
                    </p>
                  </div>
                  <Button
                    disabled={alreadyRequested || mutation.isPending}
                    onClick={() => mutation.mutate(role.name)}
                  >
                    {alreadyRequested ? "Selected" : "Request"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        {rolesQuery.isLoading ? (
          <div aria-live="polite" className="mt-8 grid gap-4 sm:grid-cols-2" role="status">
            <span className="sr-only">Loading roles</span>
            {[0, 1, 2, 3].map((item) => (
              <div
                aria-hidden="true"
                className="h-36 animate-pulse rounded-reality border border-reality-border-secondary bg-reality-surfaceMuted"
                key={item}
              />
            ))}
          </div>
        ) : null}
        <div className="mt-8 border-t border-reality-border-secondary pt-6">
          <Link className={buttonClasses("reality")} href={nextPath}>
            {nextPath === "/dashboard" ? "Continue to dashboard" : "Continue to your next step"}
          </Link>
        </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
