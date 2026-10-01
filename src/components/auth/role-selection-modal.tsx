"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal-shell";

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

const supportedTopics = [
  "Save and compare properties",
  "Request viewings or send inquiries",
  "Submit applications",
  "List and manage properties",
  "Start verification",
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
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center">
          <ModalShell
            className="max-h-[92vh] max-w-3xl overflow-y-auto p-5 sm:p-7"
            closeLabel="Close account role selection"
            description="Tell us who you are so we can personalize your experience."
            onClose={() => setIsOpen(false)}
            title="Welcome to RealityNG"
          >
            <BrandLogo className="h-12 w-auto object-contain" tone="light" />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-reality-brand-600">
              Create an account to continue.
            </p>
            {options.actionLabel ? (
              <p className="mt-3 text-sm text-reality-text-secondary">
                Continue to:{" "}
                <span className="font-semibold text-reality-brand-600">{options.actionLabel}</span>
              </p>
            ) : null}
            <div className="mt-5 rounded-md border border-reality-border-secondary bg-reality-bg-subtle p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-reality-brand-600">
                Your account unlocks
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {supportedTopics.map((topic) => (
                  <span
                    className="rounded-full border border-reality-border-secondary bg-white px-3 py-1 text-xs text-reality-text-secondary"
                    key={topic}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <button
                  aria-disabled={!role.enabled}
                  className={
                    role.enabled
                      ? "min-h-36 rounded-md border border-reality-border-secondary bg-white p-4 text-left transition hover:border-brand-secondary/70 hover:bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
                      : "min-h-36 cursor-not-allowed rounded-md border border-reality-border-secondary bg-reality-bg-subtle p-4 text-left opacity-60"
                  }
                  disabled={!role.enabled}
                  key={role.value}
                  onClick={() => chooseRole(role.value)}
                  type="button"
                >
                  <span className="font-display text-xl font-semibold text-reality-text-primary">
                    {role.label}
                  </span>
                  {!role.enabled ? (
                    <span className="ml-2 rounded-full bg-brand-secondary/15 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-reality-brand-600">
                      Coming Soon
                    </span>
                  ) : null}
                  <span className="mt-3 block text-sm leading-6 text-reality-text-secondary">
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
          </ModalShell>
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
