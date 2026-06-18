"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/forms/form-message";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/providers/auth-provider";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInValues) {
    setServerError("");
    try {
      await signIn(values);
      router.push("/dashboard");
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <h1 className="text-3xl font-semibold text-ink">Sign in</h1>
      <p className="mt-2 text-muted">Access your RealityNG dashboard.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <TextField label="Email" error={errors.email} type="email" {...register("email")} />
        <div className="space-y-2">
          <TextField
            label="Password"
            error={errors.password}
            type={showPassword ? "text" : "password"}
            {...register("password")}
          />
          <button className="text-sm font-medium text-brand-700" type="button" onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? "Hide password" : "Show password"}
          </button>
        </div>
        <FormMessage tone="error">{serverError}</FormMessage>
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link className="font-semibold text-brand-700" href="/auth/forgot-password">
          Forgot password?
        </Link>
        <Link className="font-semibold text-brand-700" href="/auth/sign-up">
          Create account
        </Link>
      </div>
    </main>
  );
}
