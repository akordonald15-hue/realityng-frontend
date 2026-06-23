"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { BrandLogo } from "@/components/brand/brand-logo";
import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { resetPassword } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";

const resetPasswordSchema = z.object({
  uid: z.string().min(1, "Reset user id is required."),
  token: z.string().min(1, "Reset token is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      uid: searchParams.get("uid") ?? "",
      token: searchParams.get("token") ?? "",
      password: "",
    },
  });

  async function onSubmit(values: ResetPasswordValues) {
    setServerError("");
    setSuccess("");
    try {
      await resetPassword(values);
      setSuccess("Password reset. You can now sign in.");
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-background px-5 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <Link aria-label="RealityNG home" className="inline-flex" href="/">
          <BrandLogo className="h-16 w-auto object-contain" priority />
        </Link>
        <h1 className="mt-8 font-heading text-3xl font-semibold text-brand-text">
          Choose a new password
        </h1>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <TextField label="User ID" error={errors.uid} {...register("uid")} />
          <TextField label="Reset token" error={errors.token} {...register("token")} />
          <div className="space-y-2">
            <TextField
              label="New password"
              error={errors.password}
              type={showPassword ? "text" : "password"}
              {...register("password")}
            />
            <Button
              className="h-8 px-2 text-brand-secondary"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
              variant="ghost"
            >
              {showPassword ? "Hide password" : "Show password"}
            </Button>
          </div>
          <FormMessage tone="error">{serverError}</FormMessage>
          <FormMessage tone="success">{success}</FormMessage>
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save new password"}
          </Button>
        </form>
        <Link
          className="mt-6 inline-flex text-sm font-semibold text-brand-secondary"
          href="/auth/sign-in"
        >
          Back to sign in
        </Link>
      </Card>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<main className="bg-brand-background px-6 py-10 text-brand-muted">Loading...</main>}
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
