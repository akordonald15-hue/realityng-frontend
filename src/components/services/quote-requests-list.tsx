"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { QuoteRequestStatusBadge } from "@/components/services/quote-request-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  adminCloseQuoteRequest,
  markQuoteRequestClosed,
  markQuoteRequestResponded,
  markQuoteRequestViewed,
  type QuoteRequest,
} from "@/lib/api/services";

export function QuoteRequestsList({
  requests,
  mode = "provider",
}: {
  requests: QuoteRequest[];
  mode?: "provider" | "admin";
}) {
  const queryClient = useQueryClient();
  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "viewed" | "responded" | "closed" }) => {
      if (mode === "admin") return adminCloseQuoteRequest(id);
      if (action === "viewed") return markQuoteRequestViewed(id);
      if (action === "responded") return markQuoteRequestResponded(id);
      return markQuoteRequestClosed(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-quote-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-quote-requests"] });
    },
  });

  if (requests.length === 0) {
    return (
      <Card className="p-5 text-sm text-brand-muted">
        Quote requests will appear here after customers contact a provider.
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {actionMutation.isError ? (
        <FormMessage tone="error">{getApiErrorMessage(actionMutation.error)}</FormMessage>
      ) : null}
      {requests.map((request) => (
        <Card className="p-5" key={request.id}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <QuoteRequestStatusBadge status={request.status} />
              <h2 className="mt-3 font-heading text-2xl font-semibold text-brand-text">
                {request.project_title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                {request.project_description}
              </p>
            </div>
            <div className="text-right text-sm text-brand-muted">
              <p>{new Date(request.created_at).toLocaleDateString("en-NG")}</p>
              <p>{request.preferred_contact_method}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 rounded-md border border-white/10 bg-white/5 p-4 text-sm text-brand-muted md:grid-cols-3">
            <span>{request.customer_name}</span>
            <span>{request.phone}</span>
            <span>{request.email}</span>
            <span>{[request.lga, request.state].filter(Boolean).join(", ")}</span>
            <span>{request.budget_range || "Budget not supplied"}</span>
            <span>
              {request.preferred_start_date
                ? new Date(request.preferred_start_date).toLocaleDateString("en-NG")
                : "Flexible start"}
            </span>
          </div>
          {mode === "admin" ? (
            <div className="mt-4">
              <p className="text-sm text-brand-muted">
                Provider: {request.provider.business_name}
              </p>
              <Button
                className="mt-3"
                disabled={actionMutation.isPending || request.status === "closed"}
                onClick={() => actionMutation.mutate({ id: request.id, action: "closed" })}
                variant="secondary"
              >
                Close request
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                disabled={actionMutation.isPending || request.status !== "submitted"}
                onClick={() => actionMutation.mutate({ id: request.id, action: "viewed" })}
                variant="secondary"
              >
                Mark viewed
              </Button>
              <Button
                disabled={actionMutation.isPending || ["responded", "closed"].includes(request.status)}
                onClick={() => actionMutation.mutate({ id: request.id, action: "responded" })}
              >
                Mark responded
              </Button>
              <Button
                disabled={actionMutation.isPending || request.status === "closed"}
                onClick={() => actionMutation.mutate({ id: request.id, action: "closed" })}
                variant="ghost"
              >
                Close
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
