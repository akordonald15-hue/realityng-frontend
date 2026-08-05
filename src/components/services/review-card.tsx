"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { ReviewStatusBadge } from "@/components/services/review-status-badge";
import { StarRating } from "@/components/services/star-rating";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  flagServiceReview,
  respondToServiceReview,
  type ServiceReview,
  type ServiceReviewFlagReason,
} from "@/lib/api/services";

export function ReviewCard({
  mode = "public",
  review,
}: {
  mode?: "public" | "customer" | "provider" | "admin";
  review: ServiceReview;
}) {
  const queryClient = useQueryClient();
  const [responseText, setResponseText] = useState("");
  const responseMutation = useMutation({
    mutationFn: () => respondToServiceReview(review.id, responseText),
    onSuccess: () => {
      setResponseText("");
      queryClient.invalidateQueries({ queryKey: ["provider-service-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["service-provider-reviews"] });
    },
  });
  const flagMutation = useMutation({
    mutationFn: (reason: ServiceReviewFlagReason) => flagServiceReview(review.id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-service-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["service-provider-reviews"] });
    },
  });

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <StarRating readOnly value={review.rating} />
          <h3 className="mt-3 font-heading text-2xl font-semibold text-brand-text">
            {review.title}
          </h3>
          <p className="mt-1 text-sm text-brand-muted">
            {review.reviewer_label} · {new Date(review.created_at).toLocaleDateString("en-NG")}
          </p>
        </div>
        {review.status && mode !== "public" ? <ReviewStatusBadge status={review.status} /> : null}
      </div>

      <p className="mt-4 text-sm leading-6 text-brand-muted">{review.comment}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-brand-muted">
        <span>Verified booking</span>
        {review.would_recommend ? <span>Would recommend</span> : null}
        {review.booking?.title ? <span>{review.booking.title}</span> : null}
      </div>

      {review.provider_response ? (
        <div className="mt-4 rounded-md border border-brand-secondary/20 bg-brand-secondary/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-secondary">
            Provider response
          </p>
          <p className="mt-2 text-sm leading-6 text-brand-muted">{review.provider_response}</p>
        </div>
      ) : null}

      {mode === "provider" && review.status === "published" && !review.provider_response ? (
        <div className="mt-4 grid gap-3">
          <textarea
            className="min-h-24 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
            maxLength={800}
            onChange={(event) => setResponseText(event.target.value)}
            placeholder="Write one public response"
            value={responseText}
          />
          {responseMutation.isError ? (
            <FormMessage tone="error">{getApiErrorMessage(responseMutation.error)}</FormMessage>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={responseMutation.isPending || responseText.trim().length < 2}
              onClick={() => responseMutation.mutate()}
            >
              Respond
            </Button>
            <Button
              disabled={flagMutation.isPending}
              onClick={() => flagMutation.mutate("privacy_concern")}
              variant="secondary"
            >
              Flag review
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
