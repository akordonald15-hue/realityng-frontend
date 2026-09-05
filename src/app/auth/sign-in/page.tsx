"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthCard } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { SuccessState } from "@/components/ui/success-state";
import { getApiErrorMessage } from "@/lib/api/errors";
import { USE_MOCKS } from "@/lib/demo-mode";
import { useAuth } from "@/providers/auth-provider";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const identifierSchema = signInSchema.pick({ email: true });

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [queryParams, setQueryParams] = useState(() => new URLSearchParams());
  const [step, setStep] = useState<"identifier" | "password" | "success">("identifier");
  const {
    getValues,
    register,
    handleSubmit,
    trigger,
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

  async function continueToPassword() {
    setServerError("");
    const result = identifierSchema.safeParse({ email: getValues("email") });
    if (!result.success) {
      await trigger("email");
      return;
    }
    setStep("password");
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
      setStep("success");
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  }

  if (step === "success") {
    return (
      <AuthCard title="">
        <SuccessState className="py-16" title="Logged In" />
      </AuthCard>
    );
  }

  if (step === "password") {
    const email = getValues("email");

    return (
      <AuthCard
        description={
          <span>
            Sign in as {email}{" "}
            <button
              className="font-medium text-reality-brand-600 underline"
              onClick={() => {
                setServerError("");
                setStep("identifier");
              }}
              type="button"
            >
              Not you?
            </button>
          </span>
        }
        title="Enter password"
      >
        <form className="space-y-[97px]" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <TextField
              autoComplete="current-password"
              error={errors.password}
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="reality"
              {...register("password")}
            />
            <div className="flex items-center justify-between gap-3">
              <button
                className="text-sm font-medium text-reality-brand-600 underline"
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? "Hide password" : "Show password"}
              </button>
              <Link
                className="text-sm font-medium text-reality-brand-600 underline"
                href="/auth/forgot-password"
              >
                Forgot Password
              </Link>
            </div>
            <FormMessage tone="error" variant="reality">
              {serverError}
            </FormMessage>
          </div>
          <Button className="h-12 w-full" disabled={isSubmitting} type="submit" variant="reality">
            {isSubmitting ? "Signing in..." : "Continue"}
          </Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard description="Sign in or sign up to apply for a property" title="Sign in/Sign up">
      {USE_MOCKS ? (
        <FormMessage tone="info" variant="reality">
          Demo mode is active. This environment uses local mock data.
        </FormMessage>
      ) : null}
      <form
        className="mt-6 space-y-[97px]"
        onSubmit={(event) => {
          event.preventDefault();
          void continueToPassword();
        }}
      >
        <TextField
          autoComplete="email"
          error={errors.email}
          label="Email address"
          placeholder="johndoe@gmail.com"
          type="email"
          variant="reality"
          {...register("email")}
        />
        <div className="space-y-3">
          <Button className="h-12 w-full" type="submit" variant="reality">
            Continue
          </Button>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-reality-border-primary bg-white px-[18px] text-sm font-semibold text-reality-text-secondary shadow-reality-xs transition hover:bg-reality-bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-2"
            href={`/auth/sign-up${createAccountParams.toString() ? `?${createAccountParams}` : ""}`}
          >
            Create account
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
