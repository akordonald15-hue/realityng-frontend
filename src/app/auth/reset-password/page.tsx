"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <h1 className="text-3xl font-semibold text-ink">Choose a new password</h1>
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
          <button className="text-sm font-medium text-brand-700" type="button" onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? "Hide password" : "Show password"}
          </button>
        </div>
        <FormMessage tone="error">{serverError}</FormMessage>
        <FormMessage tone="success">{success}</FormMessage>
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : "Save new password"}
        </Button>
      </form>
      <Link className="mt-6 text-sm font-semibold text-brand-700" href="/auth/sign-in">
        Back to sign in
      </Link>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md px-6 py-10 text-muted">Loading...</main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
