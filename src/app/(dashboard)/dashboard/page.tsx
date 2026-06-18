import Link from "next/link";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card } from "@/components/ui/card";

const dashboardLinks = [
  {
    href: "/properties/new",
    title: "Create property",
    description: "Start a draft listing and add media before submitting for review.",
  },
  {
    href: "/settings/profile",
    title: "Profile",
    description: "Keep contact and identity details current for property workflows.",
  },
  {
    href: "/properties",
    title: "Browse listings",
    description: "Review the public approved listing experience.",
  },
  {
    href: "/admin",
    title: "Admin review",
    description: "Open the admin surface reserved for operational workflows.",
  },
];

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
        <div className="max-w-3xl">
          <h1 className="font-heading text-3xl font-semibold text-brand-text">Dashboard</h1>
          <p className="mt-2 text-brand-muted">
            Continue the core property flow or manage your account from one place.
          </p>
        </div>
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
    </ProtectedRoute>
  );
}
