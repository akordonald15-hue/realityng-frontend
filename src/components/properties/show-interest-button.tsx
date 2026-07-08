"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  contactPreferenceOptions,
  createInquiry,
  inquiryTypeForListing,
  inquiryTypeOptions,
  type ContactPreference,
  type InquiryType,
} from "@/lib/api/inquiries";
import type { ListingType } from "@/lib/api/properties";
import { useOptionalAuth } from "@/providers/auth-provider";

type ShowInterestButtonProps = {
  propertyId: string;
  propertySlug: string;
  listingType: ListingType;
};

export function ShowInterestButton({
  propertyId,
  propertySlug,
  listingType,
}: ShowInterestButtonProps) {
  const auth = useOptionalAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasShownInterest, setHasShownInterest] = useState(false);
  const [inquiryType, setInquiryType] = useState<InquiryType>(() =>
    inquiryTypeForListing(listingType),
  );
  const [contactPreference, setContactPreference] = useState<ContactPreference>("whatsapp");
  const [message, setMessage] = useState("");
  const mutation = useMutation({
    mutationFn: () =>
      createInquiry({
        property_id: propertyId,
        inquiry_type: inquiryType,
        contact_preference: contactPreference,
        message,
      }),
    onSuccess: async () => {
      setHasShownInterest(true);
      setIsModalOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["my-inquiries"] }),
        queryClient.invalidateQueries({ queryKey: ["received-inquiries"] }),
      ]);
    },
  });

  function showInterest() {
    if (!auth?.isAuthenticated) {
      router.push(`/auth/sign-up?next=${encodeURIComponent(`/properties/${propertySlug}`)}`);
      return;
    }
    setIsModalOpen(true);
  }

  function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="mt-4">
      <Button
        aria-label={hasShownInterest ? "Interest shown for this property" : "Show interest"}
        className="w-full"
        disabled={mutation.isPending || hasShownInterest}
        onClick={showInterest}
        type="button"
      >
        {hasShownInterest ? "Interest shown" : "Show Interest"}
      </Button>
      {mutation.isError ? (
        <p className="mt-2 text-sm text-red-200">
          Interest could not be recorded right now. Please try again.
        </p>
      ) : null}
      {hasShownInterest ? (
        <p className="mt-2 text-sm text-brand-muted">Your interest has been saved for follow-up.</p>
      ) : null}
      {isModalOpen ? (
        <div
          aria-labelledby="show-interest-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end bg-black/70 px-4 py-5 backdrop-blur-sm sm:items-center sm:justify-center"
          role="dialog"
        >
          <div className="w-full max-w-lg rounded-md border border-white/10 bg-brand-surface p-5 shadow-glow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className="font-heading text-2xl font-semibold text-brand-text"
                  id="show-interest-title"
                >
                  Show interest
                </h2>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  Share your intent and preferred contact method so the property owner can follow up
                  from their inquiry dashboard.
                </p>
              </div>
              <button
                aria-label="Close show interest form"
                className="rounded-md px-2 py-1 text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                x
              </button>
            </div>
            <form className="mt-5 space-y-4" onSubmit={submitInquiry}>
              <label className="block">
                <span className="text-sm font-medium text-brand-text">Purpose</span>
                <Select
                  className="mt-2"
                  onChange={(event) => setInquiryType(event.target.value as InquiryType)}
                  value={inquiryType}
                >
                  {inquiryTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-brand-text">Preferred contact</span>
                <Select
                  className="mt-2"
                  onChange={(event) =>
                    setContactPreference(event.target.value as ContactPreference)
                  }
                  value={contactPreference}
                >
                  {contactPreferenceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-brand-text">Message</span>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-md border border-white/10 bg-white/5 px-3 py-3 text-sm text-brand-text outline-none transition placeholder:text-brand-muted/60 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                  maxLength={1000}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Add any context, timing, or questions for the owner."
                  value={message}
                />
              </label>
              {mutation.isError ? (
                <p className="text-sm text-red-200">
                  Inquiry could not be submitted. Please check the property purpose and try again.
                </p>
              ) : null}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  disabled={mutation.isPending}
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button disabled={mutation.isPending} type="submit">
                  {mutation.isPending ? "Submitting..." : "Submit inquiry"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
