"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ReviewModerationList } from "@/components/services/review-moderation-list";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { adminGetServiceReview } from "@/lib/api/services";

export default function AdminServiceReviewDetailPage() {
  const params = useParams<{ id: string }>();
  const reviewQuery = useQuery({
    queryKey: ["admin-service-review", params.id],
    queryFn: () => adminGetServiceReview(params.id),
    enabled: Boolean(params.id),
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link className="text-sm font-semibold text-brand-secondary" href="/admin/services/reviews">
          Back to review queue
        </Link>
        <SectionHeader
          eyebrow="Admin review"
          title="Review moderation detail"
          description="Inspect booking context, public review content, provider response, and moderation state."
        />
        <div className="mt-6">
          {reviewQuery.isLoading ? (
            <Card className="p-5 text-brand-muted">Loading review...</Card>
          ) : reviewQuery.data ? (
            <ReviewModerationList reviews={[reviewQuery.data]} />
          ) : (
            <Card className="p-5 text-brand-muted">Review not found.</Card>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
