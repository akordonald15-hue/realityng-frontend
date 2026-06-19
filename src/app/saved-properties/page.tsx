"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { listFavorites } from "@/lib/api/properties";

function SavedPropertiesContent() {
  const [page, setPage] = useState(1);
  const favoritesQuery = useQuery({
    queryKey: ["favorites", page],
    queryFn: () => listFavorites(page),
  });
  const favorites = favoritesQuery.data?.results ?? [];

  return (
    <main>
      <section className="border-b border-white/10 bg-brand-surface/45">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
          <SectionHeader
            eyebrow="Saved"
            title="Saved properties"
            description="Properties you marked for a closer look while browsing approved listings."
          />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        {favoritesQuery.isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div className="h-80 animate-pulse rounded-md bg-white/10" key={item} />
            ))}
          </div>
        ) : null}
        {favoritesQuery.isError ? (
          <Card className="p-6 text-sm text-red-200">Saved properties could not be loaded.</Card>
        ) : null}
        {!favoritesQuery.isLoading && favorites.length === 0 ? (
          <Card className="p-8 text-brand-muted">
            You have not saved any properties yet. Browse approved listings and save the ones you
            want to revisit.
          </Card>
        ) : null}
        {favorites.length > 0 ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {favorites.map((favorite) => (
                <PropertyCard
                  key={favorite.id}
                  property={{ ...favorite.property, is_favorited: true }}
                />
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between gap-3">
              <Button
                disabled={!favoritesQuery.data?.previous || favoritesQuery.isFetching}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                variant="secondary"
              >
                Previous
              </Button>
              <p className="text-sm text-brand-muted">Page {page}</p>
              <Button
                disabled={!favoritesQuery.data?.next || favoritesQuery.isFetching}
                onClick={() => setPage((value) => value + 1)}
                variant="secondary"
              >
                Next
              </Button>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

export default function SavedPropertiesPage() {
  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <Navbar />
      <ProtectedRoute>
        <SavedPropertiesContent />
      </ProtectedRoute>
      <Footer />
    </div>
  );
}
