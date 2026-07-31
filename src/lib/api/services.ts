import { apiClient } from "@/lib/api/client";
import { USE_MOCKS } from "@/lib/demo-mode";
import {
  mockGetServiceProvider,
  mockGetServiceProviders,
  mockGetTradeCategories,
} from "@/mocks/mock-services";

export type ProviderType = "individual" | "company";

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
  skill_level: "apprentice" | "intermediate" | "expert";
};

export type ServiceArea = {
  id: string;
  country: string;
  state: string;
  city: string;
  lga?: string;
  neighborhood?: string;
  service_radius_km?: number | null;
};

export type VerificationBadge = {
  label: string;
  status: string;
  verified_at?: string;
  expires_at?: string;
};

export type ServiceProvider = {
  id: string;
  slug: string;
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
    items: unknown[];
    message: string;
  };
  reviews_summary?: {
    average_rating: string;
    completed_jobs_count: number;
    review_count: number;
    message: string;
  };
  created_at: string;
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
