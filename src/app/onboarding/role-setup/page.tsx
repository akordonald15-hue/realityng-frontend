"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

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
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-semibold text-brand-text">
          Choose your RealityNG roles
        </h1>
        <p className="mt-2 text-brand-muted">
          Tenant, buyer, and landlord roles are approved immediately. Professional roles require
          admin review.
        </p>
        <div className="mt-6 space-y-3">
          <FormMessage tone="success">{message}</FormMessage>
          <FormMessage tone="error">{error}</FormMessage>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {rolesQuery.data?.map((role) => {
            const alreadyRequested = ownedRoleNames.has(role.name);
            const isAdminRole = role.name === "admin" || role.name === "super_admin";
            return (
              <Card className="p-4" key={role.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold capitalize text-brand-text">
                      {role.name.replace("_", " ")}
                    </h2>
                    <p className="mt-1 text-sm text-brand-muted">{role.description}</p>
                    <p className="mt-3 text-sm font-medium text-brand-secondary">
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
              </Card>
            );
          })}
        </div>
        {rolesQuery.isLoading ? <p className="mt-8 text-brand-muted">Loading roles...</p> : null}
        <div className="mt-8 border-t border-white/10 pt-6">
          <Link className={buttonClasses("primary")} href="/dashboard">
            Continue to dashboard
          </Link>
        </div>
      </main>
    </ProtectedRoute>
  );
}
