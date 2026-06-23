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
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/providers/auth-provider";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type SignInValues = z.infer<typeof signInSchema>;

const demoAccounts = [
  { label: "Admin", email: "admin@realityng.com" },
  { label: "Agent", email: "agent@realityng.com" },
  { label: "Buyer", email: "buyer@realityng.com" },
];

export default function SignInPage() {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInValues) {
    setServerError("");
    try {
      await signIn(values);
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
        <h1 className="mt-8 font-heading text-3xl font-semibold text-brand-text">Sign in</h1>
        <p className="mt-2 text-brand-muted">Access your RealityNG dashboard.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <TextField label="Email" error={errors.email} type="email" {...register("email")} />
          <div className="space-y-2">
            <TextField
              label="Password"
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
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="mt-6 flex items-center justify-between gap-4 text-sm">
          <Link className="font-semibold text-brand-secondary" href="/auth/forgot-password">
            Forgot password?
          </Link>
          <Link className="font-semibold text-brand-secondary" href="/auth/sign-up">
            Create account
          </Link>
        </div>
        <div className="mt-6 rounded-md border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-brand-text">Demo accounts</p>
          <div className="mt-3 grid gap-2 text-xs text-brand-muted">
            {demoAccounts.map((account) => (
              <button
                className="rounded-sm border border-white/10 px-3 py-2 text-left transition hover:border-brand-secondary hover:text-brand-text"
                key={account.email}
                onClick={() => {
                  setValue("email", account.email, { shouldValidate: true });
                  setValue("password", "password123", { shouldValidate: true });
                }}
                type="button"
              >
                {account.label}: {account.email} / password123
              </button>
            ))}
          </div>
        </div>
      </Card>
    </main>
  );
}
