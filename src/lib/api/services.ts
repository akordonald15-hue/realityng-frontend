import { apiClient } from "@/lib/api/client";
import { USE_MOCKS } from "@/lib/demo-mode";
import {
  mockAdminApproveProvider,
  mockAdminGetProvider,
  mockAdminListProviders,
  mockAdminReactivateProvider,
  mockAdminRejectProvider,
  mockAdminRequestProviderInfo,
  mockAdminSuspendProvider,
  mockCreatePortfolioImage,
  mockCreateProviderProfile,
  mockCreateProviderTrade,
  mockCreateServiceArea,
  mockDeactivateProviderProfile,
  mockDeletePortfolioImage,
  mockDeleteProviderTrade,
  mockDeleteServiceArea,
  mockGetMyProviderProfile,
  mockGetServiceProvider,
  mockGetServiceProviders,
  mockGetTradeCategories,
  mockListPortfolioImages,
  mockListProviderTrades,
  mockListServiceAreas,
  mockReorderPortfolioImages,
  mockSetPortfolioCover,
  mockSubmitProviderProfile,
  mockUpdateMyProviderProfile,
  mockUpdatePortfolioImage,
  mockUpdateProviderTrade,
  mockUpdateServiceArea,
} from "@/mocks/mock-services";

export type ProviderType = "individual" | "company";
export type ProviderStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "needs_more_information"
  | "rejected"
  | "suspended"
  | "inactive"
  | "archived";

export type SkillLevel = "apprentice" | "intermediate" | "expert";

export type TradeCategory = {
  id: string;
  name: string;
  slug: string;
  parent: string | null;
  description: string;
  icon: string;
  display_order: number;
  requires_certification: boolean;
  is_active: boolean;
  children: TradeCategory[];
};

export type ProviderTrade = {
  id: string;
  category: TradeCategory;
  is_primary: boolean;
  years_experience?: number | null;
  skill_level: SkillLevel;
};

export type ServiceArea = {
  id: string;
  country: string;
  state: string;
  city: string;
  lga?: string;
  neighborhood?: string;
  service_radius_km?: number | null;
  is_primary?: boolean;
};

export type VerificationBadge = {
  label: string;
  status: string;
  verified_at?: string;
  expires_at?: string;
};

export type PortfolioImage = {
  id: string;
  image_url: string;
  caption: string;
  category: TradeCategory | null;
  display_order: number;
  is_cover: boolean;
  created_at: string;
  updated_at?: string;
};

export type ServiceProvider = {
  id: string;
  slug: string;
  status?: ProviderStatus;
  provider_type: ProviderType;
  business_name: string;
  headline: string;
  biography: string;
  phone?: string;
  email?: string;
  country: string;
  state: string;
  city: string;
  lga?: string;
  neighborhood?: string;
  display_location: string;
  verification_badges: VerificationBadge[];
  average_rating: string;
  completed_jobs_count: number;
  trades: ProviderTrade[];
  primary_trade: ProviderTrade | null;
  service_areas: ServiceArea[];
  portfolio?: {
    items: PortfolioImage[];
    message: string;
  };
  reviews_summary?: {
    average_rating: string;
    completed_jobs_count: number;
    review_count: number;
    message: string;
  };
  created_at: string;
  updated_at?: string;
};

export type ProviderCompletion = {
  is_complete: boolean;
  missing_fields: string[];
  warnings: string[];
};

export type OwnerServiceProvider = ServiceProvider & {
  private_address?: string;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  review_notes?: string;
  rejection_reason?: string;
  more_info_message?: string;
  suspended_reason?: string;
  completion?: ProviderCompletion;
  portfolio_count?: number;
};

export type ProviderProfilePayload = {
  provider_type?: ProviderType;
  business_name?: string;
  headline?: string;
  biography?: string;
  phone?: string;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
  lga?: string;
  neighborhood?: string;
  display_location?: string;
  private_address?: string;
};

export type ProviderTradePayload = {
  category_id: string;
  is_primary?: boolean;
  years_experience?: number | null;
  skill_level?: SkillLevel;
};

export type ServiceAreaPayload = {
  country?: string;
  state: string;
  city: string;
  lga?: string;
  neighborhood?: string;
  service_radius_km?: number | null;
  is_primary?: boolean;
};

export type PortfolioImagePayload = {
  image: File;
  caption?: string;
  category_id?: string;
  display_order?: number;
  is_cover?: boolean;
};

export type PortfolioImageMetadataPayload = {
  caption?: string;
  category_id?: string | null;
  display_order?: number;
  is_cover?: boolean;
};

export type PortfolioReorderPayload = {
  items: { id: string; display_order: number }[];
};

export type AdminProviderFilters = {
  status?: ProviderStatus | "";
  provider_type?: ProviderType | "";
  state?: string;
  city?: string;
  search?: string;
};

export type AdminProviderDecisionPayload = {
  reason?: string;
  message?: string;
  review_notes?: string;
};

export type ServiceProviderFilters = {
  search?: string;
  category?: string;
  state?: string;
  city?: string;
  lga?: string;
  provider_type?: ProviderType | "";
  ordering?: "-created_at" | "-average_rating" | "business_name" | "";
};

export type PaginatedServiceProviders = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ServiceProvider[];
};

function cleanFilters(filters: ServiceProviderFilters): Record<string, string> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  ) as Record<string, string>;
}

export async function getTradeCategories(): Promise<TradeCategory[]> {
  if (USE_MOCKS) {
    return mockGetTradeCategories();
  }
  const response = await apiClient.get<TradeCategory[]>("/services/categories/");
  return response.data;
}

export async function getServiceProviders(
  filters: ServiceProviderFilters = {},
): Promise<PaginatedServiceProviders> {
  if (USE_MOCKS) {
    return mockGetServiceProviders(filters);
  }
  const response = await apiClient.get<PaginatedServiceProviders>("/services/providers/", {
    params: cleanFilters(filters),
  });
  return response.data;
}

export async function getServiceProvider(slug: string): Promise<ServiceProvider> {
  if (USE_MOCKS) {
    return mockGetServiceProvider(slug);
  }
  const response = await apiClient.get<ServiceProvider>(`/services/providers/${slug}/`);
  return response.data;
}

export async function createProviderProfile(
  payload: ProviderProfilePayload,
): Promise<OwnerServiceProvider> {
  if (USE_MOCKS) {
    return mockCreateProviderProfile(payload);
  }
  const response = await apiClient.post<OwnerServiceProvider>("/services/provider-profile/", payload);
  return response.data;
}

export async function getMyProviderProfile(): Promise<OwnerServiceProvider> {
  if (USE_MOCKS) {
    return mockGetMyProviderProfile();
  }
  const response = await apiClient.get<OwnerServiceProvider>("/services/provider-profile/me/");
  return response.data;
}

export async function updateMyProviderProfile(
  payload: ProviderProfilePayload,
): Promise<OwnerServiceProvider> {
  if (USE_MOCKS) {
    return mockUpdateMyProviderProfile(payload);
  }
  const response = await apiClient.patch<OwnerServiceProvider>(
    "/services/provider-profile/me/",
    payload,
  );
  return response.data;
}

export async function submitProviderProfile(): Promise<OwnerServiceProvider> {
  if (USE_MOCKS) {
    return mockSubmitProviderProfile();
  }
  const response = await apiClient.post<OwnerServiceProvider>("/services/provider-profile/submit/");
  return response.data;
}

export async function deactivateProviderProfile(): Promise<OwnerServiceProvider> {
  if (USE_MOCKS) {
    return mockDeactivateProviderProfile();
  }
  const response = await apiClient.post<OwnerServiceProvider>(
    "/services/provider-profile/deactivate/",
  );
  return response.data;
}

export async function listProviderTrades(): Promise<ProviderTrade[]> {
  if (USE_MOCKS) {
    return mockListProviderTrades();
  }
  const response = await apiClient.get<ProviderTrade[]>("/services/provider-profile/trades/");
  return response.data;
}

export async function createProviderTrade(payload: ProviderTradePayload): Promise<ProviderTrade> {
  if (USE_MOCKS) {
    return mockCreateProviderTrade(payload);
  }
  const response = await apiClient.post<ProviderTrade>("/services/provider-profile/trades/", payload);
  return response.data;
}

export async function updateProviderTrade(
  id: string,
  payload: Partial<ProviderTradePayload>,
): Promise<ProviderTrade> {
  if (USE_MOCKS) {
    return mockUpdateProviderTrade(id, payload);
  }
  const response = await apiClient.patch<ProviderTrade>(
    `/services/provider-profile/trades/${id}/`,
    payload,
  );
  return response.data;
}

export async function deleteProviderTrade(id: string): Promise<void> {
  if (USE_MOCKS) {
    return mockDeleteProviderTrade(id);
  }
  await apiClient.delete(`/services/provider-profile/trades/${id}/`);
}

export async function listServiceAreas(): Promise<ServiceArea[]> {
  if (USE_MOCKS) {
    return mockListServiceAreas();
  }
  const response = await apiClient.get<ServiceArea[]>("/services/provider-profile/service-areas/");
  return response.data;
}

export async function createServiceArea(payload: ServiceAreaPayload): Promise<ServiceArea> {
  if (USE_MOCKS) {
    return mockCreateServiceArea(payload);
  }
  const response = await apiClient.post<ServiceArea>(
    "/services/provider-profile/service-areas/",
    payload,
  );
  return response.data;
}

export async function updateServiceArea(
  id: string,
  payload: Partial<ServiceAreaPayload>,
): Promise<ServiceArea> {
  if (USE_MOCKS) {
    return mockUpdateServiceArea(id, payload);
  }
  const response = await apiClient.patch<ServiceArea>(
    `/services/provider-profile/service-areas/${id}/`,
    payload,
  );
  return response.data;
}

export async function deleteServiceArea(id: string): Promise<void> {
  if (USE_MOCKS) {
    return mockDeleteServiceArea(id);
  }
  await apiClient.delete(`/services/provider-profile/service-areas/${id}/`);
}

export async function listPortfolioImages(): Promise<PortfolioImage[]> {
  if (USE_MOCKS) {
    return mockListPortfolioImages();
  }
  const response = await apiClient.get<PortfolioImage[]>("/services/provider-profile/portfolio/");
  return response.data;
}

export async function createPortfolioImage(
  payload: PortfolioImagePayload,
): Promise<PortfolioImage> {
  if (USE_MOCKS) {
    return mockCreatePortfolioImage(payload);
  }
  const formData = new FormData();
  formData.append("image", payload.image);
  if (payload.caption) formData.append("caption", payload.caption);
  if (payload.category_id) formData.append("category_id", payload.category_id);
  if (payload.display_order !== undefined) {
    formData.append("display_order", String(payload.display_order));
  }
  if (payload.is_cover !== undefined) formData.append("is_cover", String(payload.is_cover));
  const response = await apiClient.post<PortfolioImage>(
    "/services/provider-profile/portfolio/",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function updatePortfolioImage(
  id: string,
  payload: PortfolioImageMetadataPayload,
): Promise<PortfolioImage> {
  if (USE_MOCKS) {
    return mockUpdatePortfolioImage(id, payload);
  }
  const response = await apiClient.patch<PortfolioImage>(
    `/services/provider-profile/portfolio/${id}/`,
    payload,
  );
  return response.data;
}

export async function deletePortfolioImage(id: string): Promise<void> {
  if (USE_MOCKS) {
    return mockDeletePortfolioImage(id);
  }
  await apiClient.delete(`/services/provider-profile/portfolio/${id}/`);
}

export async function setPortfolioCover(id: string): Promise<PortfolioImage> {
  if (USE_MOCKS) {
    return mockSetPortfolioCover(id);
  }
  const response = await apiClient.post<PortfolioImage>(
    `/services/provider-profile/portfolio/${id}/cover/`,
  );
  return response.data;
}

export async function reorderPortfolioImages(
  payload: PortfolioReorderPayload,
): Promise<PortfolioImage[]> {
  if (USE_MOCKS) {
    return mockReorderPortfolioImages(payload);
  }
  const response = await apiClient.post<PortfolioImage[]>(
    "/services/provider-profile/portfolio/reorder/",
    payload,
  );
  return response.data;
}

export async function adminListServiceProviders(
  filters: AdminProviderFilters = {},
): Promise<PaginatedServiceProviders> {
  if (USE_MOCKS) {
    return mockAdminListProviders(filters);
  }
  const response = await apiClient.get<PaginatedServiceProviders>("/services/admin/providers/", {
    params: cleanFilters(filters),
  });
  return response.data;
}

export async function adminGetServiceProvider(id: string): Promise<OwnerServiceProvider> {
  if (USE_MOCKS) {
    return mockAdminGetProvider(id);
  }
  const response = await apiClient.get<OwnerServiceProvider>(`/services/admin/providers/${id}/`);
  return response.data;
}

export async function adminApproveProvider(id: string): Promise<OwnerServiceProvider> {
  if (USE_MOCKS) {
    return mockAdminApproveProvider(id);
  }
  const response = await apiClient.post<OwnerServiceProvider>(
    `/services/admin/providers/${id}/approve/`,
  );
  return response.data;
}

export async function adminRejectProvider(
  id: string,
  payload: AdminProviderDecisionPayload,
): Promise<OwnerServiceProvider> {
  if (USE_MOCKS) {
    return mockAdminRejectProvider(id, payload);
  }
  const response = await apiClient.post<OwnerServiceProvider>(
    `/services/admin/providers/${id}/reject/`,
    payload,
  );
  return response.data;
}

export async function adminRequestProviderInfo(
  id: string,
  payload: AdminProviderDecisionPayload,
): Promise<OwnerServiceProvider> {
  if (USE_MOCKS) {
    return mockAdminRequestProviderInfo(id, payload);
  }
  const response = await apiClient.post<OwnerServiceProvider>(
    `/services/admin/providers/${id}/request-info/`,
    payload,
  );
  return response.data;
}

export async function adminSuspendProvider(
  id: string,
  payload: AdminProviderDecisionPayload,
): Promise<OwnerServiceProvider> {
  if (USE_MOCKS) {
    return mockAdminSuspendProvider(id, payload);
  }
  const response = await apiClient.post<OwnerServiceProvider>(
    `/services/admin/providers/${id}/suspend/`,
    payload,
  );
  return response.data;
}

export async function adminReactivateProvider(id: string): Promise<OwnerServiceProvider> {
  if (USE_MOCKS) {
    return mockAdminReactivateProvider(id);
  }
  const response = await apiClient.post<OwnerServiceProvider>(
    `/services/admin/providers/${id}/reactivate/`,
  );
  return response.data;
}
