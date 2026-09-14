"use client";

import Link from "next/link";
import { clsx } from "clsx";

import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import type { RentalApplication, RentalApplicationStatus } from "@/lib/api/applications";
import { formatApplicationStatus } from "@/lib/api/applications";
import type { Inquiry, InquiryStatus } from "@/lib/api/inquiries";
import { formatInquiryStatus } from "@/lib/api/inquiries";
import type { Viewing, ViewingStatus } from "@/lib/api/viewings";
import { formatViewingStatus, formatViewingType } from "@/lib/api/viewings";

export type ApplicationRequestItem = RentalApplication | Inquiry | Viewing;
export type ApplicationRequestType = "application" | "inquiry" | "viewing";

export function applicationStatusTone(
  status: RentalApplicationStatus | InquiryStatus | ViewingStatus | string,
) {
  if (["approved", "converted", "confirmed", "completed"].includes(status)) {
    return "approved" as const;
  }
  if (["rejected", "closed", "cancelled", "withdrawn", "declined"].includes(status)) {
    return "rejected" as const;
  }
  if (["submitted", "under_review", "new", "requested", "scheduled", "pending"].includes(status)) {
    return "pending" as const;
  }
  return "neutral" as const;
}

function formatSummaryPrice(property: ApplicationRequestItem["property"]) {
  const amount = Number(property.price);
  if (!Number.isFinite(amount)) {
    return "Price on request";
  }
  const price = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: property.currency || "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
  return property.listing_type === "rent" ? `${price}/year` : price;
}

function requestMeta(item: ApplicationRequestItem, type: ApplicationRequestType) {
  if (type === "application") {
    const application = item as RentalApplication;
    return {
      label: "Application",
      status: application.status,
      statusLabel: formatApplicationStatus(application.status),
      description: `Submitted ${new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
      }).format(new Date(application.created_at))}`,
    };
  }

  if (type === "inquiry") {
    const inquiry = item as Inquiry;
    return {
      label: "Request",
      status: inquiry.status,
      statusLabel: formatInquiryStatus(inquiry.status),
      description: inquiry.message || "Inquiry sent to the property representative.",
    };
  }

  const viewing = item as Viewing;
  return {
    label: "Viewing",
    status: viewing.status,
    statusLabel: formatViewingStatus(viewing.status),
    description: `${formatViewingType(viewing.viewing_type)} request`,
  };
}

export function ApplicationRequestCard({
  className,
  href,
  item,
  type,
}: {
  className?: string;
  href?: string;
  item: ApplicationRequestItem;
  type: ApplicationRequestType;
}) {
  const property = item.property;
  const meta = requestMeta(item, type);
  const content = (
    <Card
      className="reality-card-hover flex w-[314px] shrink-0 flex-col gap-4 border-0 p-0"
      variant="reality"
    >
      <div className="relative h-[286px] overflow-hidden rounded-[32px] bg-reality-bg-muted">
        {property.cover_image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            alt=""
            className="h-full w-full object-cover transition duration-500 motion-safe:group-hover:scale-105"
            decoding="async"
            loading="lazy"
            src={property.cover_image_url}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-reality-brand-600">
            RealityNG
          </div>
        )}
        <StatusChip
          className="absolute left-4 top-4 backdrop-blur-sm"
          tone={applicationStatusTone(meta.status)}
        >
          {meta.statusLabel}
        </StatusChip>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#bc8936]">{meta.label}</p>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold leading-8 text-black">
              {formatSummaryPrice(property)}
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-reality-text-secondary">
              {property.title}
            </p>
          </div>
        </div>
        <p className="line-clamp-2 text-sm leading-5 text-reality-text-quaternary">
          {meta.description}
        </p>
        {href ? (
          <span className="inline-flex pt-1 text-sm font-semibold text-reality-brand-600">
            View details
          </span>
        ) : null}
      </div>
    </Card>
  );

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link
      className={clsx(
        "group block rounded-[32px] focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-4",
        className,
      )}
      href={href}
    >
      {content}
    </Link>
  );
}

