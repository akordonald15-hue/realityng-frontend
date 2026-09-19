"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createFavorite, deleteFavorite } from "@/lib/api/properties";
import { isAnonymousSaved, toggleAnonymousSave } from "@/lib/anonymous-shortlist";
import { getAccessToken } from "@/lib/auth/token-storage";
import { useOptionalAuth } from "@/providers/auth-provider";

type FavoriteButtonProps = {
  propertyId: string;
  propertySlug?: string;
  initialFavorited?: boolean;
  className?: string;
  compact?: boolean;
  variant?: "legacy" | "reality";
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

export function FavoriteButton({
  propertyId,
  propertySlug,
  initialFavorited = false,
  className,
  compact = false,
  variant = "reality",
}: FavoriteButtonProps) {
  const auth = useOptionalAuth();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);

  useEffect(() => {
    const sync = () => setIsFavorited(auth?.isAuthenticated || getAccessToken() ? initialFavorited : isAnonymousSaved(propertyId));
    sync();
    window.addEventListener("realityng:shortlist-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("realityng:shortlist-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [auth?.isAuthenticated, initialFavorited, propertyId]);

  function invalidateFavoriteQueries() {
    void queryClient.invalidateQueries({ queryKey: ["public-properties"] });
    void queryClient.invalidateQueries({ queryKey: ["favorites"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    if (propertySlug) {
      void queryClient.invalidateQueries({ queryKey: ["public-property", propertySlug] });
    }
  }

  const mutation = useMutation({
    mutationFn: async (nextFavorited: boolean) => {
      if (nextFavorited) {
        await createFavorite(propertyId);
        return;
      }
      await deleteFavorite(propertyId);
    },
    onMutate: (nextFavorited) => {
      setIsFavorited(nextFavorited);
    },
    onError: (_error, nextFavorited) => {
      setIsFavorited(!nextFavorited);
    },
    onSettled: invalidateFavoriteQueries,
  });

  function toggleFavorite() {
    if (!auth?.isAuthenticated && !getAccessToken()) {
      setIsFavorited(toggleAnonymousSave(propertyId));
      return;
    }
    mutation.mutate(!isFavorited);
  }

  const label = isFavorited ? "Remove saved property" : "Save property";
  const buttonVariant =
    variant === "reality"
      ? isFavorited
        ? "reality"
        : "realitySecondary"
      : isFavorited
        ? "primary"
        : "secondary";

  return (
    <Button
      aria-busy={mutation.isPending}
      aria-label={label}
      title={!auth?.isAuthenticated && isFavorited ? "Saved on this device" : undefined}
      aria-pressed={isFavorited}
      className={clsx(
        compact ? "h-10 w-10 gap-0 p-0" : "gap-2",
        variant === "legacy" && isFavorited ? "text-reality-text-primary" : "",
        className,
      )}
      disabled={mutation.isPending}
      onClick={toggleFavorite}
      type="button"
      variant={buttonVariant}
    >
      <HeartIcon filled={isFavorited} />
      {compact ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span>{mutation.isPending ? "Saving..." : isFavorited ? "Saved" : "Save"}</span>
      )}
    </Button>
  );
}


