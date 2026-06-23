"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { BrandLogo } from "@/components/brand/brand-logo";
import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <main className="flex min-h-screen items-center justify-center bg-brand-background px-5 py-10">
      <Card className="w-full max-w-md p-6 text-center sm:p-8">
        <Link aria-label="RealityNG home" className="mx-auto inline-flex" href="/">
          <BrandLogo className="h-16 w-auto object-contain" priority />
        </Link>
        <h1 className="mt-8 font-heading text-3xl font-semibold text-brand-text">
          Reset your password
        </h1>
        <p className="mt-2 text-brand-muted">Enter your email to receive reset instructions.</p>
        <form className="mt-8 space-y-4 text-left" onSubmit={handleSubmit(onSubmit)}>
          <TextField label="Email" error={errors.email} type="email" {...register("email")} />
          <FormMessage tone="error">{serverError}</FormMessage>
          <FormMessage tone="success">{success}</FormMessage>
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Sending..." : "Send reset instructions"}
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
