"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setServerError("");
    setSuccess("");
    try {
      await forgotPassword(values.email);
      setSuccess("If the email exists, reset instructions have been sent.");
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <h1 className="text-3xl font-semibold text-ink">Reset your password</h1>
      <p className="mt-2 text-muted">Enter your email to receive reset instructions.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <TextField label="Email" error={errors.email} type="email" {...register("email")} />
        <FormMessage tone="error">{serverError}</FormMessage>
        <FormMessage tone="success">{success}</FormMessage>
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Sending..." : "Send reset instructions"}
        </Button>
      </form>
      <Link className="mt-6 text-sm font-semibold text-brand-700" href="/auth/sign-in">
        Back to sign in
      </Link>
    </main>
  );
}
