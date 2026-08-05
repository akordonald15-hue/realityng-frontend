"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { FormMessage } from "@/components/forms/form-message";
import { WalkthroughModerationCard } from "@/components/inspections/inspection-widgets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  listManagedWalkthroughs,
  submitWalkthrough,
  uploadWalkthrough,
} from "@/lib/api/inspections";

export default function PropertyWalkthroughsPage() {
  const params = useParams<{ propertyId: string }>();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const walkthroughsQuery = useQuery({
    queryKey: ["managed-walkthroughs", params.propertyId],
    queryFn: () => listManagedWalkthroughs(),
  });
  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!video) throw new Error("Select a video file.");
      return uploadWalkthrough(params.propertyId, { title, description, video_file: video });
    },
    onSuccess: () => {
      setTitle("");
      setDescription("");
      setVideo(null);
      queryClient.invalidateQueries({ queryKey: ["managed-walkthroughs", params.propertyId] });
    },
  });
  const submitMutation = useMutation({
    mutationFn: submitWalkthrough,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["managed-walkthroughs", params.propertyId] }),
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Virtual walkthroughs"
        title="Manage moderated property videos"
        description="Upload walkthrough videos for eligible owned or managed properties. Videos become public only after RealityNG moderation."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">
            Upload walkthrough
          </h2>
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              uploadMutation.mutate();
            }}
          >
            <label className="block text-sm font-semibold text-brand-text">
              Title
              <Input className="mt-2" onChange={(event) => setTitle(event.target.value)} required value={title} />
            </label>
            <label className="block text-sm font-semibold text-brand-text">
              Description
              <textarea
                className="mt-2 min-h-24 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-brand-text"
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              />
            </label>
            <label className="block text-sm font-semibold text-brand-text">
              Video file
              <Input
                accept="video/mp4,video/webm"
                className="mt-2"
                onChange={(event) => setVideo(event.target.files?.[0] ?? null)}
                required
                type="file"
              />
            </label>
            {uploadMutation.isError ? (
              <FormMessage tone="error">{getApiErrorMessage(uploadMutation.error)}</FormMessage>
            ) : null}
            <Button disabled={uploadMutation.isPending || !video} type="submit">
              {uploadMutation.isPending ? "Uploading..." : "Upload draft"}
            </Button>
          </form>
        </Card>
        <div className="space-y-4">
          {walkthroughsQuery.isLoading ? (
            <Card className="p-5 text-brand-muted">Loading walkthroughs...</Card>
          ) : null}
          {walkthroughsQuery.data?.results.map((walkthrough) => (
            <WalkthroughModerationCard
              key={walkthrough.id}
              onApprove={
                walkthrough.status === "draft" ? () => submitMutation.mutate(walkthrough.id) : undefined
              }
              pending={submitMutation.isPending}
              walkthrough={walkthrough}
            />
          ))}
          {walkthroughsQuery.data?.results.length === 0 ? (
            <Card className="p-5 text-sm text-brand-muted">No walkthroughs uploaded yet.</Card>
          ) : null}
        </div>
      </div>
    </main>
  );
}
