"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { createViewing, viewingTypeOptions, type ViewingType } from "@/lib/api/viewings";

type ViewingRequestButtonProps = {
  inquiryId: string;
  disabled?: boolean;
};

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function ViewingRequestButton({ inquiryId, disabled = false }: ViewingRequestButtonProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [viewingType, setViewingType] = useState<ViewingType>("physical");
  const [preferredDate, setPreferredDate] = useState(() => tomorrowDate());
  const [preferredTime, setPreferredTime] = useState("11:00");
  const [notes, setNotes] = useState("");
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const mutation = useMutation({
    mutationFn: () =>
      createViewing({
        inquiry_id: inquiryId,
        viewing_type: viewingType,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        notes,
      }),
    onSuccess: async () => {
      setIsOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
    },
  });

  function submitViewing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <>
      <Button
        className="mt-3 h-9"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        type="button"
        variant="secondary"
      >
        Request viewing
      </Button>
      {isOpen ? (
        <div
          aria-labelledby="viewing-request-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end bg-black/70 px-4 py-5 backdrop-blur-sm sm:items-center sm:justify-center"
          role="dialog"
        >
          <div className="w-full max-w-lg rounded-md border border-white/10 bg-brand-surface p-5 shadow-glow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className="font-heading text-2xl font-semibold text-brand-text"
                  id="viewing-request-title"
                >
                  Request viewing
                </h2>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  Choose a preferred slot. The owner can confirm or suggest another time.
                </p>
              </div>
              <button
                aria-label="Close viewing request form"
                className="rounded-md px-2 py-1 text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                x
              </button>
            </div>
            <form className="mt-5 space-y-4" onSubmit={submitViewing}>
              <label className="block">
                <span className="text-sm font-medium text-brand-text">Viewing type</span>
                <Select
                  className="mt-2"
                  onChange={(event) => setViewingType(event.target.value as ViewingType)}
                  value={viewingType}
                >
                  {viewingTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-brand-text">Preferred date</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text outline-none transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                    min={minDate}
                    onChange={(event) => setPreferredDate(event.target.value)}
                    required
                    type="date"
                    value={preferredDate}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-brand-text">Preferred time</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text outline-none transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                    onChange={(event) => setPreferredTime(event.target.value)}
                    required
                    type="time"
                    value={preferredTime}
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-brand-text">Notes</span>
                <textarea
                  className="mt-2 min-h-24 w-full rounded-md border border-white/10 bg-white/5 px-3 py-3 text-sm text-brand-text outline-none transition placeholder:text-brand-muted/60 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                  maxLength={1000}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Share timing constraints or access preferences."
                  value={notes}
                />
              </label>
              {mutation.isError ? (
                <p className="text-sm text-red-200">
                  Viewing request could not be submitted. Please try another date or time.
                </p>
              ) : null}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  disabled={mutation.isPending}
                  onClick={() => setIsOpen(false)}
                  type="button"
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button disabled={mutation.isPending} type="submit">
                  {mutation.isPending ? "Submitting..." : "Submit request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
