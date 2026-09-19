import { apiClient } from "@/lib/api/client";
import { getPublicProperties } from "@/lib/api/properties";
import { USE_MOCKS } from "@/lib/demo-mode";

export type AvailableLocation = { name: string; state: string; count: number };
export type AvailableLocationsResponse = { cities: AvailableLocation[] };

export async function getAvailablePropertyLocations(): Promise<AvailableLocation[]> {
  if (!USE_MOCKS) {
    const response = await apiClient.get<AvailableLocationsResponse>("/public/properties/locations/");
    return response.data.cities;
  }

  // Demo inventory stays local; production always uses the authoritative endpoint.
  const locations = new Map<string, AvailableLocation>();
  const seenPages = new Set<string>();
  let page = 1;
  let next: string | null;
  do {
    const response = await getPublicProperties({ page: String(page) });
    response.results.forEach((property) => {
      const name = property.city?.trim();
      const state = property.state?.trim();
      if (!name || !state) return;
      const key = `${name.toLocaleLowerCase()}|${state.toLocaleLowerCase()}`;
      const existing = locations.get(key);
      if (existing) existing.count += 1;
      else locations.set(key, { name, state, count: 1 });
    });
    next = response.next && !seenPages.has(response.next) ? response.next : null;
    if (next) seenPages.add(next);
    page += 1;
  } while (next);
  return [...locations.values()].sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
}
