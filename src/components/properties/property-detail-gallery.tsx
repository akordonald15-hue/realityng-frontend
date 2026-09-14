"use client";

import { useState } from "react";
import { clsx } from "clsx";

import { Button } from "@/components/ui/button";
import type { Property, PropertyImage } from "@/lib/api/properties";

type GalleryImage = {
  id: string;
  url: string;
  alt: string;
};

type PropertyDetailGalleryProps = {
  property: Property;
};

function galleryImages(property: Property): GalleryImage[] {
  const gallery = property.image_gallery ?? [];
  const images = gallery
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((image: PropertyImage, index) => ({
      id: image.id,
      url: image.image_url,
      alt: image.caption || `${property.title} photo ${index + 1}`,
    }));

  if (images.length === 0 && property.cover_image_url) {
    return [{ id: "cover", url: property.cover_image_url, alt: property.title }];
  }

  return images;
}

function FallbackImage({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "flex h-full min-h-[220px] w-full items-center justify-center bg-[linear-gradient(135deg,#eefaf5,#d9f5ea)] px-8 text-center font-display text-3xl font-medium text-reality-brand-700",
        className,
      )}
    >
      RealityNG
    </div>
  );
}

function ImageTile({
  image,
  priority = false,
  className,
}: {
  image?: GalleryImage;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("overflow-hidden rounded-[32px] bg-reality-bg-muted", className)}>
      {image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          alt={image.alt}
          className="h-full w-full object-cover"
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          src={image.url}
        />
      ) : (
        <FallbackImage />
      )}
    </div>
  );
}

export function PropertyDetailGallery({ property }: PropertyDetailGalleryProps) {
  const images = galleryImages(property);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];
  const imageCount = property.image_count ?? images.length;

  return (
    <section aria-label="Property photos">
      <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,877px)_minmax(260px,1fr)]">
        <ImageTile className="h-[627px]" image={activeImage} priority />
        <div className="grid h-[627px] gap-6">
          <ImageTile image={images[1] ?? images[0]} />
          <div className="relative">
            <ImageTile className="h-full" image={images[2] ?? images[0]} />
            {imageCount > 0 ? (
              <Button
                className="absolute bottom-6 right-6 h-12 bg-white text-reality-text-secondary hover:bg-reality-bg-subtle"
                variant="realitySecondary"
              >
                See all photos ({imageCount})
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="relative -mx-4 sm:-mx-6">
          <ImageTile
            className="h-[381px] rounded-none sm:rounded-b-[32px]"
            image={activeImage}
            priority
          />
          {images.length > 1 ? (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/30 px-3 py-2 backdrop-blur">
              {images.slice(0, 5).map((image, index) => (
                <button
                  aria-label={`Show property photo ${index + 1}`}
                  aria-pressed={activeIndex === index}
                  className={clsx(
                    "h-2.5 w-2.5 rounded-full transition",
                    activeIndex === index ? "bg-white" : "bg-white/45",
                  )}
                  key={image.id}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

