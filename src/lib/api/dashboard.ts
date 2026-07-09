import { USE_MOCKS } from "@/lib/demo-mode";
import { listMyApplications, listReceivedApplications } from "@/lib/api/applications";
import { getDashboardSummary } from "@/lib/api/properties";
import { listMyInquiries, listReceivedInquiries } from "@/lib/api/inquiries";
import { listMyViewings, listReceivedViewings } from "@/lib/api/viewings";
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
  const [
    myInquiries,
    receivedInquiries,
    myViewings,
    receivedViewings,
    myApplications,
    receivedApplications,
  ] = await Promise.all([
    listMyInquiries(),
    listReceivedInquiries(),
    listMyViewings(),
    listReceivedViewings(),
    listMyApplications(),
    listReceivedApplications(),
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
    {
      label: "My viewings",
      value: String(summary.my_viewings_count ?? myViewings.count),
      detail: "Scheduled or requested property viewings",
    },
    {
      label: "Viewing requests",
      value: String(summary.received_viewings_count ?? receivedViewings.count),
      detail: "Viewing requests for your properties",
    },
    {
      label: "My applications",
      value: String(summary.my_applications_count ?? myApplications.count),
      detail: "Submitted rental applications",
    },
    {
      label: "Received applications",
      value: String(summary.received_applications_count ?? receivedApplications.count),
      detail: "Applications awaiting owner review",
    },
  ];

  return {
    role,
    metrics: fallbackMetrics,
    savedProperties: [],
    recentlyViewed: [],
    recommendedProperties: [],
    inquiries: myInquiries.results,
    viewings: myViewings.results,
    applications: myApplications.results,
    activeListings: [],
    leads: receivedInquiries.results,
    receivedViewings: receivedViewings.results,
    receivedApplications: receivedApplications.results,
    pendingApprovals: [],
    userStats: [],
  };
}
