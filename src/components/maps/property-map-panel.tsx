"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Property } from "@/lib/api/properties";
import { loadGoogleMaps } from "@/lib/maps/google-maps";
import { formatPrice } from "@/lib/properties/format";

type PropertyMapPanelProps = {
  properties: Property[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (propertyId: string) => void;
};

type MapReadyProperty = Property & {
  latitude: number;
  longitude: number;
};

type Cluster = {
  id: string;
  latitude: number;
  longitude: number;
  properties: MapReadyProperty[];
};

const DEFAULT_CENTER = { lat: 9.082, lng: 8.6753 };

function numberOrNull(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapReadyProperties(properties: Property[]): MapReadyProperty[] {
  return properties.flatMap((property) => {
    const latitude = numberOrNull(property.latitude);
    const longitude = numberOrNull(property.longitude);
    if (latitude === null || longitude === null) {
      return [];
    }
    return [{ ...property, latitude, longitude }];
  });
}

function clusterProperties(properties: MapReadyProperty[], zoom: number): Cluster[] {
  const precision = zoom >= 13 ? 3 : zoom >= 10 ? 2 : 1;
  const groups = new Map<string, MapReadyProperty[]>();

  properties.forEach((property) => {
    const key = `${property.latitude.toFixed(precision)}:${property.longitude.toFixed(precision)}`;
    groups.set(key, [...(groups.get(key) ?? []), property]);
  });

  return Array.from(groups.entries()).map(([id, items]) => ({
    id,
    latitude: items.reduce((sum, item) => sum + item.latitude, 0) / items.length,
    longitude: items.reduce((sum, item) => sum + item.longitude, 0) / items.length,
    properties: items,
  }));
}

function markerColor(property: Property, selected: boolean) {
  if (selected) {
    return "#FFFFFF";
  }
  if (property.featured) {
    return "#C99A3D";
  }
  if (!property.approximate_location) {
    return "#178A58";
  }
  return "#0B3B2E";
}

function buildInfoWindowContent(property: Property) {
  const root = document.createElement("article");
  root.className = "realityng-map-card";

  const title = document.createElement("strong");
  title.textContent = property.title;
  root.appendChild(title);

  const price = document.createElement("p");
  price.textContent = formatPrice(property);
  root.appendChild(price);

  const location = document.createElement("small");
  location.textContent = property.display_location || `${property.city}, ${property.state}`;
  root.appendChild(location);

  const note = document.createElement("small");
  note.textContent = property.approximate_location
    ? "Approximate location for privacy"
    : "Exact location shared with owner approval";
  root.appendChild(note);

  return root;
}

function FallbackMapState({
  mapProperties,
  onSelectProperty,
}: {
  mapProperties: MapReadyProperty[];
  onSelectProperty?: (propertyId: string) => void;
}) {
  return (
    <Card className="flex min-h-[420px] flex-col justify-between p-5">
      <div>
        <Badge>Location intelligence</Badge>
        <h2 className="mt-4 font-heading text-2xl font-semibold text-brand-text">
          Map preview is ready.
        </h2>
        <p className="mt-3 text-sm leading-6 text-brand-muted">
          Google Maps needs a restricted browser key before the interactive map can load. The list
          remains fully usable while maps are unavailable.
        </p>
      </div>
      <div className="mt-6 space-y-2">
        {mapProperties.slice(0, 5).map((property) => (
          <button
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-brand-text transition hover:border-brand-secondary/50"
            key={property.id}
            onClick={() => onSelectProperty?.(property.id)}
            type="button"
          >
            <span className="block font-semibold">{property.title}</span>
            <span className="text-xs text-brand-muted">
              {property.display_location || `${property.city}, ${property.state}`}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

export function PropertyMapPanel({
  properties,
  selectedPropertyId,
  onSelectProperty,
}: PropertyMapPanelProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [zoom, setZoom] = useState(10);
  const mapProperties = useMemo(() => mapReadyProperties(properties), [properties]);

  useEffect(() => {
    let cancelled = false;

    if (mapProperties.length === 0) {
      return;
    }

    setStatus("loading");
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapElementRef.current) {
          return;
        }

        const firstProperty = mapProperties[0];
        mapRef.current = new maps.Map(mapElementRef.current, {
          center: firstProperty
            ? { lat: firstProperty.latitude, lng: firstProperty.longitude }
            : DEFAULT_CENTER,
          zoom: firstProperty ? 11 : 6,
          clickableIcons: false,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            { featureType: "poi.business", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "simplified" }] },
          ],
        });
        infoWindowRef.current = new maps.InfoWindow();
        mapRef.current.addListener("zoom_changed", () => {
          setZoom(mapRef.current.getZoom() ?? 10);
        });
        setStatus("ready");
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setErrorMessage(error.message);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mapProperties]);

  useEffect(() => {
    const maps = window.google?.maps;
    const map = mapRef.current;
    if (!maps || !map || status !== "ready") {
      return;
    }

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const clusters = clusterProperties(mapProperties, zoom);
    const bounds = new maps.LatLngBounds();

    clusters.forEach((cluster) => {
      const isCluster = cluster.properties.length > 1;
      const firstProperty = cluster.properties[0];
      const selected = cluster.properties.some((property) => property.id === selectedPropertyId);
      const marker = new maps.Marker({
        map,
        position: { lat: cluster.latitude, lng: cluster.longitude },
        title: isCluster ? `${cluster.properties.length} properties` : firstProperty.title,
        label: isCluster
          ? { text: String(cluster.properties.length), color: "#06271F", fontWeight: "700" }
          : undefined,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: isCluster ? 18 : selected ? 13 : 10,
          fillColor: isCluster ? "#E5C477" : markerColor(firstProperty, selected),
          fillOpacity: 0.96,
          strokeColor: selected ? "#C99A3D" : "#FFFFFF",
          strokeWeight: selected ? 3 : 2,
        },
      });

      marker.addListener("click", () => {
        if (isCluster) {
          const clusterBounds = new maps.LatLngBounds();
          cluster.properties.forEach((property) => {
            clusterBounds.extend({ lat: property.latitude, lng: property.longitude });
          });
          map.fitBounds(clusterBounds);
          return;
        }
        onSelectProperty?.(firstProperty.id);
        infoWindowRef.current?.setContent(buildInfoWindowContent(firstProperty));
        infoWindowRef.current?.open({ map, anchor: marker });
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: cluster.latitude, lng: cluster.longitude });
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 60);
    }
  }, [mapProperties, onSelectProperty, selectedPropertyId, status, zoom]);

  if (mapProperties.length === 0) {
    return (
      <Card className="flex min-h-[420px] items-center justify-center p-6 text-center">
        <div>
          <Badge>Map unavailable</Badge>
          <h2 className="mt-4 font-heading text-2xl font-semibold text-brand-text">
            No map-ready listings yet.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-brand-muted">
            Listings need approved public location metadata before they appear on the map.
          </p>
        </div>
      </Card>
    );
  }

  if (status === "error") {
    return <FallbackMapState mapProperties={mapProperties} onSelectProperty={onSelectProperty} />;
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-text">Map view</p>
          <p className="text-xs text-brand-muted">
            {mapProperties.length} listing{mapProperties.length === 1 ? "" : "s"} with public map
            metadata. Approximate pins protect seller privacy.
          </p>
        </div>
        {selectedPropertyId && onSelectProperty ? (
          <Button onClick={() => onSelectProperty?.("")} variant="secondary">
            Clear selection
          </Button>
        ) : null}
      </div>
      <div className="relative min-h-[420px]">
        {status === "loading" || status === "idle" ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-brand-background/80 text-sm font-semibold text-brand-muted">
            Loading map...
          </div>
        ) : null}
        {errorMessage ? (
          <p className="sr-only">Map error: {errorMessage}</p>
        ) : null}
        <div
          aria-label="Property map"
          className="h-[420px] w-full md:h-[620px]"
          ref={mapElementRef}
          role="region"
        />
      </div>
    </Card>
  );
}
