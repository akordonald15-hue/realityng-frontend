"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import { deleteFavorite, type Favorite } from "@/lib/api/properties";

export function SavedPropertyCard({ favorite }: { favorite: Favorite }) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => deleteFavorite(favorite.property_id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
    },
  });

  if (favorite.is_publicly_available) {
    return <PropertyCard property={{ ...favorite.property, is_favorited: true }} />;
  }

  return (
    <article className="flex min-h-72 flex-col justify-between rounded-[28px] border border-reality-border-secondary bg-reality-surfaceMuted p-6 text-reality-text-primary">
      <div>
        <div aria-hidden="true" className="flex h-24 w-24 items-center justify-center rounded-2xl bg-reality-canvas text-3xl text-reality-text-secondary">
          ⌂
        </div>
        <p className="mt-5 inline-flex rounded-full border border-reality-border-secondary bg-reality-surface px-3 py-1 text-sm font-semibold text-reality-text-primary">
          No longer available
        </p>
        <h3 className="mt-4 font-display text-xl font-semibold">Saved property</h3>
        <p className="mt-2 text-sm leading-6 text-reality-text-secondary">
          You saved this property previously, but it is no longer publicly available.
        </p>
      </div>
      <div className="mt-6">
        <Button
          aria-label="Remove unavailable property from Saved"
          disabled={remove.isPending}
          onClick={() => remove.mutate()}
          variant="realitySecondary"
        >
          {remove.isPending ? "Removing…" : "Remove from Saved"}
        </Button>
        {remove.isError ? <p className="mt-2 text-sm text-red-700" role="alert">Could not remove this saved property. Please try again.</p> : null}
      </div>
    </article>
  );
}
