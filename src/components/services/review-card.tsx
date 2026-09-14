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
  variant = "reality",
  review,
}: {
  mode?: "public" | "customer" | "provider" | "admin";
  variant?: "legacy" | "reality";
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

  const isReality = variant === "reality";

  return (
    <Card className="p-5" variant={isReality ? "reality" : "legacy"}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <StarRating readOnly value={review.rating} />
          <h3
            className={
              isReality
                ? "mt-3 font-display text-2xl font-semibold text-reality-text-primary"
                : "mt-3 font-display text-2xl font-semibold text-reality-text-primary"
            }
          >
            {review.title}
          </h3>
          <p className={isReality ? "mt-1 text-sm text-reality-text-secondary" : "mt-1 text-sm text-reality-text-secondary"}>
            {review.reviewer_label} · {new Date(review.created_at).toLocaleDateString("en-NG")}
          </p>
        </div>
        {review.status && mode !== "public" ? <ReviewStatusBadge status={review.status} /> : null}
      </div>

      <p className={isReality ? "mt-4 text-sm leading-6 text-reality-text-secondary" : "mt-4 text-sm leading-6 text-reality-text-secondary"}>
        {review.comment}
      </p>
      <div className={isReality ? "mt-4 flex flex-wrap gap-2 text-xs text-reality-text-secondary" : "mt-4 flex flex-wrap gap-2 text-xs text-reality-text-secondary"}>
        <span>Verified booking</span>
        {review.would_recommend ? <span>Would recommend</span> : null}
        {review.booking?.title ? <span>{review.booking.title}</span> : null}
      </div>

      {review.provider_response ? (
        <div
          className={
            isReality
              ? "mt-4 rounded-[18px] border border-reality-brand-500/20 bg-reality-brand-50 p-4"
              : "mt-4 rounded-md border border-brand-secondary/20 bg-brand-secondary/10 p-4"
          }
        >
          <p className={isReality ? "text-xs font-bold uppercase tracking-wide text-reality-brand-600" : "text-xs font-bold uppercase tracking-wide text-reality-brand-600"}>
            Provider response
          </p>
          <p className={isReality ? "mt-2 text-sm leading-6 text-reality-text-secondary" : "mt-2 text-sm leading-6 text-reality-text-secondary"}>
            {review.provider_response}
          </p>
        </div>
      ) : null}

      {mode === "provider" && review.status === "published" && !review.provider_response ? (
        <div className="mt-4 grid gap-3">
          <textarea
            className="min-h-24 rounded-md border border-reality-border-secondary bg-reality-bg-subtle px-3 py-2 text-sm text-reality-text-primary outline-none focus:border-reality-brand-500 focus:ring-2 focus:ring-reality-brand-500/15"
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


