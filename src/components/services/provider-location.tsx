import type { ServiceArea } from "@/lib/api/services";

type ProviderLocationProps = {
  displayLocation: string;
  serviceAreas: ServiceArea[];
  variant?: "legacy" | "reality";
};

export function ProviderLocation({
  displayLocation,
  serviceAreas,
  variant = "reality",
}: ProviderLocationProps) {
  const areas = serviceAreas.slice(0, 3);
  const isReality = variant === "reality";

  return (
    <div
      className={
        isReality ? "space-y-2 text-sm text-reality-text-secondary" : "space-y-2 text-sm text-reality-text-secondary"
      }
    >
      <p
        className={
          isReality ? "font-semibold text-reality-text-primary" : "font-semibold text-reality-text-primary"
        }
      >
        {displayLocation}
      </p>
      {areas.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Service areas">
          {areas.map((area) => (
            <li
              className={
                isReality
                  ? "rounded-full border border-reality-border-secondary bg-reality-bg-subtle px-2.5 py-1"
                  : "rounded-sm border border-reality-border-secondary bg-reality-bg-subtle px-2.5 py-1"
              }
              key={area.id}
            >
              {[area.neighborhood, area.lga, area.city].filter(Boolean).join(", ")}
            </li>
          ))}
        </ul>
      ) : (
        <p>Service areas will be confirmed during profile review.</p>
      )}
    </div>
  );
}


