"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { PropertyCard } from "@/components/properties/property-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getDashboardOverview } from "@/lib/api/dashboard";
import { isApprovedProfessional } from "@/lib/auth/permissions";
import { useAuth } from "@/providers/auth-provider";

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

function DashboardContent() {
  const { user } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ["dashboard-overview", user?.id],
    queryFn: () => getDashboardOverview(user),
  });
  const overview = dashboardQuery.data;
  const isAgent = isApprovedProfessional(user);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-secondary">
          {overview?.role === "agent" ? "Agent dashboard" : "Buyer dashboard"}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold text-brand-text">
          Welcome back{user?.first_name ? `, ${user.first_name}` : ""}.
        </h1>
        <p className="mt-2 text-brand-muted">
          {isAgent
            ? "Track listing performance, leads, views, and conversion activity."
            : "Review saved properties, recent activity, inquiries, and recommendations."}
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(overview?.metrics ?? []).map((item) => (
          <Card className="p-5" key={item.label}>
            <p className="text-sm text-brand-muted">{item.label}</p>
            <p className="mt-3 font-heading text-4xl font-semibold text-brand-secondary">
              {dashboardQuery.isLoading ? "-" : item.value}
            </p>
            <p className="mt-2 text-xs leading-5 text-brand-muted">{item.detail}</p>
          </Card>
        ))}
      </div>
      {dashboardQuery.isError ? (
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
      {overview?.role === "agent" ? (
        <>
          <section className="mt-10">
            <h2 className="font-heading text-2xl font-semibold text-brand-text">Active listings</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {overview.activeListings.slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </section>
          <section className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">Lead pipeline</h2>
              <div className="mt-5 space-y-4">
                {overview.leads.slice(0, 5).map((lead) => (
                  <div className="rounded-md border border-white/10 p-4" key={lead.id}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-brand-text">{lead.buyer_name}</p>
                      <Badge variant="muted">{lead.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-brand-muted">{lead.property_title}</p>
                    <p className="mt-2 text-sm leading-6 text-brand-muted">{lead.message}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                Conversion metrics
              </h2>
              <div className="mt-5 grid gap-4">
                <div className="rounded-md bg-white/5 p-4">
                  <p className="text-sm text-brand-muted">Inquiry response rate</p>
                  <p className="mt-2 text-3xl font-semibold text-brand-secondary">94%</p>
                </div>
                <div className="rounded-md bg-white/5 p-4">
                  <p className="text-sm text-brand-muted">Average days to negotiation</p>
                  <p className="mt-2 text-3xl font-semibold text-brand-secondary">6.4</p>
                </div>
                <div className="rounded-md bg-white/5 p-4">
                  <p className="text-sm text-brand-muted">Projected monthly commission</p>
                  <p className="mt-2 text-3xl font-semibold text-brand-secondary">₦18.5M</p>
                </div>
              </div>
            </Card>
          </section>
        </>
      ) : (
        <>
          <section className="mt-10">
            <h2 className="font-heading text-2xl font-semibold text-brand-text">
              Recommended properties
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {overview?.recommendedProperties.slice(0, 4).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </section>
          <section className="mt-10 grid gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">My inquiries</h2>
              <div className="mt-5 space-y-4">
                {overview?.inquiries.slice(0, 5).map((inquiry) => (
                  <div className="rounded-md border border-white/10 p-4" key={inquiry.id}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-brand-text">{inquiry.property_title}</p>
                      <Badge variant="muted">{inquiry.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-brand-muted">{inquiry.message}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                Recently viewed
              </h2>
              <div className="mt-5 space-y-3">
                {overview?.recentlyViewed.slice(0, 5).map((property) => (
                  <Link
                    className="block rounded-md border border-white/10 p-4 transition hover:border-brand-secondary/60"
                    href={`/properties/${property.slug}`}
                    key={property.id}
                  >
                    <p className="font-semibold text-brand-text">{property.title}</p>
                    <p className="mt-1 text-sm text-brand-muted">
                      {property.city}, {property.state}
                    </p>
                  </Link>
                ))}
              </div>
            </Card>
          </section>
        </>
      )}
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
