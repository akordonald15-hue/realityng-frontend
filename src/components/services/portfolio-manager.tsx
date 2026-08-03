"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createPortfolioImage,
  deletePortfolioImage,
  listPortfolioImages,
  setPortfolioCover,
} from "@/lib/api/services";

export function PortfolioManager() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const portfolioQuery = useQuery({
    queryKey: ["my-provider-portfolio"],
    queryFn: listPortfolioImages,
  });

  const uploadMutation = useMutation({
    mutationFn: createPortfolioImage,
    onSuccess: () => {
      setMessage("Portfolio image uploaded.");
      queryClient.invalidateQueries({ queryKey: ["my-provider-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["my-provider-profile"] });
    },
    onError: (error) => setMessage(getApiErrorMessage(error)),
  });

  const coverMutation = useMutation({
    mutationFn: setPortfolioCover,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-provider-portfolio"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePortfolioImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-provider-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["my-provider-profile"] });
    },
  });

  function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("image");
    if (!(file instanceof File) || file.size === 0) {
      setMessage("Choose an image before uploading.");
      return;
    }
    uploadMutation.mutate({
      image: file,
      caption: String(form.get("caption") ?? ""),
      is_cover: form.get("is_cover") === "on",
    });
    event.currentTarget.reset();
  }

  const images = portfolioQuery.data ?? [];

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-secondary">
          Portfolio
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-brand-text">
          Manage work samples
        </h1>
        <p className="mt-3 text-sm leading-6 text-brand-muted">
          Upload public work samples for an approved services profile. Verification documents stay
          in the private trust workflow and are not managed here.
        </p>
        {message ? <div className="mt-4"><FormMessage>{message}</FormMessage></div> : null}
        <form
          className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]"
          noValidate
          onSubmit={handleUpload}
        >
          <Input
            accept="image/png,image/jpeg,image/webp"
            aria-label="Portfolio image"
            name="image"
            required
            type="file"
          />
          <Input name="caption" placeholder="Caption" />
          <label className="flex items-center gap-2 text-sm text-brand-muted">
            <input name="is_cover" type="checkbox" /> Cover
          </label>
          <Button disabled={uploadMutation.isPending} type="submit">
            {uploadMutation.isPending ? "Uploading..." : "Upload image"}
          </Button>
        </form>
      </Card>

      {portfolioQuery.isLoading ? (
        <Card className="p-5 text-brand-muted">Loading portfolio...</Card>
      ) : images.length === 0 ? (
        <Card className="p-5 text-sm text-brand-muted">
          Add completed project photos to help customers evaluate your work.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Card className="overflow-hidden" key={image.id}>
              <div className="relative aspect-[4/3] bg-white/5">
                <Image
                  alt={image.caption || "Provider portfolio image"}
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  src={image.image_url}
                />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-brand-text">
                    {image.caption || "Portfolio image"}
                  </p>
                  {image.is_cover ? <Badge>Cover</Badge> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={image.is_cover || coverMutation.isPending}
                    onClick={() => coverMutation.mutate(image.id)}
                    type="button"
                    variant="secondary"
                  >
                    Set cover
                  </Button>
                  <Button
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(image.id)}
                    type="button"
                    variant="ghost"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
