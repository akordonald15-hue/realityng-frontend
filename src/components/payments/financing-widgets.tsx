import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  FinancingApplication,
  FinancingApplicationStatus,
  FinancingOffer,
  FinancingProduct,
} from "@/lib/api/financing";

const statusLabels: Record<FinancingApplicationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  partner_review: "Partner Review",
  more_information_requested: "More Information Requested",
  offer_received: "Offer Received",
  offer_accepted: "Offer Accepted",
  offer_declined: "Offer Declined",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
};

export function FinancingStatusBadge({ status }: { status: FinancingApplicationStatus }) {
  const variant =
    status === "offer_accepted" ? "green" : status === "rejected" ? "muted" : "gold";
  return <Badge variant={variant}>{statusLabels[status]}</Badge>;
}

export function FinancingProductCard({
  product,
  onSelect,
}: {
  product: FinancingProduct;
  onSelect?: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">
            {product.product_type.replaceAll("_", " ")}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-brand-text">{product.name}</h3>
          <p className="mt-1 text-sm text-brand-muted">{product.description}</p>
          <p className="mt-2 text-xs text-brand-muted">
            {product.currency} {product.minimum_amount} - {product.maximum_amount} ·{" "}
            {product.minimum_tenor_months}-{product.maximum_tenor_months} months
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            Partner: {product.partner.name} ({product.partner.integration_mode})
          </p>
        </div>
        {onSelect ? <Button onClick={onSelect}>Start application</Button> : null}
      </div>
    </Card>
  );
}

export function FinancingApplicationCard({ application }: { application: FinancingApplication }) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">
            {application.application_reference}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-brand-text">
            {application.product.name}
          </h3>
          <p className="mt-1 text-sm text-brand-muted">
            {application.currency} {application.requested_amount} ·{" "}
            {application.preferred_tenor_months} months · {application.partner.name}
          </p>
        </div>
        <FinancingStatusBadge status={application.status} />
      </div>
    </Card>
  );
}

export function FinancingDocumentChecklist({ application }: { application: FinancingApplication }) {
  const uploadedTypes = new Set(application.documents.map((document) => document.document_type));
  const requirements = application.product.document_requirements;

  return (
    <Card className="p-4">
      <h2 className="text-base font-semibold text-brand-text">Document checklist</h2>
      <div className="mt-3 grid gap-2">
        {requirements.length === 0 ? (
          <p className="text-sm text-brand-muted">
            RealityNG operations will confirm document requirements for this partner.
          </p>
        ) : (
          requirements.map((requirement) => (
            <div
              className="flex items-center justify-between rounded-md border border-white/10 p-3"
              key={requirement.id}
            >
              <div>
                <p className="font-medium text-brand-text">
                  {requirement.document_type.replaceAll("_", " ")}
                </p>
                <p className="text-xs text-brand-muted">{requirement.description}</p>
              </div>
              <Badge variant={uploadedTypes.has(requirement.document_type) ? "green" : "muted"}>
                {uploadedTypes.has(requirement.document_type) ? "Uploaded" : "Required"}
              </Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export function FinancingOfferCard({
  offer,
  onAccept,
  onDecline,
  isPending,
}: {
  offer: FinancingOffer;
  onAccept?: () => void;
  onDecline?: () => void;
  isPending?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">
            {offer.partner.name}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-brand-text">
            {offer.currency} {offer.approved_amount}
          </h3>
          <p className="mt-1 text-sm text-brand-muted">
            {offer.tenor_months} months · {offer.interest_rate_display || "Partner terms"}
          </p>
          {offer.partner_terms_summary ? (
            <p className="mt-2 text-sm text-brand-muted">{offer.partner_terms_summary}</p>
          ) : null}
        </div>
        <Badge variant={offer.status === "accepted" ? "green" : "gold"}>{offer.status}</Badge>
      </div>
      {offer.status === "active" && (onAccept || onDecline) ? (
        <div className="mt-4 flex gap-2">
          {onAccept ? (
            <Button disabled={isPending} onClick={onAccept}>
              Accept offer
            </Button>
          ) : null}
          {onDecline ? (
            <Button disabled={isPending} variant="secondary" onClick={onDecline}>
              Decline
            </Button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
