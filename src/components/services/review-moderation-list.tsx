"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { ReviewCard } from "@/components/services/review-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/errors";
import { adminModerateServiceReview, type ServiceReview } from "@/lib/api/services";
import Link from "next/link";

export function ReviewModerationList({ reviews }: { reviews: ServiceReview[] }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      action,
      id,
      reason,
    }: {
      action: "publish" | "hide" | "restore" | "remove" | "mark-disputed";
      id: string;
      reason?: string;
    }) => adminModerateServiceReview(id, action, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-service-reviews"] }),
  });

  if (!reviews.length) {
    return <Card className="p-5 text-brand-muted">No reviews match this queue.</Card>;
  }

  return (
    <div className="grid gap-4">
      {mutation.isError ? (
        <FormMessage tone="error">{getApiErrorMessage(mutation.error)}</FormMessage>
      ) : null}
      {reviews.map((review) => (
        <div className="grid gap-3" key={review.id}>
          <ReviewCard mode="admin" review={review} />
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border border-white/10 px-4 text-sm font-semibold text-brand-text hover:bg-white/10"
              href={`/admin/services/reviews/${review.id}`}
            >
              Inspect
            </Link>
            <Button
              disabled={mutation.isPending || review.status === "published"}
              onClick={() => mutation.mutate({ action: "publish", id: review.id })}
            >
              Publish
            </Button>
            <Button
              disabled={mutation.isPending || review.status === "hidden"}
              onClick={() =>
                mutation.mutate({
                  action: "hide",
                  id: review.id,
                  reason: "Hidden during admin moderation.",
                })
              }
              variant="secondary"
            >
              Hide
            </Button>
            <Button
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({ action: "restore", id: review.id })}
              variant="secondary"
            >
              Restore
            </Button>
            <Button
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({
                  action: "mark-disputed",
                  id: review.id,
                  reason: "Marked disputed during admin moderation.",
                })
              }
              variant="ghost"
            >
              Mark disputed
            </Button>
            <Button
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({
                  action: "remove",
                  id: review.id,
                  reason: "Removed during admin moderation.",
                })
              }
              variant="ghost"
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
