"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createFavorite, deleteFavorite } from "@/lib/api/properties";
import { getAccessToken } from "@/lib/auth/token-storage";
import { useOptionalAuth } from "@/providers/auth-provider";
import { useRoleSelection } from "@/components/auth/role-selection-modal";

type FavoriteButtonProps = {
  propertyId: string;
  propertySlug?: string;
  initialFavorited?: boolean;
  className?: string;
  compact?: boolean;
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
}: FavoriteButtonProps) {
  const auth = useOptionalAuth();
  const { openRoleSelection } = useRoleSelection();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);

  useEffect(() => {
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  function invalidateFavoriteQueries() {
    void queryClient.invalidateQueries({ queryKey: ["public-properties"] });
    void queryClient.invalidateQueries({ queryKey: ["favorites"] });
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
      const nextPath = propertySlug ? `/properties/${propertySlug}` : "/properties";
      openRoleSelection({
        actionLabel: "Save property",
        nextPath,
      });
      return;
    }
    mutation.mutate(!isFavorited);
  }

  const label = isFavorited ? "Remove saved property" : "Save property";

  return (
    <Button
      aria-busy={mutation.isPending}
      aria-label={label}
      aria-pressed={isFavorited}
      className={clsx(
        compact ? "h-10 w-10 gap-0 p-0" : "gap-2",
        isFavorited ? "text-brand-background" : "",
        className,
      )}
      disabled={mutation.isPending}
      onClick={toggleFavorite}
      type="button"
      variant={isFavorited ? "primary" : "secondary"}
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
