"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const signUpSchema = z.object({
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  email: z.string().email("Enter a valid email address."),
  phone_number: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  accepts_terms: z.boolean().refine(Boolean, "Accept the Terms to continue."),
  accepts_privacy: z.boolean().refine(Boolean, "Acknowledge the Privacy Notice to continue."),
});

const signInIdentifierSchema = signInSchema.pick({ email: true });
const signUpIdentifierSchema = signUpSchema.pick({ email: true });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;
type AuthMode = "sign-in" | "sign-up";

type RealityAuthFlowProps = {
  mode?: AuthMode;
  onAuthenticated?: () => void | Promise<void>;
  onModeChange?: (mode: AuthMode) => void;
  redirectAfterSignIn?: string | null;
  role?: string | null;
};

function safeNextPath(value?: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : undefined;
}

function alternatePath(mode: AuthMode, nextPath?: string | null, role?: string | null) {
  const params = new URLSearchParams();
  if (safeNextPath(nextPath)) {
    params.set("next", nextPath as string);
  }
  if (role) {
    params.set("role", role);
  }
  return `/auth/${mode}${params.toString() ? `?${params}` : ""}`;
}

export function RealityAuthFlow({
  mode = "sign-in",
  onAuthenticated,
  onModeChange,
  redirectAfterSignIn,
  role,
}: RealityAuthFlowProps) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [queryParams, setQueryParams] = useState(() => new URLSearchParams());
  const [activeMode, setActiveMode] = useState<AuthMode>(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [signInStep, setSignInStep] = useState<"identifier" | "password" | "success">(
    "identifier",
  );
  const [signUpStep, setSignUpStep] = useState<"identifier" | "details" | "success">(
    "identifier",
  );
  useEffect(() => {
    setQueryParams(new URLSearchParams(window.location.search));
  }, []);

  const requestedPath = safeNextPath(redirectAfterSignIn ?? queryParams.get("next"));
  const selectedRole = role ?? queryParams.get("role");
  const signUpFallbackPath = requestedPath ?? "/onboarding/role-setup";

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const signUpForm = useForm<SignUpValues>({
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

  function switchMode(nextMode: AuthMode) {
    setServerError("");
    setActiveMode(nextMode);
    onModeChange?.(nextMode);
  }

  async function completeSignIn(values: SignInValues) {
    setServerError("");
    try {
      let redirectPath = requestedPath;
      if (redirectPath === "/onboarding/role-setup" && selectedRole) {
        const roleSetupParams = new URLSearchParams();
        roleSetupParams.set("role", selectedRole);
        redirectPath = `${redirectPath}?${roleSetupParams.toString()}`;
      }
      await signIn(values, onAuthenticated ? null : redirectPath);
      setSignInStep("success");
      await onAuthenticated?.();
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  }

  async function completeSignUp(values: SignUpValues) {
    setServerError("");
    try {
      await signUp({
        ...values,
        phone_number: values.phone_number || null,
        terms_version: "2026-08",
        privacy_version: "2026-08",
      });
      setSignUpStep("success");
      if (onAuthenticated) {
        switchMode("sign-in");
        setSignInStep("password");
        signInForm.setValue("email", values.email);
        return;
      }
      const nextPath = requestedPath ?? "/onboarding/role-setup";
      router.push(alternatePath("sign-in", nextPath, selectedRole));
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  }

  if (activeMode === "sign-in") {
    if (signInStep === "success") {
      return <SuccessState className="py-10" title="Logged In" />;
    }

    if (signInStep === "password") {
      const email = signInForm.getValues("email");
      return (
        <div>
          <div className="max-w-[354px]">
            <h1 className="text-[30px] font-medium leading-[38px] text-black">Enter password</h1>
            <p className="mt-3 text-sm leading-5 text-reality-text-quaternary">
              Sign in as {email}{" "}
              <button
                className="font-medium text-reality-brand-600 underline"
                onClick={() => {
                  setServerError("");
                  setSignInStep("identifier");
                }}
                type="button"
              >
                Not you?
              </button>
            </p>
          </div>
          <form
            className="mt-6 space-y-[56px] sm:space-y-[72px]"
            onSubmit={signInForm.handleSubmit(completeSignIn)}
          >
            <div className="space-y-4">
              <TextField
                autoComplete="current-password"
                error={signInForm.formState.errors.password}
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="reality"
                {...signInForm.register("password")}
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
            <Button
              className="h-12 w-full"
              disabled={signInForm.formState.isSubmitting}
              type="submit"
              variant="reality"
            >
              {signInForm.formState.isSubmitting ? "Signing in..." : "Continue"}
            </Button>
          </form>
        </div>
      );
    }

    return (
      <div>
        <div className="max-w-[354px]">
          <h1 className="text-[30px] font-medium leading-[38px] text-black">Sign in/Sign up</h1>
          <p className="mt-3 text-sm leading-5 text-reality-text-quaternary">
            Sign in or sign up to apply for a property
          </p>
        </div>
        {USE_MOCKS ? (
          <FormMessage className="mt-6" tone="info" variant="reality">
            Demo mode is active. This environment uses local mock data.
          </FormMessage>
        ) : null}
        <form
          className="mt-6 space-y-[56px] sm:space-y-[72px]"
          onSubmit={async (event) => {
            event.preventDefault();
            setServerError("");
            const result = signInIdentifierSchema.safeParse({
              email: signInForm.getValues("email"),
            });
            if (!result.success) {
              await signInForm.trigger("email");
              return;
            }
            setSignInStep("password");
          }}
        >
          <TextField
            autoComplete="email"
            error={signInForm.formState.errors.email}
            label="Email address"
            placeholder="johndoe@gmail.com"
            type="email"
            variant="reality"
            {...signInForm.register("email")}
          />
          <div className="space-y-3">
            <Button className="h-12 w-full" type="submit" variant="reality">
              Continue
            </Button>
            {onModeChange ? (
              <button
                className="flex h-12 w-full items-center justify-center rounded-full border border-reality-border-primary bg-white px-[18px] text-sm font-semibold text-reality-text-secondary shadow-reality-xs transition hover:bg-reality-bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-2"
                onClick={() => switchMode("sign-up")}
                type="button"
              >
                Create account
              </button>
            ) : (
              <Link
                className="flex h-12 w-full items-center justify-center rounded-full border border-reality-border-primary bg-white px-[18px] text-sm font-semibold text-reality-text-secondary shadow-reality-xs transition hover:bg-reality-bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-2"
                href={alternatePath("sign-up", requestedPath, selectedRole)}
              >
                Create account
              </Link>
            )}
          </div>
        </form>
      </div>
    );
  }

  if (signUpStep === "success" && !onAuthenticated) {
    return (
      <SuccessState
        className="py-10"
        description="Your RealityNG account has been successfully created"
        title="Account created"
      />
    );
  }

  if (signUpStep === "details") {
    return (
      <div>
        <div className="max-w-[354px]">
          <h1 className="text-[30px] font-medium leading-[38px] text-black">Complete sign up</h1>
          <p className="mt-3 text-sm leading-5 text-reality-text-quaternary">
            Enter your basic details
          </p>
        </div>
        <form
          className="mt-6 space-y-[56px] sm:space-y-[72px]"
          onSubmit={signUpForm.handleSubmit(completeSignUp)}
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                error={signUpForm.formState.errors.first_name}
                label="First name"
                variant="reality"
                {...signUpForm.register("first_name")}
              />
              <TextField
                error={signUpForm.formState.errors.last_name}
                label="Last name"
                variant="reality"
                {...signUpForm.register("last_name")}
              />
            </div>
            <TextField
              error={signUpForm.formState.errors.phone_number}
              label="Phone"
              variant="reality"
              {...signUpForm.register("phone_number")}
            />
            <TextField
              autoComplete="new-password"
              error={signUpForm.formState.errors.password}
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="reality"
              {...signUpForm.register("password")}
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
                <input className="mt-1" type="checkbox" {...signUpForm.register("accepts_terms")} />
                <span>
                  I accept the{" "}
                  <Link className="font-semibold text-reality-brand-600" href="/terms">
                    Terms and Conditions
                  </Link>
                  .
                </span>
              </label>
              {signUpForm.formState.errors.accepts_terms ? (
                <p className="text-red-700">
                  {signUpForm.formState.errors.accepts_terms.message}
                </p>
              ) : null}
              <label className="flex items-start gap-3">
                <input
                  className="mt-1"
                  type="checkbox"
                  {...signUpForm.register("accepts_privacy")}
                />
                <span>
                  I acknowledge the{" "}
                  <Link className="font-semibold text-reality-brand-600" href="/privacy">
                    Privacy Notice
                  </Link>
                  .
                </span>
              </label>
              {signUpForm.formState.errors.accepts_privacy ? (
                <p className="text-red-700">
                  {signUpForm.formState.errors.accepts_privacy.message}
                </p>
              ) : null}
            </div>
            <FormMessage tone="error" variant="reality">
              {serverError}
            </FormMessage>
          </div>
          <Button
            className="h-12 w-full"
            disabled={signUpForm.formState.isSubmitting}
            type="submit"
            variant="reality"
          >
            {signUpForm.formState.isSubmitting ? "Creating account..." : "Continue"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-[354px]">
        <h1 className="text-[30px] font-medium leading-[38px] text-black">Sign in/Sign up</h1>
        <p className="mt-3 text-sm leading-5 text-reality-text-quaternary">
          Sign in or sign up to continue
        </p>
      </div>
      <form
        className="mt-6 space-y-[56px] sm:space-y-[72px]"
        onSubmit={async (event) => {
          event.preventDefault();
          setServerError("");
          const result = signUpIdentifierSchema.safeParse({
            email: signUpForm.getValues("email"),
          });
          if (!result.success) {
            await signUpForm.trigger("email");
            return;
          }
          setSignUpStep("details");
        }}
      >
        <TextField
          autoComplete="email"
          error={signUpForm.formState.errors.email}
          label="Email address"
          placeholder="johndoe@gmail.com"
          type="email"
          variant="reality"
          {...signUpForm.register("email")}
        />
        <div className="space-y-3">
          <Button className="h-12 w-full" type="submit" variant="reality">
            Continue
          </Button>
          {onModeChange ? (
            <button
              className="flex h-12 w-full items-center justify-center rounded-full border border-reality-border-primary bg-white px-[18px] text-sm font-semibold text-reality-text-secondary shadow-reality-xs transition hover:bg-reality-bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-2"
              onClick={() => switchMode("sign-in")}
              type="button"
            >
              Sign in instead
            </button>
          ) : (
            <Link
              className="flex h-12 w-full items-center justify-center rounded-full border border-reality-border-primary bg-white px-[18px] text-sm font-semibold text-reality-text-secondary shadow-reality-xs transition hover:bg-reality-bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-2"
              href={alternatePath("sign-in", signUpFallbackPath, selectedRole)}
            >
              Sign in instead
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
