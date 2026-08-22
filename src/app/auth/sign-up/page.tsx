"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/providers/auth-provider";

const signUpSchema = z.object({
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  email: z.string().email("Enter a valid email address."),
  phone_number: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  accepts_terms: z.boolean().refine(Boolean, "Accept the Terms to continue."),
  accepts_privacy: z
    .boolean()
    .refine(Boolean, "Acknowledge the Privacy Notice to continue."),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [queryParams, setQueryParams] = useState(() => new URLSearchParams());
  const {
    register,
    handleSubmit,
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

  async function onSubmit(values: SignUpValues) {
    setServerError("");
    setSuccess("");
    try {
      await signUp({
        ...values,
        phone_number: values.phone_number || null,
        terms_version: "2026-08",
        privacy_version: "2026-08",
      });
      setSuccess("Account created. Continue to sign in.");
      router.push(`/auth/sign-in?${signInParams.toString()}`);
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-background px-5 py-10">
      <Card className="w-full max-w-lg p-6 text-center sm:p-8">
        <Link aria-label="RealityNG home" className="mx-auto inline-flex" href="/">
          <BrandLogo className="h-16 w-auto object-contain" priority />
        </Link>
        <h1 className="mt-8 font-heading text-3xl font-semibold text-brand-text">
          Create your account
        </h1>
        <p className="mt-2 text-brand-muted">
          Start your RealityNG property journey with a secure account.
        </p>
        {selectedRole ? (
          <div className="mt-5 rounded-md border border-brand-secondary/40 bg-brand-secondary/10 px-4 py-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
              Selected role
            </p>
            <p className="mt-1 font-heading text-xl font-semibold capitalize text-brand-text">
              {selectedRole.replace("_", " ")}
            </p>
          </div>
        ) : null}
        <form className="mt-8 space-y-4 text-left" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="First name" error={errors.first_name} {...register("first_name")} />
            <TextField label="Last name" error={errors.last_name} {...register("last_name")} />
          </div>
          <TextField label="Email" error={errors.email} type="email" {...register("email")} />
          <TextField
            label="Phone number"
            error={errors.phone_number}
            {...register("phone_number")}
          />
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
          <div className="space-y-3 rounded-md border border-white/10 p-4 text-sm text-brand-muted">
            <label className="flex items-start gap-3">
              <input className="mt-1" type="checkbox" {...register("accepts_terms")} />
              <span>
                I accept the <Link className="font-semibold text-brand-secondary" href="/terms">Terms and Conditions</Link>.
              </span>
            </label>
            {errors.accepts_terms ? <p className="text-red-300">{errors.accepts_terms.message}</p> : null}
            <label className="flex items-start gap-3">
              <input className="mt-1" type="checkbox" {...register("accepts_privacy")} />
              <span>
                I acknowledge the <Link className="font-semibold text-brand-secondary" href="/privacy">Privacy Notice</Link>.
              </span>
            </label>
            {errors.accepts_privacy ? <p className="text-red-300">{errors.accepts_privacy.message}</p> : null}
          </div>
          <FormMessage tone="error">{serverError}</FormMessage>
          <FormMessage tone="success">{success}</FormMessage>
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-brand-muted">
          Already have an account?{" "}
          <Link
            className="font-semibold text-brand-secondary"
            href={`/auth/sign-in?${signInParams.toString()}`}
          >
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
