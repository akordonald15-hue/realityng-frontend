"use client";

import { useParams } from "next/navigation";

import { ReviewForm } from "@/components/services/review-form";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

export default function ServiceBookingReviewPage() {
  const params = useParams<{ bookingId: string }>();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Verified review"
        title="Review your completed service"
        description="Reviews are available only after a completed RealityNG service engagement and are moderated before they appear publicly."
      />
      <Card className="mt-6 p-6">
        <ReviewForm bookingId={params.bookingId} />
      </Card>
    </main>
  );
}
