import { USE_MOCKS } from "@/lib/demo-mode";
import { getDashboardSummary } from "@/lib/api/properties";
import type { User } from "@/lib/auth/types";
import {
  getMockDashboardOverview,
  type MockDashboardOverview,
  type MockMetric,
} from "@/mocks/mock-dashboard";

export type DashboardOverview = MockDashboardOverview;

export async function getDashboardOverview(user: User | null): Promise<DashboardOverview> {
  if (USE_MOCKS) {
    return getMockDashboardOverview(user);
  }

  const summary = await getDashboardSummary();
  const fallbackMetrics: MockMetric[] = [
    {
      label: "Saved properties",
      value: String(summary.saved_properties_count),
      detail: "Properties saved to your account",
    },
    {
      label: "Active listings",
      value: String(summary.active_listings_count),
      detail: "Approved listings under your profile",
    },
    {
      label: "Draft listings",
      value: String(summary.draft_listings_count),
      detail: "Listings still being prepared",
    },
  ];

  return {
    role: "buyer",
    metrics: fallbackMetrics,
    savedProperties: [],
    recentlyViewed: [],
    recommendedProperties: [],
    inquiries: [],
    activeListings: [],
    leads: [],
    pendingApprovals: [],
    userStats: [],
  };
}
