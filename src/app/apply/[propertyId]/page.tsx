"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createApplication } from "@/lib/api/applications";
import { getPublicProperty } from "@/lib/api/properties";
import { formatPrice } from "@/lib/properties/format";
import { useAuth } from "@/providers/auth-provider";

function defaultMoveInDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

function ApplicationForm() {
  const params = useParams<{ propertyId: string }>();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const propertySlug = searchParams.get("slug") ?? "";
  const inquiryId = searchParams.get("inquiry");
  const viewingId = searchParams.get("viewing");
  const propertyQuery = useQuery({
    queryKey: ["public-property", propertySlug],
    queryFn: () => getPublicProperty(propertySlug),
    enabled: Boolean(propertySlug),
  });
  const property = propertyQuery.data;
  const initialName =
    user?.full_name || `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const [employmentStatus, setEmploymentStatus] = useState("Employed");
  const [employerName, setEmployerName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [moveInDate, setMoveInDate] = useState(() => defaultMoveInDate());
  const [message, setMessage] = useState("");
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const mutation = useMutation({
    mutationFn: () =>
      createApplication({
        property_id: params.propertyId,
        inquiry_id: inquiryId,
        viewing_id: viewingId,
        full_name: fullName,
        email,
        phone,
        employment_status: employmentStatus,
        employer_name: employerName,
        monthly_income: monthlyIncome,
        move_in_date: moveInDate,
        message,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
    },
  });

  function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
      <Link className="text-sm font-semibold text-brand-secondary" href="/properties">
        Back to properties
      </Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-secondary">
            Rental application
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-brand-text">
            Submit your application
          </h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Share your personal, employment, and move-in details for owner review.
          </p>
          {mutation.isSuccess ? (
            <div className="mt-6 rounded-md border border-brand-secondary/40 bg-brand-secondary/10 p-4">
              <p className="font-semibold text-brand-text">Application submitted.</p>
              <p className="mt-1 text-sm text-brand-muted">
                Track the review status from your dashboard.
              </p>
              <Link className={buttonClasses("primary", "mt-4 h-9")} href="/dashboard">
                Go to dashboard
              </Link>
            </div>
          ) : (
            <form className="mt-6 grid gap-4" onSubmit={submitApplication}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-medium text-brand-text">Full name</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text outline-none transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    value={fullName}
                  />
                </label>
                <label>
                  <span className="text-sm font-medium text-brand-text">Email</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text outline-none transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    value={email}
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-medium text-brand-text">Phone</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text outline-none transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                    onChange={(event) => setPhone(event.target.value)}
                    required
                    value={phone}
                  />
                </label>
                <label>
                  <span className="text-sm font-medium text-brand-text">Employment status</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text outline-none transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                    onChange={(event) => setEmploymentStatus(event.target.value)}
                    required
                    value={employmentStatus}
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-medium text-brand-text">Employer name</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text outline-none transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                    onChange={(event) => setEmployerName(event.target.value)}
                    value={employerName}
                  />
                </label>
                <label>
                  <span className="text-sm font-medium text-brand-text">Monthly income</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text outline-none transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                    min="1"
                    onChange={(event) => setMonthlyIncome(event.target.value)}
                    required
                    type="number"
                    value={monthlyIncome}
                  />
                </label>
              </div>
              <label>
                <span className="text-sm font-medium text-brand-text">Preferred move-in date</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text outline-none transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                  min={minDate}
                  onChange={(event) => setMoveInDate(event.target.value)}
                  required
                  type="date"
                  value={moveInDate}
                />
              </label>
              <label>
                <span className="text-sm font-medium text-brand-text">Message</span>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-md border border-white/10 bg-white/5 px-3 py-3 text-sm text-brand-text outline-none transition placeholder:text-brand-muted/60 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                  maxLength={1200}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Add useful context for the landlord or agent."
                  value={message}
                />
              </label>
              {mutation.isError ? (
                <p className="text-sm text-red-200">
                  Application could not be submitted. Please review the details and try again.
                </p>
              ) : null}
              <Button disabled={mutation.isPending} type="submit">
                {mutation.isPending ? "Submitting..." : "Submit application"}
              </Button>
            </form>
          )}
        </Card>
        <aside>
          <Card className="p-5">
            <p className="text-sm uppercase tracking-wide text-brand-muted">Property</p>
            {propertyQuery.isLoading ? (
              <div className="mt-4 h-40 animate-pulse rounded-md bg-white/10" />
            ) : null}
            {property ? (
              <>
                <h2 className="mt-3 font-heading text-2xl font-semibold text-brand-text">
                  {property.title}
                </h2>
                <p className="mt-2 text-sm text-brand-muted">
                  {property.city}, {property.state}
                </p>
                <p className="mt-3 font-heading text-3xl font-semibold text-brand-secondary">
                  {formatPrice(property)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>{property.listing_type.replace("_", " ")}</Badge>
                  <Badge variant="muted">{property.property_type.replace("_", " ")}</Badge>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-brand-muted">
                Property ID: <span className="text-brand-text">{params.propertyId}</span>
              </p>
            )}
          </Card>
        </aside>
      </div>
    </main>
  );
}

export default function ApplyPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-brand-background text-brand-text">
        <Navbar />
        <ApplicationForm />
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
