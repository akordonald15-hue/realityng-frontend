"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { StarRating } from "@/components/services/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api/errors";
import { createServiceReview } from "@/lib/api/services";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      createServiceReview({
        booking_id: bookingId,
        rating,
        title: String(form.get("title") ?? ""),
        comment: String(form.get("comment") ?? ""),
        would_recommend: form.get("would_recommend") === "on",
        quality_rating: Number(form.get("quality_rating") || rating),
        punctuality_rating: Number(form.get("punctuality_rating") || rating),
        communication_rating: Number(form.get("communication_rating") || rating),
        value_rating: Number(form.get("value_rating") || rating),
      }),
    onSuccess: () => setMessage("Your review has been submitted for moderation."),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <StarRating label="Overall rating" onChange={setRating} value={rating} />
      <label className="grid gap-2 text-sm font-semibold text-brand-text">
        Review title
        <Input maxLength={160} name="title" required />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-brand-text">
        Review
        <textarea
          className="min-h-32 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
          maxLength={2000}
          name="comment"
          required
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-4">
        <Input max="5" min="1" name="quality_rating" placeholder="Quality" type="number" />
        <Input max="5" min="1" name="punctuality_rating" placeholder="Punctuality" type="number" />
        <Input
          max="5"
          min="1"
          name="communication_rating"
          placeholder="Communication"
          type="number"
        />
        <Input max="5" min="1" name="value_rating" placeholder="Value" type="number" />
      </div>
      <label className="flex items-center gap-2 text-sm text-brand-muted">
        <input defaultChecked name="would_recommend" type="checkbox" />
        I would recommend this provider
      </label>
      {mutation.isError ? (
        <FormMessage tone="error">{getApiErrorMessage(mutation.error)}</FormMessage>
      ) : null}
      {message ? <FormMessage tone="success">{message}</FormMessage> : null}
      <Button disabled={mutation.isPending || rating === 0} type="submit">
        {mutation.isPending ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
