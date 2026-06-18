"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateCurrentUser } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
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

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    reset({
      first_name: user.first_name,
      last_name: user.last_name,
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
    });
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
      setSuccess("Profile updated.");
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-semibold text-brand-text">Profile settings</h1>
        <p className="mt-2 text-brand-muted">Keep your contact and identity details current.</p>
        <Card className="mt-8 border-dashed p-4 text-sm text-brand-muted">
          Avatar upload placeholder. Secure file uploads arrive in a later document workflow sprint.
        </Card>
        <Card className="mt-6 p-5 sm:p-6">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="First name" error={errors.first_name} {...register("first_name")} />
              <TextField label="Last name" error={errors.last_name} {...register("last_name")} />
            </div>
            <TextField
              label="Phone number"
              error={errors.phone_number}
              {...register("phone_number")}
            />
            <TextField label="Bio" error={errors.bio} {...register("bio")} />
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField label="Country" error={errors.country} {...register("country")} />
              <TextField label="State" error={errors.state} {...register("state")} />
              <TextField label="City" error={errors.city} {...register("city")} />
            </div>
            <TextField label="Address" error={errors.address} {...register("address")} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Date of birth"
                error={errors.date_of_birth}
                type="date"
                {...register("date_of_birth")}
              />
              <TextField label="Gender" error={errors.gender} {...register("gender")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Emergency contact name"
                error={errors.emergency_contact_name}
                {...register("emergency_contact_name")}
              />
              <TextField
                label="Emergency contact phone"
                error={errors.emergency_contact_phone}
                {...register("emergency_contact_phone")}
              />
            </div>
            <FormMessage tone="error">{serverError}</FormMessage>
            <FormMessage tone="success">{success}</FormMessage>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </Card>
      </main>
    </ProtectedRoute>
  );
}
