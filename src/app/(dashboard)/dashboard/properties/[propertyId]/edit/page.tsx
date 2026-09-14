"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { PageContainer } from "@/components/layout/page-container";
import { PropertyForm } from "@/components/properties/property-form";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getProperty } from "@/lib/api/properties";

export default function EditPropertyPage() {
  const params = useParams<{ propertyId: string }>();
  const propertyId = decodeURIComponent(params.propertyId);
  const propertyQuery = useQuery({
    queryKey: ["managed-property", propertyId],
    queryFn: () => getProperty(propertyId),
  });

  if (propertyQuery.isLoading) {
    return (
      <main className="min-h-screen bg-white py-10 text-reality-text-primary [color-scheme:light]">
        <PageContainer>
          <Card className="h-[420px] animate-pulse rounded-[32px] bg-reality-bg-subtle" variant="realityElevated" />
        </PageContainer>
      </main>
    );
  }

  if (propertyQuery.isError || !propertyQuery.data) {
    return (
      <main className="min-h-screen bg-white py-10 text-reality-text-primary [color-scheme:light]">
        <PageContainer>
          <Card className="p-8" variant="realityElevated">
            <FormMessage tone="error" variant="reality">
              {propertyQuery.error
                ? getApiErrorMessage(propertyQuery.error)
                : "Property could not be loaded."}
            </FormMessage>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => propertyQuery.refetch()} variant="reality">
                Retry
              </Button>
              <Link className={buttonClasses("realitySecondary", "h-11 px-5")} href="/dashboard/properties">
                Back to properties
              </Link>
            </div>
          </Card>
        </PageContainer>
      </main>
    );
  }

  return <PropertyForm initialProperty={propertyQuery.data} mode="edit" />;
}
