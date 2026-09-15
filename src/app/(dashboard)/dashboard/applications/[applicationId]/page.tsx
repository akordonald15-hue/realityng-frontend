"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { FormMessage } from "@/components/forms/form-message";
import { PageContainer } from "@/components/layout/page-container";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ModalShell } from "@/components/ui/modal-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { applicationStatusTone } from "@/components/dashboard/application-request-card";
import {
  approveApplication,
  formatApplicationStatus,
  getApplication,
  markApplicationUnderReview,
  rejectApplication,
  updateApplicationNotes,
  withdrawApplication,
  type RentalApplication,
  type RentalApplicationStatus,
} from "@/lib/api/applications";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/providers/auth-provider";

type DetailRow = {
  label: string;
  value?: string | null;
};

const statusCopy: Record<RentalApplicationStatus, { title: string; description: string }> = {
  submitted: {
    title: "Application pending",
    description: "Your application has been submitted and is waiting for review.",
  },
  under_review: {
    title: "Application pending",
    description: "RealityNG or the property representative is reviewing your application.",
  },
  approved: {
    title: "Application approved",
    description: "Your application has been approved. Continue with the supported next steps.",
  },
  rejected: {
    title: "Application declined",
    description: "This application was not approved. You can continue exploring available homes.",
  },
  withdrawn: {
    title: "Application withdrawn",
    description: "This application has been withdrawn and no longer requires action.",
  },
};

function formatDate(value?: string | null) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(date);
}

function formatMoney(value?: string | null, currency = "NGN") {
  if (!value) {
    return null;
  }
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return null;
  }
  return new Intl.NumberFormat("en-NG", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

function formatListingType(value?: string | null) {
  return value ? value.replaceAll("_", " ") : null;
}

function propertyPrice(application: RentalApplication) {
  const price = formatMoney(application.property.price, application.property.currency);
  if (!price) {
    return "Price on request";
  }
  return application.property.listing_type === "rent" ? `${price}/year` : price;
}

function DetailRows({ rows }: { rows: DetailRow[] }) {
  const visibleRows = rows.filter((row) => row.value);
  if (visibleRows.length === 0) {
    return null;
  }

  return (
    <dl className="space-y-[10px]">
      {visibleRows.map((row) => (
        <div className="flex items-start justify-between gap-5" key={row.label}>
          <dt className="text-sm leading-5 text-reality-text-quaternary">{row.label}</dt>
          <dd className="max-w-[60%] text-right text-sm font-medium leading-5 text-reality-text-primary">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ApplicationDetailSkeleton() {
  return (
    <Card className="rounded-[28px] p-6" variant="reality">
      <div className="h-44 animate-pulse rounded-[24px] bg-reality-bg-muted" />
      <div className="mt-6 space-y-3">
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-reality-bg-muted" />
        <div className="h-4 w-full animate-pulse rounded-full bg-reality-bg-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-reality-bg-muted" />
      </div>
    </Card>
  );
}

function PropertySummary({ application }: { application: RentalApplication }) {
  const property = application.property;
  const location = [property.city, property.state].filter(Boolean).join(", ");
  const facts = [
    formatListingType(property.property_type),
    formatListingType(property.listing_type),
    location,
  ].filter(Boolean);

  return (
    <section aria-labelledby="application-property">
      <div className="relative h-[199px] overflow-hidden rounded-[32px] bg-reality-bg-muted">
        {property.cover_image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            alt=""
            className="h-full w-full object-cover"
            decoding="async"
            loading="eager"
            src={property.cover_image_url}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-reality-brand-600">
            RealityNG
          </div>
        )}
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1
            className="min-w-0 text-[26px] font-semibold leading-[30px] text-reality-text-primary"
            id="application-property"
          >
            {propertyPrice(application)}
          </h1>
          <StatusChip tone={applicationStatusTone(application.status)}>
            {formatApplicationStatus(application.status)}
          </StatusChip>
        </div>
        {facts.length > 0 ? (
          <p className="text-sm capitalize leading-6 text-reality-text-secondary">
            {facts.join(" • ")}
          </p>
        ) : null}
        <p className="text-base font-medium leading-6 text-reality-text-primary">
          {property.title}
        </p>
      </div>
    </section>
  );
}

function PaymentSummary({ application }: { application: RentalApplication }) {
  const amount = formatMoney(application.property.price, application.property.currency);
  if (application.status !== "approved" || !amount) {
    return null;
  }

  return (
    <section aria-labelledby="payment-summary" className="space-y-4">
      <h2
        className="text-base font-semibold leading-6 text-reality-text-primary"
        id="payment-summary"
      >
        Payment summary
      </h2>
      <DetailRows rows={[{ label: "Property amount", value: amount }]} />
      <p className="text-xs leading-5 text-reality-text-quaternary">
        Additional fees and transaction totals are shown only when a linked payment transaction is
        available.
      </p>
    </section>
  );
}

function ApplicantApplicationActions({
  application,
  isWithdrawing,
  onWithdraw,
}: {
  application: RentalApplication;
  isWithdrawing: boolean;
  onWithdraw: () => void;
}) {
  const propertyHref = application.property.slug
    ? `/properties/${application.property.slug}`
    : "/properties";
  const canWithdraw = application.status === "submitted" || application.status === "under_review";

  if (application.status === "approved") {
    return (
      <div className="grid gap-3">
        <Link className={buttonClasses("reality", "h-12 w-full")} href="/dashboard/transactions">
          View transactions
        </Link>
        <Link
          className={buttonClasses("realitySecondary", "h-12 w-full")}
          href="/dashboard/financing"
        >
          Need help paying
        </Link>
        <Link className={buttonClasses("realityGhost", "h-11 w-full")} href={propertyHref}>
          View property
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {canWithdraw ? (
        <Button
          className="h-12 w-full"
          disabled={isWithdrawing}
          onClick={onWithdraw}
          variant="reality"
        >
          {isWithdrawing ? "Withdrawing..." : "Withdraw application"}
        </Button>
      ) : null}
      <Link
        className={buttonClasses(canWithdraw ? "realitySecondary" : "reality", "h-12 w-full")}
        href={propertyHref}
      >
        View property
      </Link>
      {!canWithdraw ? (
        <Link className={buttonClasses("realityGhost", "h-11 w-full")} href="/properties">
          Browse properties
        </Link>
      ) : null}
    </div>
  );
}

type SupplyDecision = "under_review" | "approved" | "rejected";

const decisionCopy: Record<SupplyDecision, { title: string; description: string; label: string }> =
  {
    under_review: {
      title: "Mark application under review?",
      description: "This tells the applicant their submission is being reviewed.",
      label: "Mark under review",
    },
    approved: {
      title: "Approve application?",
      description:
        "This records the application as approved. Payment or transaction steps are not changed here.",
      label: "Approve application",
    },
    rejected: {
      title: "Reject application?",
      description: "This records the application as rejected and cannot be undone from this screen.",
      label: "Reject application",
    },
  };

function DecisionConfirmation({
  decision,
  isSubmitting,
  onCancel,
  onConfirm,
}: {
  decision: SupplyDecision;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const copy = decisionCopy[decision];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-8">
      <ModalShell className="max-w-md" description={copy.description} title={copy.title}>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isSubmitting} onClick={onCancel} variant="realitySecondary">
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={onConfirm} variant="reality">
            {isSubmitting ? "Saving..." : copy.label}
          </Button>
        </div>
      </ModalShell>
    </div>
  );
}

function SupplyDecisionActions({
  application,
  isSubmitting,
  onDecision,
}: {
  application: RentalApplication;
  isSubmitting: boolean;
  onDecision: (decision: SupplyDecision) => void;
}) {
  if (application.status === "submitted") {
    return (
      <Button
        className="h-12 w-full"
        disabled={isSubmitting}
        onClick={() => onDecision("under_review")}
        variant="reality"
      >
        Mark under review
      </Button>
    );
  }

  if (application.status === "under_review") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          className="h-12 w-full"
          disabled={isSubmitting}
          onClick={() => onDecision("approved")}
          variant="reality"
        >
          Approve application
        </Button>
        <Button
          className="h-12 w-full"
          disabled={isSubmitting}
          onClick={() => onDecision("rejected")}
          variant="realityDestructive"
        >
          Reject application
        </Button>
      </div>
    );
  }

  return (
    <p className="rounded-[20px] border border-reality-border-secondary bg-reality-surfaceMuted px-4 py-3 text-sm leading-6 text-reality-text-secondary">
      This application is {formatApplicationStatus(application.status).toLowerCase()} and has no
      available decision actions.
    </p>
  );
}

function ApplicantApplicationDetail({
  application,
  isWithdrawing,
  onWithdraw,
  withdrawError,
}: {
  application: RentalApplication;
  isWithdrawing: boolean;
  onWithdraw: () => void;
  withdrawError?: unknown;
}) {
  const copy = statusCopy[application.status];
  const detailRows: DetailRow[] = [
    { label: "Application ID", value: application.id },
    { label: "Date submitted", value: formatDate(application.created_at) },
    { label: "Last updated", value: formatDate(application.updated_at) },
    { label: "Move-in date", value: formatDate(application.move_in_date) },
    { label: "Status", value: formatApplicationStatus(application.status) },
    { label: "Employment", value: application.employment_status },
    { label: "Employer", value: application.employer_name },
    {
      label: "Monthly income",
      value: formatMoney(application.monthly_income, application.property.currency),
    },
  ];

  return (
    <article className="reality-reveal space-y-10">
      <PropertySummary application={application} />
      <section aria-labelledby="application-state" className="space-y-3">
        <h2
          className="text-base font-semibold leading-6 text-reality-text-primary"
          id="application-state"
        >
          {copy.title}
        </h2>
        <p className="text-sm leading-6 text-reality-text-secondary">{copy.description}</p>
      </section>
      <section aria-labelledby="application-details" className="space-y-4">
        <h2
          className="text-base font-semibold leading-6 text-reality-text-primary"
          id="application-details"
        >
          Application details
        </h2>
        <DetailRows rows={detailRows} />
      </section>
      <PaymentSummary application={application} />
      {withdrawError ? (
        <FormMessage tone="error" variant="reality">
          {getApiErrorMessage(withdrawError)}
        </FormMessage>
      ) : null}
      <ApplicantApplicationActions
        application={application}
        isWithdrawing={isWithdrawing}
        onWithdraw={onWithdraw}
      />
    </article>
  );
}

function SupplyApplicationDetail({ application }: { application: RentalApplication }) {
  const queryClient = useQueryClient();
  const [pendingDecision, setPendingDecision] = useState<SupplyDecision | null>(null);
  const [ownerNotes, setOwnerNotes] = useState(application.owner_notes ?? "");
  const [notesSaved, setNotesSaved] = useState(false);
  const propertyHref = application.property.slug
    ? `/properties/${application.property.slug}`
    : "/properties";

  const decisionMutation = useMutation({
    mutationFn: (decision: SupplyDecision) => {
      if (decision === "under_review") {
        return markApplicationUnderReview(application.id);
      }
      if (decision === "approved") {
        return approveApplication(application.id);
      }
      return rejectApplication(application.id);
    },
    onSuccess: async (updatedApplication) => {
      queryClient.setQueryData(["applications", application.id], updatedApplication);
      await queryClient.invalidateQueries({ queryKey: ["applications", application.id] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      setPendingDecision(null);
    },
  });

  const notesMutation = useMutation({
    mutationFn: () => updateApplicationNotes({ applicationId: application.id, ownerNotes }),
    onSuccess: async (updatedApplication) => {
      queryClient.setQueryData(["applications", application.id], updatedApplication);
      await queryClient.invalidateQueries({ queryKey: ["applications", application.id] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      setOwnerNotes(updatedApplication.owner_notes ?? "");
      setNotesSaved(true);
    },
  });

  const applicantRows: DetailRow[] = [
    { label: "Name", value: application.full_name || application.applicant.full_name },
    { label: "Email", value: application.email || application.applicant.email },
    { label: "Phone", value: application.phone || application.applicant.phone_number },
    { label: "Message", value: application.message },
  ];
  const detailRows: DetailRow[] = [
    { label: "Application ID", value: application.id },
    { label: "Date submitted", value: formatDate(application.created_at) },
    { label: "Last updated", value: formatDate(application.updated_at) },
    { label: "Move-in date", value: formatDate(application.move_in_date) },
    { label: "Status", value: formatApplicationStatus(application.status) },
  ];
  const employmentRows: DetailRow[] = [
    { label: "Employment", value: application.employment_status },
    { label: "Employer", value: application.employer_name },
    {
      label: "Monthly income",
      value: formatMoney(application.monthly_income, application.property.currency),
    },
  ];

  return (
    <article className="reality-reveal space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-reality-brand-600">
            Applications &amp; Requests
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium leading-tight text-reality-text-primary">
            Application Details
          </h1>
        </div>
        <StatusChip tone={applicationStatusTone(application.status)}>
          {formatApplicationStatus(application.status)}
        </StatusChip>
      </div>

      <Card className="border-reality-brand-300 bg-reality-surfaceBrand p-5 sm:p-6" variant="realityElevated">
        <PropertySummary application={application} />
        <Link className={buttonClasses("realityGhost", "mt-5 h-11 w-full")} href={propertyHref}>
          View property
        </Link>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6" variant="reality">
          <h2 className="mb-4 text-base font-semibold text-reality-text-primary">
            Applicant information
          </h2>
          <DetailRows rows={applicantRows} />
        </Card>
        <Card className="p-5 sm:p-6" variant="reality">
          <h2 className="mb-4 text-base font-semibold text-reality-text-primary">
            Application details
          </h2>
          <DetailRows rows={detailRows} />
        </Card>
        <Card className="p-5 sm:p-6" variant="reality">
          <h2 className="mb-4 text-base font-semibold text-reality-text-primary">
            Employment and income
          </h2>
          <DetailRows rows={employmentRows} />
        </Card>
        <Card className="bg-reality-surfaceMuted p-5 sm:p-6" variant="reality">
          <h2 className="mb-4 text-base font-semibold text-reality-text-primary">Decision</h2>
          <SupplyDecisionActions
            application={application}
            isSubmitting={decisionMutation.isPending}
            onDecision={setPendingDecision}
          />
          {decisionMutation.isError ? (
            <FormMessage className="mt-4" tone="error" variant="reality">
              {getApiErrorMessage(decisionMutation.error)}
            </FormMessage>
          ) : null}
        </Card>
      </div>

      <Card className="bg-reality-surface p-5 sm:p-6" variant="realityElevated">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setNotesSaved(false);
            notesMutation.mutate();
          }}
        >
          <label className="block">
            <span className="text-sm font-semibold text-reality-text-primary">Owner notes</span>
            <textarea
              className="mt-3 min-h-32 w-full rounded-[20px] border border-reality-border-secondary bg-white px-4 py-3 text-sm leading-6 text-reality-text-primary outline-none transition placeholder:text-reality-text-quaternary focus:border-reality-brand-500 focus:ring-2 focus:ring-reality-brand-500/20"
              onChange={(event) => {
                setOwnerNotes(event.target.value);
                setNotesSaved(false);
              }}
              placeholder="Add private notes for your application review"
              value={ownerNotes}
            />
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              disabled={notesMutation.isPending || ownerNotes === (application.owner_notes ?? "")}
              type="submit"
              variant="reality"
            >
              {notesMutation.isPending ? "Saving..." : "Save notes"}
            </Button>
            {notesSaved ? (
              <FormMessage tone="success" variant="reality">
                Notes saved.
              </FormMessage>
            ) : null}
          </div>
          {notesMutation.isError ? (
            <FormMessage className="mt-4" tone="error" variant="reality">
              {getApiErrorMessage(notesMutation.error)}
            </FormMessage>
          ) : null}
        </form>
      </Card>

      {pendingDecision ? (
        <DecisionConfirmation
          decision={pendingDecision}
          isSubmitting={decisionMutation.isPending}
          onCancel={() => setPendingDecision(null)}
          onConfirm={() => decisionMutation.mutate(pendingDecision)}
        />
      ) : null}
    </article>
  );
}

export default function ApplicationDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const applicationId = params.applicationId;
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  const applicationQuery = useQuery({
    queryKey: ["applications", applicationId],
    queryFn: () => getApplication(applicationId),
    enabled: Boolean(applicationId),
    retry: false,
  });

  const withdrawMutation = useMutation({
    mutationFn: withdrawApplication,
    onSuccess: async (application) => {
      await queryClient.invalidateQueries({ queryKey: ["applications", applicationId] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      queryClient.setQueryData(["applications", application.id], application);
    },
  });

  const application = applicationQuery.data;
  const viewerIsApplicant = Boolean(user && application?.applicant.id === user.id);
  const viewerCanReviewApplication = Boolean(application?.can_manage_application);

  return (
    <main className="min-h-screen bg-reality-canvas pb-20 pt-6 text-reality-text-primary lg:pt-10">
      <PageContainer size="reality">
        <Link
          aria-label="Back to dashboard requests"
          className="inline-flex text-sm font-semibold text-reality-text-tertiary transition hover:text-reality-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-4"
          href="/dashboard"
        >
          Back
        </Link>

        <div
          className={
            viewerCanReviewApplication
              ? "mx-auto mt-8 w-full max-w-[1040px] md:mt-14"
              : "mx-auto mt-8 w-full max-w-[426px] md:mt-20"
          }
        >
          {applicationQuery.isLoading || authLoading ? (
            <ApplicationDetailSkeleton />
          ) : applicationQuery.isError ? (
            <Card className="rounded-[28px] p-6" variant="reality">
              <FormMessage tone="error" variant="reality">
                {getApiErrorMessage(applicationQuery.error)}
              </FormMessage>
              <Link
                className={buttonClasses("realitySecondary", "mt-5 h-11 w-full")}
                href="/dashboard"
              >
                Return to dashboard
              </Link>
            </Card>
          ) : application && viewerCanReviewApplication ? (
            <SupplyApplicationDetail application={application} />
          ) : application && viewerIsApplicant ? (
            <ApplicantApplicationDetail
                application={application}
                isWithdrawing={withdrawMutation.isPending}
                onWithdraw={() => withdrawMutation.mutate(application.id)}
                withdrawError={withdrawMutation.isError ? withdrawMutation.error : undefined}
              />
          ) : (
            <Card
              className="rounded-[28px] p-6 text-sm text-reality-text-quaternary"
              variant="reality"
            >
              This application is unavailable or you do not have access to view it.
            </Card>
          )}
        </div>
      </PageContainer>
    </main>
  );
}
