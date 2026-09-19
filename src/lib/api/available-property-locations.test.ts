import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAvailablePropertyLocations } from "@/lib/api/available-property-locations";

const get = vi.fn();

vi.mock("@/lib/demo-mode", () => ({ USE_MOCKS: false }));
vi.mock("@/lib/api/client", () => ({ apiClient: { get: (...args: unknown[]) => get(...args) } }));

describe("getAvailablePropertyLocations", () => {
  beforeEach(() => get.mockReset());

  it("uses the typed public locations endpoint without paging through listings", async () => {
    const cities = [{ name: "Lagos", state: "Lagos", count: 25 }];
    get.mockResolvedValueOnce({ data: { cities } });
    expect(await getAvailablePropertyLocations()).toEqual(cities);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("/public/properties/locations/");
  });
});
