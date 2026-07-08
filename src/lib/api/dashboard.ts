import { USE_MOCKS } from "@/lib/demo-mode";
import { getDashboardSummary } from "@/lib/api/properties";
import { listMyInquiries, listReceivedInquiries } from "@/lib/api/inquiries";
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
  const [myInquiries, receivedInquiries] = await Promise.all([
    listMyInquiries(),
    listReceivedInquiries(),
  ]);
  const roles = user?.roles.map((role) => role.role.name) ?? [];
  const role = roles.includes("agent") || roles.includes("landlord") ? "agent" : "buyer";
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
    {
      label: "My interests",
      value: String(summary.my_inquiries_count ?? myInquiries.count),
      detail: "Properties where you have shown interest",
    },
    {
      label: "Property inquiries",
      value: String(summary.received_inquiries_count ?? receivedInquiries.count),
      detail: "Buyer or tenant inquiries on your listings",
    },
  ];

  return {
    role,
    metrics: fallbackMetrics,
    savedProperties: [],
    recentlyViewed: [],
    recommendedProperties: [],
    inquiries: myInquiries.results,
    activeListings: [],
    leads: receivedInquiries.results,
    pendingApprovals: [],
    userStats: [],
  };
}
