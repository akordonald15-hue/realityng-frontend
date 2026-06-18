"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { getRoles, requestRole } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/providers/auth-provider";

export default function RoleSetupPage() {
  const { refreshSession, user } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-semibold text-ink">Choose your RealityNG roles</h1>
        <p className="mt-2 text-muted">Tenant, buyer, and landlord roles are approved immediately. Professional roles require admin review.</p>
        <div className="mt-6 space-y-3">
          <FormMessage tone="success">{message}</FormMessage>
          <FormMessage tone="error">{error}</FormMessage>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {rolesQuery.data?.map((role) => {
            const alreadyRequested = ownedRoleNames.has(role.name);
            const isAdminRole = role.name === "admin" || role.name === "super_admin";
            return (
              <section className="rounded-md border border-slate-200 bg-white p-4" key={role.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold capitalize text-ink">{role.name.replace("_", " ")}</h2>
                    <p className="mt-1 text-sm text-muted">{role.description}</p>
                    <p className="mt-3 text-sm font-medium text-brand-700">
                      {role.approval_required ? "Admin approval required" : "Auto-approved"}
                    </p>
                  </div>
                  <Button
                    disabled={alreadyRequested || isAdminRole || mutation.isPending}
                    onClick={() => mutation.mutate(role.name)}
                  >
                    {alreadyRequested ? "Selected" : "Request"}
                  </Button>
                </div>
              </section>
            );
          })}
        </div>
        {rolesQuery.isLoading ? <p className="mt-8 text-muted">Loading roles...</p> : null}
      </main>
    </ProtectedRoute>
  );
}
