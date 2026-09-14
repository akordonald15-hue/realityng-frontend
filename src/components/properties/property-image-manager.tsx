"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  deletePropertyImage,
  listPropertyImages,
  setPropertyCoverImage,
  updatePropertyImage,
  uploadPropertyImage,
  type PropertyImage,
} from "@/lib/api/properties";

type PropertyImageManagerProps = {
  propertySlug: string;
  variant?: "legacy" | "reality";
};

function sortedImages(images: PropertyImage[]) {
  return [...images].sort((first, second) => {
    if (first.display_order !== second.display_order) {
      return first.display_order - second.display_order;
    }
    return first.created_at.localeCompare(second.created_at);
  });
}

export function PropertyImageManager({ propertySlug, variant = "reality" }: PropertyImageManagerProps) {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [serverError, setServerError] = useState("");
  const queryKey = ["property-images", propertySlug];
  const imagesQuery = useQuery({
    queryKey,
    queryFn: () => listPropertyImages(propertySlug),
  });
  const images = sortedImages(imagesQuery.data ?? []);

  function refreshImages() {
    void queryClient.invalidateQueries({ queryKey });
  }

  const uploadMutation = useMutation({
    mutationFn: () =>
      uploadPropertyImage({
        propertySlug,
        file: selectedFile as File,
        caption,
        displayOrder: images.length + 1,
        isCover: images.length === 0,
      }),
    onSuccess: () => {
      setSelectedFile(null);
      setCaption("");
      setServerError("");
      refreshImages();
    },
    onError: (error) => setServerError(getApiErrorMessage(error)),
  });
  const updateMutation = useMutation({
    mutationFn: updatePropertyImage,
    onSuccess: refreshImages,
    onError: (error) => setServerError(getApiErrorMessage(error)),
  });
  const coverMutation = useMutation({
    mutationFn: setPropertyCoverImage,
    onSuccess: refreshImages,
    onError: (error) => setServerError(getApiErrorMessage(error)),
  });
  const deleteMutation = useMutation({
    mutationFn: deletePropertyImage,
    onSuccess: refreshImages,
    onError: (error) => setServerError(getApiErrorMessage(error)),
  });

  function moveImage(image: PropertyImage, direction: -1 | 1) {
    const currentIndex = images.findIndex((item) => item.id === image.id);
    const target = images[currentIndex + direction];
    if (!target) {
      return;
    }
    updateMutation.mutate({
      propertySlug,
      imageId: image.id,
      displayOrder: target.display_order,
    });
    updateMutation.mutate({
      propertySlug,
      imageId: target.id,
      displayOrder: image.display_order,
    });
  }

  function onUpload() {
    if (!selectedFile) {
      setServerError("Choose an image before uploading.");
      return;
    }
    uploadMutation.mutate();
  }

  return (
    <section className="space-y-5">
      <Card className="p-4" variant={variant === "reality" ? "realityElevated" : "legacy"}>
        <FormMessage tone="error" variant={variant === "reality" ? "reality" : "legacy"}>
          {serverError}
        </FormMessage>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label
            className={
              variant === "reality"
                ? "block text-sm font-medium text-reality-text-primary"
                : "block text-sm font-medium text-reality-text-primary"
            }
            htmlFor="property-image"
          >
            <span>Image</span>
            <input
              accept="image/jpeg,image/png,image/webp"
              className={
                variant === "reality"
                  ? "mt-2 block w-full rounded-[14px] border border-reality-border-secondary bg-white px-3 py-2 text-sm text-reality-text-secondary file:mr-3 file:rounded-full file:border-0 file:bg-reality-brand-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
                  : "mt-2 block w-full rounded-md border border-reality-border-secondary bg-reality-bg-subtle px-3 py-2 text-sm text-reality-text-secondary file:mr-3 file:rounded-sm file:border-0 file:bg-brand-secondary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-reality-text-primary"
              }
              id="property-image"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              type="file"
            />
          </label>
          <label
            className={
              variant === "reality"
                ? "block text-sm font-medium text-reality-text-primary"
                : "block text-sm font-medium text-reality-text-primary"
            }
            htmlFor="image-caption"
          >
            <span>Caption</span>
            <Input
              className="mt-2"
              id="image-caption"
              onChange={(event) => setCaption(event.target.value)}
              value={caption}
              variant={variant}
            />
          </label>
          <Button
            disabled={uploadMutation.isPending}
            onClick={onUpload}
            variant={variant === "reality" ? "reality" : "primary"}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </Card>

      {imagesQuery.isLoading ? (
        <p className={variant === "reality" ? "text-sm text-reality-text-secondary" : "text-sm text-reality-text-secondary"}>
          Loading gallery...
        </p>
      ) : null}
      {images.length === 0 && !imagesQuery.isLoading ? (
        <Card
          className={
            variant === "reality"
              ? "p-5 text-sm text-reality-text-secondary"
              : "p-5 text-sm text-reality-text-secondary"
          }
          variant={variant === "reality" ? "realityElevated" : "legacy"}
        >
          No images uploaded yet.
        </Card>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {images.map((image, index) => (
          <Card
            key={image.id}
            className="p-3"
            variant={variant === "reality" ? "realityElevated" : "legacy"}
          >
            <div
              className={
                variant === "reality"
                  ? "relative aspect-[4/3] overflow-hidden rounded-[20px] bg-reality-bg-muted"
                  : "relative aspect-[4/3] overflow-hidden rounded-sm bg-white"
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={image.caption || "Property image"}
                className="h-full w-full object-cover"
                decoding="async"
                loading="lazy"
                src={image.image_url}
              />
              {image.is_cover ? (
                <span
                  className={
                    variant === "reality"
                      ? "absolute left-2 top-2 rounded-full bg-reality-brand-500 px-3 py-1 text-xs font-semibold text-white"
                      : "absolute left-2 top-2 rounded-sm bg-brand-secondary px-2 py-1 text-xs font-semibold text-reality-text-primary"
                  }
                >
                  Cover
                </span>
              ) : null}
            </div>
            <label
              className={
                variant === "reality"
                  ? "mt-3 block text-sm font-medium text-reality-text-primary"
                  : "mt-3 block text-sm font-medium text-reality-text-primary"
              }
              htmlFor={`caption-${image.id}`}
            >
              <span>Caption</span>
              <Input
                className="mt-2 h-10"
                defaultValue={image.caption}
                id={`caption-${image.id}`}
                variant={variant}
                onBlur={(event) =>
                  updateMutation.mutate({
                    propertySlug,
                    imageId: image.id,
                    caption: event.target.value,
                  })
                }
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                disabled={index === 0 || updateMutation.isPending}
                onClick={() => moveImage(image, -1)}
                variant={variant === "reality" ? "realitySecondary" : "secondary"}
              >
                Move up
              </Button>
              <Button
                disabled={index === images.length - 1 || updateMutation.isPending}
                onClick={() => moveImage(image, 1)}
                variant={variant === "reality" ? "realitySecondary" : "secondary"}
              >
                Move down
              </Button>
              <Button
                disabled={image.is_cover || coverMutation.isPending}
                onClick={() => coverMutation.mutate({ propertySlug, imageId: image.id })}
                variant={variant === "reality" ? "realitySecondary" : "secondary"}
              >
                Set cover
              </Button>
              <Button
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate({ propertySlug, imageId: image.id })}
                variant={variant === "reality" ? "realitySecondary" : "secondary"}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}


