"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { PageContainer } from "@/components/layout/page-container";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { applicationStatusTone } from "@/components/dashboard/application-request-card";
import {
  formatApplicationStatus,
  getApplication,
  withdrawApplication,
  type RentalApplication,
  type RentalApplicationStatus,
} from "@/lib/api/applications";
import { getApiErrorMessage } from "@/lib/api/errors";

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

function ApplicationActions({
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

export default function ApplicationDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const applicationId = params.applicationId;
  const queryClient = useQueryClient();

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
  const copy = application ? statusCopy[application.status] : null;
  const detailRows: DetailRow[] = application
    ? [
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
      ]
    : [];

  return (
    <main className="min-h-screen bg-reality-bg-primary pb-20 pt-6 text-reality-text-primary lg:pt-10">
      <PageContainer size="reality">
        <Link
          aria-label="Back to dashboard requests"
          className="inline-flex text-sm font-semibold text-reality-text-tertiary transition hover:text-reality-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-4"
          href="/dashboard"
        >
          Back
        </Link>

        <div className="mx-auto mt-8 w-full max-w-[426px] md:mt-20">
          {applicationQuery.isLoading ? (
            <Card
              className="rounded-[28px] p-6 text-sm text-reality-text-quaternary"
              variant="reality"
            >
              Loading application details...
            </Card>
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
          ) : application && copy ? (
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
              {withdrawMutation.isError ? (
                <FormMessage tone="error" variant="reality">
                  {getApiErrorMessage(withdrawMutation.error)}
                </FormMessage>
              ) : null}
              <ApplicationActions
                application={application}
                isWithdrawing={withdrawMutation.isPending}
                onWithdraw={() => withdrawMutation.mutate(application.id)}
              />
            </article>
          ) : (
            <Card
              className="rounded-[28px] p-6 text-sm text-reality-text-quaternary"
              variant="reality"
            >
              Application not found.
            </Card>
          )}
        </div>
      </PageContainer>
    </main>
  );
}
