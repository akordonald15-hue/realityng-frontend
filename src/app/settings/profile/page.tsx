"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { AccountSettingsShell } from "@/components/settings/account-settings-shell";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { updateCurrentUser } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { User, UserRole } from "@/lib/auth/types";
import { useAuth } from "@/providers/auth-provider";

const profileSchema = z.object({
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  phone_number: z.string().optional(),
  bio: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

function profileValuesFromUser(user: User): ProfileValues {
  return {
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    phone_number: user.phone_number ?? "",
    bio: user.profile?.bio ?? "",
    country: user.profile?.country ?? "",
    state: user.profile?.state ?? "",
    city: user.profile?.city ?? "",
    address: user.profile?.address ?? "",
    date_of_birth: user.profile?.date_of_birth ?? "",
    gender: user.profile?.gender ?? "",
    emergency_contact_name: user.profile?.emergency_contact_name ?? "",
    emergency_contact_phone: user.profile?.emergency_contact_phone ?? "",
  };
}

function initialsFor(user: User | null) {
  const seed = user?.full_name || user?.email || "RealityNG";
  const parts = seed
    .split(/\s|@/)
    .map((part) => part.trim())
    .filter(Boolean);
  return (parts[0]?.[0] ?? "R") + (parts[1]?.[0] ?? "");
}

function roleLabel(role: UserRole) {
  return role.role.name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function roleTone(status: UserRole["status"]): "approved" | "pending" | "rejected" {
  if (status === "approved") {
    return "approved";
  }
  if (status === "rejected") {
    return "rejected";
  }
  return "pending";
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    reset(profileValuesFromUser(user));
  }, [reset, user]);

  async function onSubmit(values: ProfileValues) {
    setServerError("");
    setSuccess("");
    try {
      const updated = await updateCurrentUser({
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number || null,
        profile: {
          bio: values.bio ?? "",
          country: values.country ?? "",
          state: values.state ?? "",
          city: values.city ?? "",
          address: values.address ?? "",
          date_of_birth: values.date_of_birth || null,
          gender: values.gender ?? "",
          emergency_contact_name: values.emergency_contact_name ?? "",
          emergency_contact_phone: values.emergency_contact_phone ?? "",
        },
      });
      setUser(updated);
      reset(profileValuesFromUser(updated));
      setSuccess("Profile updated.");
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  }

  const address = [user?.profile?.address, user?.profile?.city, user?.profile?.state, user?.profile?.country]
    .filter(Boolean)
    .join(", ");
  const hasVerifiedIdentity = Boolean(
    user?.is_email_verified ||
      user?.is_phone_verified ||
      user?.roles.some((role) => role.status === "approved"),
  );

  return (
    <ProtectedRoute>
      <AccountSettingsShell
        description="Manage the personal details attached to your RealityNG account."
        title="Account Settings"
      >
        <section className="max-w-3xl" aria-labelledby="personal-information-heading">
              <div className="flex flex-col gap-5 border-b border-reality-border-secondary pb-8 sm:flex-row sm:items-center">
                {user?.profile?.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    alt={user.full_name || user.email}
                    className="h-20 w-20 rounded-full border border-reality-border-secondary object-cover"
                    decoding="async"
                    src={user.profile.avatar_url}
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-reality-brand-500/20 bg-reality-brand-50 font-display text-2xl font-semibold text-reality-brand-700">
                    {initialsFor(user)}
                  </div>
                )}
                <div className="min-w-0">
                  <h2
                    className="text-xl font-semibold text-reality-text-primary"
                    id="personal-information-heading"
                  >
                    Personal information
                  </h2>
                  <p className="mt-1 text-sm text-reality-text-secondary">
                    {user?.full_name || "Name not provided"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusChip tone={hasVerifiedIdentity ? "approved" : "pending"}>
                      {hasVerifiedIdentity ? "Verified profile" : "Verification pending"}
                    </StatusChip>
                    {user?.roles.map((role) => (
                      <StatusChip key={role.id} tone={roleTone(role.status)}>
                        {roleLabel(role)} {role.status}
                      </StatusChip>
                    ))}
                  </div>
                </div>
              </div>

              <dl className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-reality-text-primary">Email address</dt>
                  <dd className="mt-1 break-words text-reality-text-secondary">
                    {user?.email ?? "Not provided"}
                    <span className="ml-2 text-xs text-reality-text-quaternary">
                      {user?.is_email_verified ? "Verified" : "Read-only"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-reality-text-primary">Phone number</dt>
                  <dd className="mt-1 text-reality-text-secondary">
                    {user?.phone_number || "Not provided"}
                    <span className="ml-2 text-xs text-reality-text-quaternary">
                      {user?.is_phone_verified ? "Verified" : "Editable"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-reality-text-primary">Residential address</dt>
                  <dd className="mt-1 text-reality-text-secondary">{address || "Not provided"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-reality-text-primary">Profile image</dt>
                  <dd className="mt-1 text-reality-text-secondary">
                    {user?.profile?.avatar_url
                      ? "Image on file"
                      : "Initials are shown until upload support is available."}
                  </dd>
                </div>
              </dl>

              <form
                aria-label="Edit personal information"
                className="mt-10 space-y-5"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    autoComplete="given-name"
                    label="First name"
                    error={errors.first_name}
                    variant="reality"
                    {...register("first_name")}
                  />
                  <TextField
                    autoComplete="family-name"
                    label="Last name"
                    error={errors.last_name}
                    variant="reality"
                    {...register("last_name")}
                  />
                </div>
                <TextField
                  autoComplete="tel"
                  label="Phone number"
                  error={errors.phone_number}
                  variant="reality"
                  {...register("phone_number")}
                />
                <TextField label="Professional bio" error={errors.bio} variant="reality" {...register("bio")} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField label="Country" error={errors.country} variant="reality" {...register("country")} />
                  <TextField label="State" error={errors.state} variant="reality" {...register("state")} />
                  <TextField label="City" error={errors.city} variant="reality" {...register("city")} />
                </div>
                <TextField
                  autoComplete="street-address"
                  label="Residential address"
                  error={errors.address}
                  variant="reality"
                  {...register("address")}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Date of birth"
                    error={errors.date_of_birth}
                    type="date"
                    variant="reality"
                    {...register("date_of_birth")}
                  />
                  <TextField label="Gender" error={errors.gender} variant="reality" {...register("gender")} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Emergency contact name"
                    error={errors.emergency_contact_name}
                    variant="reality"
                    {...register("emergency_contact_name")}
                  />
                  <TextField
                    label="Emergency contact phone"
                    error={errors.emergency_contact_phone}
                    variant="reality"
                    {...register("emergency_contact_phone")}
                  />
                </div>
                <FormMessage tone="error" variant="reality">
                  {serverError}
                </FormMessage>
                <FormMessage tone="success" variant="reality">
                  {success}
                </FormMessage>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                  <Button
                    className="sm:min-w-36"
                    disabled={isSubmitting || !isDirty}
                    type="submit"
                    variant="reality"
                  >
                    {isSubmitting ? "Saving..." : "Save changes"}
                  </Button>
                  <Button
                    disabled={isSubmitting || !isDirty || !user}
                    onClick={() => {
                      if (user) {
                        reset(profileValuesFromUser(user));
                      }
                      setServerError("");
                      setSuccess("");
                    }}
                    type="button"
                    variant="realitySecondary"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
        </section>
      </AccountSettingsShell>
    </ProtectedRoute>
  );
}

