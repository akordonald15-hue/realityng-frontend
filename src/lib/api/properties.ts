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
  cover_image_url?: string;
  image_count?: number;
  image_gallery?: PropertyImage[];
  is_favorited?: boolean;
  created_at: string;
};

export type PropertyImage = {
  id: string;
  image_url: string;
  caption: string;
  display_order: number;
  is_cover: boolean;
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

export type Favorite = {
  id: string;
  property: Property;
  created_at: string;
};

export type PaginatedFavorites = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Favorite[];
};

export type DashboardSummary = {
  saved_properties_count: number;
  active_listings_count: number;
  draft_listings_count: number;
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

export async function getPublicProperties(
  filters: PropertyFilters = {},
): Promise<PaginatedProperties> {
  const response = await apiClient.get<PaginatedProperties>("/public/properties/", {
    params: Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
    ),
  });
  return response.data;
}

export async function getPublicProperty(propertySlug: string): Promise<Property> {
  const response = await apiClient.get<Property>(`/public/properties/${propertySlug}/`);
  return response.data;
}

export async function createProperty(payload: PropertyPayload): Promise<Property> {
  const response = await apiClient.post<Property>("/properties/", payload);
  return response.data;
}

export async function listPropertyImages(propertySlug: string): Promise<PropertyImage[]> {
  const response = await apiClient.get<PropertyImage[]>(`/properties/${propertySlug}/images/`);
  return response.data;
}

export async function uploadPropertyImage({
  propertySlug,
  file,
  caption = "",
  displayOrder = 0,
  isCover = false,
}: {
  propertySlug: string;
  file: File;
  caption?: string;
  displayOrder?: number;
  isCover?: boolean;
}): Promise<PropertyImage> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("caption", caption);
  formData.append("display_order", String(displayOrder));
  formData.append("is_cover", String(isCover));

  const response = await apiClient.post<PropertyImage>(
    `/properties/${propertySlug}/images/`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function updatePropertyImage({
  propertySlug,
  imageId,
  caption,
  displayOrder,
  isCover,
}: {
  propertySlug: string;
  imageId: string;
  caption?: string;
  displayOrder?: number;
  isCover?: boolean;
}): Promise<PropertyImage> {
  const response = await apiClient.patch<PropertyImage>(
    `/properties/${propertySlug}/images/${imageId}/`,
    {
      ...(caption !== undefined ? { caption } : {}),
      ...(displayOrder !== undefined ? { display_order: displayOrder } : {}),
      ...(isCover !== undefined ? { is_cover: isCover } : {}),
    },
  );
  return response.data;
}

export async function setPropertyCoverImage({
  propertySlug,
  imageId,
}: {
  propertySlug: string;
  imageId: string;
}): Promise<PropertyImage> {
  const response = await apiClient.post<PropertyImage>(
    `/properties/${propertySlug}/images/${imageId}/set-cover/`,
    {},
  );
  return response.data;
}

export async function deletePropertyImage({
  propertySlug,
  imageId,
}: {
  propertySlug: string;
  imageId: string;
}): Promise<void> {
  await apiClient.delete(`/properties/${propertySlug}/images/${imageId}/`);
}

export async function createFavorite(propertyId: string): Promise<Favorite> {
  const response = await apiClient.post<Favorite>("/favorites/", { property_id: propertyId });
  return response.data;
}

export async function deleteFavorite(propertyId: string): Promise<void> {
  await apiClient.delete(`/favorites/${propertyId}/`);
}

export async function listFavorites(page = 1): Promise<PaginatedFavorites> {
  const response = await apiClient.get<PaginatedFavorites>("/favorites/", {
    params: { page },
  });
  return response.data;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummary>("/dashboard/summary/");
  return response.data;
}
