"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthCard } from "@/components/auth/auth-card";
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
    <AuthCard description="Enter your email and we’ll send reset instructions if the account exists." title="Reset your password">
        <form className="space-y-4 text-left" onSubmit={handleSubmit(onSubmit)}>
          <TextField label="Email" error={errors.email} type="email" {...register("email")} />
          <FormMessage tone="error">{serverError}</FormMessage>
          <FormMessage tone="success">{success}</FormMessage>
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Sending..." : "Send reset instructions"}
          </Button>
        </form>
        <Link className="mt-6 inline-flex text-sm font-semibold text-reality-brand-600" href="/auth/sign-in">
          Back to sign in
        </Link>
    </AuthCard>
  );
}
