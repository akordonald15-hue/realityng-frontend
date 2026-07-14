"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { BrandLogo } from "@/components/brand/brand-logo";
import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/errors";
import { USE_MOCKS } from "@/lib/demo-mode";
import { useAuth } from "@/providers/auth-provider";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [queryParams, setQueryParams] = useState(() => new URLSearchParams());
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  useEffect(() => {
    setQueryParams(new URLSearchParams(window.location.search));
  }, []);

  const createAccountParams = new URLSearchParams();
  const requestedPath = queryParams.get("next");
  const selectedRole = queryParams.get("role");
  if (requestedPath?.startsWith("/") && !requestedPath.startsWith("//")) {
    createAccountParams.set("next", requestedPath);
  }
  if (selectedRole) {
    createAccountParams.set("role", selectedRole);
  }

  async function onSubmit(values: SignInValues) {
    setServerError("");
    try {
      const safePath =
        requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
          ? requestedPath
          : undefined;
      let redirectPath = safePath;
      if (redirectPath === "/onboarding/role-setup" && selectedRole) {
        const roleSetupParams = new URLSearchParams();
        roleSetupParams.set("role", selectedRole);
        redirectPath = `${redirectPath}?${roleSetupParams.toString()}`;
      }
      await signIn(values, redirectPath);
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
        <h1 className="mt-8 font-heading text-3xl font-semibold text-brand-text">Sign in</h1>
        <p className="mt-2 text-brand-muted">Access your RealityNG dashboard.</p>
        {USE_MOCKS ? (
          <div
            className="mt-5 rounded border border-brand-secondary/40 bg-brand-secondary/10 p-3 text-left text-sm text-brand-muted"
            role="status"
          >
            <p className="font-semibold text-brand-text">Demo mode is active</p>
            <p className="mt-1">
              This environment uses local mock data and does not connect to production services.
            </p>
          </div>
        ) : null}
        <form className="mt-8 space-y-4 text-left" onSubmit={handleSubmit(onSubmit)}>
          <TextField label="Email" error={errors.email} type="email" {...register("email")} />
          <div className="space-y-2">
            <TextField
              label="Password"
              error={errors.password}
              type={showPassword ? "text" : "password"}
              {...register("password")}
            />
            <Button
              className="mx-auto h-8 px-2 text-brand-secondary"
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
        <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row sm:gap-6">
          <Link className="font-semibold text-brand-secondary" href="/auth/forgot-password">
            Forgot password?
          </Link>
          <Link
            className="font-semibold text-brand-secondary"
            href={`/auth/sign-up${createAccountParams.toString() ? `?${createAccountParams}` : ""}`}
          >
            Create account
          </Link>
        </div>
      </Card>
    </main>
  );
}
