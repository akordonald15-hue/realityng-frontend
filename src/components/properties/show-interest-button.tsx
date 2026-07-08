"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { recordPropertyInterest } from "@/lib/api/properties";
import { useOptionalAuth } from "@/providers/auth-provider";

type ShowInterestButtonProps = {
  propertySlug: string;
};

export function ShowInterestButton({ propertySlug }: ShowInterestButtonProps) {
  const auth = useOptionalAuth();
  const router = useRouter();
  const [hasShownInterest, setHasShownInterest] = useState(false);
  const mutation = useMutation({
    mutationFn: () => recordPropertyInterest(propertySlug),
    onSuccess: () => setHasShownInterest(true),
  });

  function showInterest() {
    if (!auth?.isAuthenticated) {
      router.push(`/auth/sign-up?next=${encodeURIComponent(`/properties/${propertySlug}`)}`);
      return;
    }
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
        {mutation.isPending
          ? "Recording interest..."
          : hasShownInterest
            ? "Interest shown"
            : "Show Interest"}
      </Button>
      {mutation.isError ? (
        <p className="mt-2 text-sm text-red-200">
          Interest could not be recorded right now. Please try again.
        </p>
      ) : null}
      {hasShownInterest ? (
        <p className="mt-2 text-sm text-brand-muted">Your interest has been saved for follow-up.</p>
      ) : null}
    </div>
  );
}
