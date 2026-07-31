import type { ServiceArea } from "@/lib/api/services";

type ProviderLocationProps = {
  displayLocation: string;
  serviceAreas: ServiceArea[];
};

export function ProviderLocation({ displayLocation, serviceAreas }: ProviderLocationProps) {
  const areas = serviceAreas.slice(0, 3);

  return (
    <div className="space-y-2 text-sm text-brand-muted">
      <p className="font-semibold text-brand-text">{displayLocation}</p>
      {areas.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Service areas">
          {areas.map((area) => (
            <li
              className="rounded-sm border border-white/10 bg-white/5 px-2.5 py-1"
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
