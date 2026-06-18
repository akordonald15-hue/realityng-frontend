import { apiClient } from "@/lib/api/client";

export type ListingType = "sale" | "rent";
export type PropertyType =
  | "apartment"
  | "house"
  | "land"
  | "commercial"
  | "office"
  | "shop"
  | "warehouse"
  | "mixed_use";

export type PropertyStatus = "draft" | "pending_review" | "approved" | "rejected" | "archived";

export type Property = {
  id: string;
  title: string;
  slug: string;
  description: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: string;
  currency: string;
  country: string;
  state: string;
  city: string;
  address: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
  land_size?: string | null;
  floor_area?: string | null;
  status?: PropertyStatus;
  featured: boolean;
  created_at: string;
};

export type PropertyPayload = {
  title: string;
  description: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: string;
  currency: string;
  country: string;
  state: string;
  city: string;
  address: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
  land_size?: string | null;
  floor_area?: string | null;
};

export type PropertyFilters = {
  search?: string;
  city?: string;
  property_type?: string;
  listing_type?: string;
  min_price?: string;
  max_price?: string;
  ordering?: string;
};

export type PaginatedProperties = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Property[];
};

export const propertyTypeOptions: Array<{ label: string; value: PropertyType }> = [
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Land", value: "land" },
  { label: "Commercial", value: "commercial" },
  { label: "Office", value: "office" },
  { label: "Shop", value: "shop" },
  { label: "Warehouse", value: "warehouse" },
  { label: "Mixed use", value: "mixed_use" },
];

export async function getPublicProperties(filters: PropertyFilters = {}): Promise<PaginatedProperties> {
  const response = await apiClient.get<PaginatedProperties>("/public/properties/", {
    params: Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
    ),
  });
  return response.data;
}

export async function createProperty(payload: PropertyPayload): Promise<Property> {
  const response = await apiClient.post<Property>("/properties/", payload);
  return response.data;
}
