"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkflowStatusBadge } from "@/components/workflow/status-badge";
import { formatApplicationStatus } from "@/lib/api/applications";
import { getDashboardOverview } from "@/lib/api/dashboard";
import { formatInquiryStatus } from "@/lib/api/inquiries";
import { formatViewingStatus, formatViewingType } from "@/lib/api/viewings";
import { useAuth } from "@/providers/auth-provider";

function AdminContent() {
  const { user } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard-overview", user?.id],
    queryFn: () => getDashboardOverview(user),
  });
  const overview = dashboardQuery.data;

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-secondary">
            Admin dashboard
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-brand-text">
            Platform command center
          </h1>
          <p className="mt-2 max-w-2xl text-brand-muted">
            Monitor listings, approvals, agents, user growth, and executive marketplace health.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link className={buttonClasses("primary", "w-full sm:w-auto")} href="/properties">
            View marketplace
          </Link>
          <Link className={buttonClasses("secondary", "w-full sm:w-auto")} href="/dashboard">
            My dashboard
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(overview?.metrics ?? []).map((metric) => (
          <Card className="p-5" key={metric.label}>
            <p className="text-sm text-brand-muted">{metric.label}</p>
            <p className="mt-3 font-heading text-4xl font-semibold text-brand-secondary">
              {dashboardQuery.isLoading ? "-" : metric.value}
            </p>
            <p className="mt-2 text-xs leading-5 text-brand-muted">{metric.detail}</p>
          </Card>
        ))}
      </div>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">
            Pending property approvals
          </h2>
          <div className="mt-5 space-y-4">
            {overview?.pendingApprovals.slice(0, 6).map((property) => (
              <div className="rounded-md border border-white/10 p-4" key={property.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-text">{property.title}</p>
                    <p className="mt-1 text-sm text-brand-muted">
                      {property.city}, {property.state} by {property.agent_name}
                    </p>
                  </div>
                  <Badge variant="muted">Pending review</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">User statistics</h2>
          <div className="mt-5 grid gap-4">
            {overview?.userStats.map((stat) => (
              <div className="rounded-md bg-white/5 p-4" key={stat.label}>
                <p className="text-sm text-brand-muted">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-brand-secondary">{stat.value}</p>
                <p className="mt-1 text-xs text-brand-muted">{stat.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <Card className="p-5">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">Latest inquiries</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {overview?.leads.slice(0, 6).map((lead) => (
              <div className="rounded-md border border-white/10 p-4" key={lead.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-brand-text">{lead.interested_user.full_name}</p>
                  <WorkflowStatusBadge status={lead.status}>
                    {formatInquiryStatus(lead.status)}
                  </WorkflowStatusBadge>
                </div>
                <p className="mt-2 text-sm text-brand-muted">{lead.property.title}</p>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{lead.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">Upcoming viewings</h2>
          <div className="mt-5 space-y-4">
            {overview?.receivedViewings.slice(0, 6).map((viewing) => (
              <div className="rounded-md border border-white/10 p-4" key={viewing.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-brand-text">{viewing.property.title}</p>
                  <WorkflowStatusBadge status={viewing.status}>
                    {formatViewingStatus(viewing.status)}
                  </WorkflowStatusBadge>
                </div>
                <p className="mt-2 text-sm text-brand-muted">
                  {formatViewingType(viewing.viewing_type)} viewing requested by{" "}
                  {viewing.requester.full_name}
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">
            Pending applications
          </h2>
          <div className="mt-5 space-y-4">
            {overview?.receivedApplications.slice(0, 6).map((application) => (
              <div className="rounded-md border border-white/10 p-4" key={application.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-brand-text">{application.full_name}</p>
                  <WorkflowStatusBadge status={application.status}>
                    {formatApplicationStatus(application.status)}
                  </WorkflowStatusBadge>
                </div>
                <p className="mt-2 text-sm text-brand-muted">{application.property.title}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <Card className="p-5">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">Recent activity</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {overview?.activity.slice(0, 8).map((item) => (
              <div className="rounded-md border border-white/10 p-4" key={item.id}>
                <p className="font-semibold text-brand-text">{item.label}</p>
                <p className="mt-1 text-sm text-brand-muted">{item.entity_type}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <Navbar />
      <ProtectedRoute requireAdmin>
        <AdminContent />
      </ProtectedRoute>
      <Footer />
    </div>
  );
}
