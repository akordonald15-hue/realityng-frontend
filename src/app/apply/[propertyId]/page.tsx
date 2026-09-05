"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FormMessage } from "@/components/forms/form-message";
import { PageContainer } from "@/components/layout/page-container";
import { PublicShell } from "@/components/layout/public-shell";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SuccessState } from "@/components/ui/success-state";
import { createApplication } from "@/lib/api/applications";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getPublicProperty } from "@/lib/api/properties";
import type { Property } from "@/lib/api/properties";
import { formatPrice, formatPropertyType } from "@/lib/properties/format";
import { useAuth } from "@/providers/auth-provider";

type FieldErrors = Partial<
  Record<
    | "fullName"
    | "email"
    | "phone"
    | "employmentStatus"
    | "employerName"
    | "monthlyIncome"
    | "moveInDate"
    | "message",
    string
  >
>;

const employmentOptions = ["Full-time", "Part-time", "Self-employed", "Contract", "Employed"];

const incomeOptions = [
  { label: "Select monthly income", value: "" },
  { label: "Below N250,000 monthly", value: "250000" },
  { label: "N250,000 - N500,000 monthly", value: "500000" },
  { label: "N500,000 - N1,000,000 monthly", value: "900000" },
  { label: "Above N1,000,000 monthly", value: "1200000" },
];

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 20S4.5 15.5 4.5 9.5A4.25 4.25 0 0 1 12 6.75A4.25 4.25 0 0 1 19.5 9.5C19.5 15.5 12 20 12 20Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 fill-reality-brand-500 text-reality-brand-500"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2L20 5.5V11.4C20 16.2 16.6 20.5 12 22C7.4 20.5 4 16.2 4 11.4V5.5L12 2Z" />
      <path
        d="M8.5 12.1L10.7 14.3L15.8 9.2"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function defaultMoveInDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

function readableListingType(value?: string) {
  if (!value) {
    return "For property";
  }
  if (value === "sale") {
    return "For Sale";
  }
  if (value === "rent") {
    return "For Rent";
  }
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function displayLocation(property: Property) {
  return (
    property.display_location ||
    [property.neighborhood, property.city, property.state].filter(Boolean).join(", ") ||
    property.address ||
    "Location available on request"
  );
}

function propertyFacts(property: Property) {
  return [
    property.bedrooms ? `${property.bedrooms} bds` : null,
    property.bathrooms ? `${property.bathrooms} ba` : null,
    property.floor_area ? `${Number(property.floor_area).toLocaleString()} sqft` : null,
    property.land_size ? `${Number(property.land_size).toLocaleString()} sqm` : null,
  ].filter(Boolean);
}

function PropertySummary({
  compact = false,
  property,
}: {
  compact?: boolean;
  property?: Property;
}) {
  if (!property) {
    return (
      <Card
        className={compact ? "flex items-center gap-4 border-0 p-0" : "p-5"}
        variant={compact ? "reality" : "realityElevated"}
      >
        <div
          className={
            compact
              ? "h-[72px] w-[77px] shrink-0 rounded-[16px] bg-reality-bg-muted"
              : "h-[286px] w-full rounded-[32px] bg-reality-bg-muted"
          }
        />
        <div>
          <p className="text-sm text-reality-text-quaternary">Property summary unavailable</p>
          <p className="mt-1 text-sm text-reality-text-secondary">
            We will attach this application to the selected property.
          </p>
        </div>
      </Card>
    );
  }

  const facts = propertyFacts(property);
  const imageUrl = property.cover_image_url || property.image_gallery?.[0]?.image_url;

  return (
    <Card
      className={
        compact
          ? "flex items-center gap-4 border-0 p-0 shadow-none"
          : "w-full border-0 p-0 shadow-none"
      }
      variant="reality"
    >
      <div
        className={
          compact
            ? "relative h-[72px] w-[77px] shrink-0 overflow-hidden rounded-[16px] bg-reality-bg-muted"
            : "relative h-[286px] w-full overflow-hidden rounded-[32px] bg-reality-bg-muted"
        }
      >
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            alt=""
            className="h-full w-full object-cover"
            decoding="async"
            loading={compact ? "lazy" : "eager"}
            src={imageUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-reality-brand-600">
            RealityNG
          </div>
        )}
        {!compact ? (
          <>
            <span className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white">
              <HeartIcon />
            </span>
            <span className="absolute right-4 top-4 rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-black/70 backdrop-blur-sm">
              {formatPropertyType(property.property_type)}
            </span>
          </>
        ) : null}
      </div>
      <div className={compact ? "min-w-0 flex-1" : "mt-5"}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={compact ? "truncate text-base font-semibold" : "text-xl font-semibold"}>
              {formatPrice(property)}
            </p>
            <p className="sr-only">{property.title}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1 text-sm font-medium text-reality-text-secondary">
            <ShieldCheckIcon />
            <span>{readableListingType(property.listing_type)}</span>
          </div>
        </div>
        {facts.length ? (
          <div
            className={
              compact
                ? "mt-1 flex flex-wrap gap-x-2 gap-y-1 text-sm text-black"
                : "mt-1 flex flex-wrap gap-x-3 gap-y-1 text-base text-black"
            }
          >
            {facts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </div>
        ) : null}
        <p
          className={
            compact
              ? "mt-1 truncate text-sm text-reality-text-quaternary"
              : "mt-1 text-base text-reality-text-quaternary"
          }
        >
          {displayLocation(property)}
        </p>
      </div>
    </Card>
  );
}

type FieldProps = {
  children: React.ReactNode;
  error?: string;
  id: string;
  label: string;
  required?: boolean;
};

function Field({ children, error, id, label, required = false }: FieldProps) {
  return (
    <label className="block text-sm font-medium text-reality-text-secondary" htmlFor={id}>
      <span>
        {label} {required ? <span className="text-reality-brand-600">*</span> : null}
      </span>
      <div className="mt-2">{children}</div>
      {error ? (
        <span className="mt-1 block text-sm text-red-600" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </label>
  );
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
    retry: false,
  });
  const property = propertyQuery.data;
  const initialName =
    user?.full_name || `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const [employmentStatus, setEmploymentStatus] = useState("Full-time");
  const [employerName, setEmployerName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [moveInDate, setMoveInDate] = useState(() => defaultMoveInDate());
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const mutation = useMutation({
    mutationFn: () =>
      createApplication({
        property_id: params.propertyId,
        inquiry_id: inquiryId,
        viewing_id: viewingId,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        employment_status: employmentStatus,
        employer_name: employerName.trim(),
        monthly_income: monthlyIncome,
        move_in_date: moveInDate,
        message: message.trim(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      await queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });

  function validate() {
    const nextErrors: FieldErrors = {};
    if (!fullName.trim()) {
      nextErrors.fullName = "Enter your full name.";
    }
    if (!email.trim()) {
      nextErrors.email = "Enter your email address.";
    }
    if (!phone.trim()) {
      nextErrors.phone = "Enter your phone number.";
    }
    if (!employmentStatus) {
      nextErrors.employmentStatus = "Select your employment status.";
    }
    if (!employerName.trim()) {
      nextErrors.employerName = "Enter your employer name.";
    }
    if (!monthlyIncome) {
      nextErrors.monthlyIncome = "Select your income range.";
    }
    if (!moveInDate) {
      nextErrors.moveInDate = "Select your preferred move-in date.";
    }
    if (moveInDate && moveInDate < minDate) {
      nextErrors.moveInDate = "Choose today or a future date.";
    }
    if (!message.trim()) {
      nextErrors.message = "Add a short message for the property owner.";
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending || !validate()) {
      return;
    }
    mutation.mutate();
  }

  if (mutation.isSuccess) {
    return (
      <main className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-reality-bg-primary px-5 py-12">
        <Card
          aria-live="polite"
          className="w-full max-w-[448px] border-0 px-8 py-12 sm:px-12"
          role="status"
          variant="reality"
        >
          <SuccessState
            description={`Check your email address ${email} to track and manage your property application.`}
            title="Application submitted"
            actions={
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link className={buttonClasses("reality", "h-12")} href="/dashboard">
                  Go to dashboard
                </Link>
                {property?.slug ? (
                  <Link
                    className={buttonClasses("realitySecondary", "h-12")}
                    href={`/properties/${property.slug}`}
                  >
                    View property
                  </Link>
                ) : null}
              </div>
            }
          />
        </Card>
      </main>
    );
  }

  const applicationUnavailable =
    Boolean(propertySlug) && !propertyQuery.isLoading && propertyQuery.isError;

  return (
    <main className="bg-reality-bg-primary pb-16 pt-6 text-reality-text-primary lg:pb-24 lg:pt-8">
      <PageContainer>
        <Link
          className="inline-flex items-center gap-1 text-sm font-medium text-reality-text-tertiary transition hover:text-reality-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
          href={property?.slug ? `/properties/${property.slug}` : "/properties"}
        >
          <ArrowLeftIcon />
          Back
        </Link>

        <div className="reality-reveal mt-8 grid gap-8 lg:mt-[46px] lg:grid-cols-[minmax(0,538px)_425px] lg:justify-between">
          <div className="lg:hidden">
            {propertyQuery.isLoading ? (
              <div className="h-[72px] animate-pulse rounded-[16px] bg-reality-bg-muted" />
            ) : (
              <PropertySummary compact property={property} />
            )}
          </div>

          <section className="max-w-[538px]">
            <div className="max-w-[414px]">
              <h1 className="text-2xl font-medium leading-8 lg:text-3xl lg:leading-[38px]">
                Submit your application
              </h1>
              <p className="mt-3 text-sm leading-5 text-reality-text-quaternary lg:mt-4">
                An account will be created for you to track your application if you do not already
                have an account.
              </p>
            </div>

            {applicationUnavailable ? (
              <FormMessage className="mt-6" tone="error" variant="reality">
                Property could not be loaded. Return to the property page and try applying again.
              </FormMessage>
            ) : null}

            <form className="mt-6 grid gap-6" noValidate onSubmit={submitApplication}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field error={fieldErrors.fullName} id="full-name" label="Full name" required>
                  <Input
                    aria-describedby={fieldErrors.fullName ? "full-name-error" : undefined}
                    aria-invalid={Boolean(fieldErrors.fullName)}
                    autoComplete="name"
                    id="full-name"
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    value={fullName}
                    variant="reality"
                  />
                </Field>
                <Field error={fieldErrors.email} id="email" label="Email" required>
                  <Input
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                    aria-invalid={Boolean(fieldErrors.email)}
                    autoComplete="email"
                    id="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    variant="reality"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field error={fieldErrors.phone} id="phone" label="Phone" required>
                  <Input
                    aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    autoComplete="tel"
                    id="phone"
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+234..."
                    value={phone}
                    variant="reality"
                  />
                </Field>
                <Field
                  error={fieldErrors.employmentStatus}
                  id="employment-status"
                  label="Employment status"
                  required
                >
                  <Select
                    aria-describedby={
                      fieldErrors.employmentStatus ? "employment-status-error" : undefined
                    }
                    aria-invalid={Boolean(fieldErrors.employmentStatus)}
                    id="employment-status"
                    onChange={(event) => setEmploymentStatus(event.target.value)}
                    value={employmentStatus}
                    variant="reality"
                  >
                    {employmentOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  error={fieldErrors.employerName}
                  id="employer-name"
                  label="Employer name"
                  required
                >
                  <Input
                    aria-describedby={fieldErrors.employerName ? "employer-name-error" : undefined}
                    aria-invalid={Boolean(fieldErrors.employerName)}
                    id="employer-name"
                    onChange={(event) => setEmployerName(event.target.value)}
                    placeholder="e.g Dangote"
                    value={employerName}
                    variant="reality"
                  />
                </Field>
                <Field
                  error={fieldErrors.monthlyIncome}
                  id="monthly-income"
                  label="Monthly Income"
                  required
                >
                  <Select
                    aria-describedby={
                      fieldErrors.monthlyIncome ? "monthly-income-error" : undefined
                    }
                    aria-invalid={Boolean(fieldErrors.monthlyIncome)}
                    id="monthly-income"
                    onChange={(event) => setMonthlyIncome(event.target.value)}
                    value={monthlyIncome}
                    variant="reality"
                  >
                    {incomeOptions.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  error={fieldErrors.moveInDate}
                  id="move-in-date"
                  label="Preferred move-in date"
                  required
                >
                  <Input
                    aria-describedby={fieldErrors.moveInDate ? "move-in-date-error" : undefined}
                    aria-invalid={Boolean(fieldErrors.moveInDate)}
                    id="move-in-date"
                    min={minDate}
                    onChange={(event) => setMoveInDate(event.target.value)}
                    type="date"
                    value={moveInDate}
                    variant="reality"
                  />
                </Field>
              </div>

              <Field error={fieldErrors.message} id="message" label="Message" required>
                <textarea
                  aria-describedby={fieldErrors.message ? "message-error" : undefined}
                  aria-invalid={Boolean(fieldErrors.message)}
                  className="min-h-[151px] w-full rounded-[12px] border border-reality-border-secondary bg-white px-[14px] py-3 text-sm text-reality-text-primary shadow-reality-sm outline-none transition placeholder:text-reality-text-quaternary focus:border-reality-brand-500 focus:ring-2 focus:ring-reality-brand-500/15"
                  id="message"
                  maxLength={1200}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Additional message"
                  value={message}
                />
              </Field>

              {mutation.isError ? (
                <FormMessage tone="error" variant="reality">
                  {getApiErrorMessage(mutation.error)}
                </FormMessage>
              ) : null}

              <Button
                className="h-14 w-full"
                disabled={mutation.isPending || applicationUnavailable}
                type="submit"
                variant="reality"
              >
                {mutation.isPending ? "Submitting application..." : "Submit application"}
              </Button>
            </form>
          </section>

          <aside className="hidden lg:block">
            {propertyQuery.isLoading ? (
              <div className="h-[390px] animate-pulse rounded-[32px] bg-reality-bg-muted" />
            ) : (
              <PropertySummary property={property} />
            )}
          </aside>
        </div>
      </PageContainer>
    </main>
  );
}

export default function ApplyPage() {
  return (
    <ProtectedRoute>
      <PublicShell variant="reality" withFooter={false}>
        <ApplicationForm />
      </PublicShell>
    </ProtectedRoute>
  );
}
