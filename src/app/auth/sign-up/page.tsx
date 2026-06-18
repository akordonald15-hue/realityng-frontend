"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
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
    },
  });

  async function onSubmit(values: SignUpValues) {
    setServerError("");
    setSuccess("");
    try {
      await signUp({
        ...values,
        phone_number: values.phone_number || null,
      });
      setSuccess("Account created. Sign in to continue.");
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-background px-5 py-10">
      <Card className="w-full max-w-lg p-6 sm:p-8">
        <Link className="font-heading text-2xl font-semibold text-brand-text" href="/">
          RealityNG
        </Link>
        <h1 className="mt-8 font-heading text-3xl font-semibold text-brand-text">
          Create your account
        </h1>
        <p className="mt-2 text-brand-muted">
          Start your RealityNG property journey with a secure account.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-brand-muted">
          Already have an account?{" "}
          <Link className="font-semibold text-brand-secondary" href="/auth/sign-in">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
