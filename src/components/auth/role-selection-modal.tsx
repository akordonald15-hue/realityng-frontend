"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";

type RoleSelectionOptions = {
  nextPath?: string;
  actionLabel?: string;
};

type RoleSelectionContextValue = {
  openRoleSelection: (options?: RoleSelectionOptions) => void;
  closeRoleSelection: () => void;
};

const RoleSelectionContext = createContext<RoleSelectionContextValue | null>(null);

const roles = [
  {
    label: "Buyer / Tenant",
    value: "buyer",
    description: "Browse, save, compare, inquire, view, and apply for properties.",
    enabled: true,
  },
  {
    label: "Landlord",
    value: "landlord",
    description: "Create your profile and prepare to list or manage property.",
    enabled: true,
  },
  {
    label: "Agent",
    value: "agent",
    description: "Build your professional workspace for listings and client workflows.",
    enabled: true,
  },
  {
    label: "Artisan",
    value: "artisan",
    description: "Prepare a service profile for future property-care opportunities.",
    enabled: true,
  },
  {
    label: "Developer",
    value: "developer",
    description: "Project and development workflows are coming soon.",
    enabled: false,
  },
  {
    label: "Investor",
    value: "investor",
    description: "Investment workspaces and portfolio tools are coming soon.",
    enabled: false,
  },
];

function safeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/";
  }
  return nextPath;
}

export function RoleSelectionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<RoleSelectionOptions>({});

  const value = useMemo(
    () => ({
      openRoleSelection: (nextOptions?: RoleSelectionOptions) => {
        setOptions(nextOptions ?? {});
        setIsOpen(true);
      },
      closeRoleSelection: () => setIsOpen(false),
    }),
    [],
  );

  function chooseRole(role: string) {
    const params = new URLSearchParams();
    params.set("role", role);
    params.set("next", safeNextPath(options.nextPath));
    setIsOpen(false);
    router.push(`/auth/sign-up?${params.toString()}`);
  }

  return (
    <RoleSelectionContext.Provider value={value}>
      {children}
      {isOpen ? (
        <div
          aria-labelledby="role-selection-title"
          aria-modal="true"
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
        >
          <div className="w-full max-w-3xl rounded-md border border-brand-secondary/30 bg-brand-background p-5 text-brand-text shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <BrandLogo className="h-14 w-auto object-contain" />
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
                  Create an account to continue.
                </p>
                <h2
                  className="mt-3 font-heading text-3xl font-semibold text-brand-text"
                  id="role-selection-title"
                >
                  Welcome to RealityNG
                </h2>
                <p className="mt-2 max-w-xl leading-7 text-brand-muted">
                  Tell us who you are so we can personalize your experience.
                </p>
                {options.actionLabel ? (
                  <p className="mt-3 text-sm text-brand-muted">
                    Continue to:{" "}
                    <span className="font-semibold text-brand-secondary">
                      {options.actionLabel}
                    </span>
                  </p>
                ) : null}
              </div>
              <button
                aria-label="Close account role selection"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xl text-brand-muted hover:bg-white/10 hover:text-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                x
              </button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <button
                  aria-disabled={!role.enabled}
                  className={
                    role.enabled
                      ? "min-h-36 rounded-md border border-white/10 bg-brand-surface p-4 text-left transition hover:border-brand-secondary/70 hover:bg-brand-surface/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
                      : "min-h-36 cursor-not-allowed rounded-md border border-white/10 bg-white/5 p-4 text-left opacity-60"
                  }
                  disabled={!role.enabled}
                  key={role.value}
                  onClick={() => chooseRole(role.value)}
                  type="button"
                >
                  <span className="font-heading text-xl font-semibold text-brand-text">
                    {role.label}
                  </span>
                  {!role.enabled ? (
                    <span className="ml-2 rounded-full bg-brand-secondary/15 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                      Coming Soon
                    </span>
                  ) : null}
                  <span className="mt-3 block text-sm leading-6 text-brand-muted">
                    {role.description}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setIsOpen(false)} type="button" variant="ghost">
                Continue browsing
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </RoleSelectionContext.Provider>
  );
}

export function useRoleSelection() {
  const context = useContext(RoleSelectionContext);
  if (!context) {
    return {
      openRoleSelection: () => undefined,
      closeRoleSelection: () => undefined,
    };
  }
  return context;
}
