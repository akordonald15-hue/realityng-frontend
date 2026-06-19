"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card } from "@/components/ui/card";
import { getDashboardSummary } from "@/lib/api/properties";

const dashboardLinks = [
  {
    href: "/properties/new",
    title: "Create property",
    description: "Start a draft listing and add media before submitting for review.",
  },
  {
    href: "/saved-properties",
    title: "View saved properties",
    description: "Return to homes, land, and commercial listings you saved while browsing.",
  },
  {
    href: "/properties",
    title: "Browse properties",
    description: "Review the public approved listing experience.",
  },
  {
    href: "/settings/profile",
    title: "Edit profile",
    description: "Keep contact and identity details current for property workflows.",
  },
];

const statLabels = [
  { key: "saved_properties_count", label: "Saved properties" },
  { key: "active_listings_count", label: "Active listings" },
  { key: "draft_listings_count", label: "Draft listings" },
] as const;

function DashboardContent() {
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
      <div className="max-w-3xl">
        <h1 className="font-heading text-3xl font-semibold text-brand-text">Dashboard</h1>
        <p className="mt-2 text-brand-muted">
          Continue the core property flow or manage your account from one place.
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {statLabels.map((item) => (
          <Card className="p-5" key={item.key}>
            <p className="text-sm text-brand-muted">{item.label}</p>
            <p className="mt-3 font-heading text-4xl font-semibold text-brand-secondary">
              {summaryQuery.isLoading ? "-" : (summaryQuery.data?.[item.key] ?? 0)}
            </p>
          </Card>
        ))}
      </div>
      {summaryQuery.isError ? (
        <Card className="mt-4 p-4 text-sm text-red-200">Dashboard stats could not be loaded.</Card>
      ) : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {dashboardLinks.map((item) => (
          <Link className="group block focus:outline-none" href={item.href} key={item.href}>
            <Card className="h-full p-5 transition group-hover:border-brand-secondary/60 group-focus-visible:ring-2 group-focus-visible:ring-brand-secondary group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-brand-background">
              <h2 className="text-lg font-semibold text-brand-text">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">{item.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
