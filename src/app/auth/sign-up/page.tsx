"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { SuccessState } from "@/components/ui/success-state";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/providers/auth-provider";

const signUpSchema = z.object({
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  email: z.string().email("Enter a valid email address."),
  phone_number: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  accepts_terms: z.boolean().refine(Boolean, "Accept the Terms to continue."),
  accepts_privacy: z.boolean().refine(Boolean, "Acknowledge the Privacy Notice to continue."),
});

const identifierSchema = signUpSchema.pick({ email: true });

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [queryParams, setQueryParams] = useState(() => new URLSearchParams());
  const [step, setStep] = useState<"identifier" | "details" | "success">("identifier");
  const {
    getValues,
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      password: "",
      accepts_terms: false,
      accepts_privacy: false,
    },
  });

  useEffect(() => {
    setQueryParams(new URLSearchParams(window.location.search));
  }, []);

  const selectedRole = queryParams.get("role");
  const requestedPath = queryParams.get("next");
  const nextPath =
    requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/onboarding/role-setup";
  const signInParams = new URLSearchParams();
  signInParams.set("next", nextPath);
  if (selectedRole) {
    signInParams.set("role", selectedRole);
  }

  async function continueToDetails() {
    setServerError("");
    const result = identifierSchema.safeParse({ email: getValues("email") });
    if (!result.success) {
      await trigger("email");
      return;
    }
    setStep("details");
  }

  async function onSubmit(values: SignUpValues) {
    setServerError("");
    try {
      await signUp({
        ...values,
        phone_number: values.phone_number || null,
        terms_version: "2026-08",
        privacy_version: "2026-08",
      });
      setStep("success");
      router.push(`/auth/sign-in?${signInParams.toString()}`);
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  }

  if (step === "success") {
    return (
      <AuthCard title="">
        <SuccessState
          className="py-10"
          description="Your RealityNG account has been successfully created"
          title="Account created"
        />
      </AuthCard>
    );
  }

  if (step === "details") {
    return (
      <AuthCard description="Enter your basic details" showLogomark title="Complete sign up">
        <form className="space-y-[97px]" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                error={errors.first_name}
                label="First name"
                variant="reality"
                {...register("first_name")}
              />
              <TextField
                error={errors.last_name}
                label="Last name"
                variant="reality"
                {...register("last_name")}
              />
            </div>
            <TextField
              error={errors.phone_number}
              label="Phone"
              variant="reality"
              {...register("phone_number")}
            />
            <TextField
              autoComplete="new-password"
              error={errors.password}
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="reality"
              {...register("password")}
            />
            <button
              className="text-sm font-medium text-reality-brand-600 underline"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
            <div className="space-y-3 rounded-reality border border-reality-border-secondary bg-reality-bg-subtle p-4 text-sm text-reality-text-secondary">
              <label className="flex items-start gap-3">
                <input className="mt-1" type="checkbox" {...register("accepts_terms")} />
                <span>
                  I accept the{" "}
                  <Link className="font-semibold text-reality-brand-600" href="/terms">
                    Terms and Conditions
                  </Link>
                  .
                </span>
              </label>
              {errors.accepts_terms ? (
                <p className="text-red-700">{errors.accepts_terms.message}</p>
              ) : null}
              <label className="flex items-start gap-3">
                <input className="mt-1" type="checkbox" {...register("accepts_privacy")} />
                <span>
                  I acknowledge the{" "}
                  <Link className="font-semibold text-reality-brand-600" href="/privacy">
                    Privacy Notice
                  </Link>
                  .
                </span>
              </label>
              {errors.accepts_privacy ? (
                <p className="text-red-700">{errors.accepts_privacy.message}</p>
              ) : null}
            </div>
            <FormMessage tone="error" variant="reality">
              {serverError}
            </FormMessage>
          </div>
          <Button className="h-12 w-full" disabled={isSubmitting} type="submit" variant="reality">
            {isSubmitting ? "Creating account..." : "Continue"}
          </Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard description="Sign in or sign up to continue" showLogomark title="Sign in/Sign up">
      <form
        className="space-y-[97px]"
        onSubmit={(event) => {
          event.preventDefault();
          void continueToDetails();
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
            href={`/auth/sign-in?${signInParams.toString()}`}
          >
            Sign in instead
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
