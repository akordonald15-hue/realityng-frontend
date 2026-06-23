import type { User } from "@/lib/auth/types";
import type { MockInquiry } from "@/mocks/mock-inquiries";
import { mockInquiries } from "@/mocks/mock-inquiries";
import { mockProperties } from "@/mocks/mock-properties";
import { mockAgents, mockBuyers, mockUsers } from "@/mocks/mock-users";

export type MockMetric = {
  label: string;
  value: string;
  detail: string;
};

export type MockDashboardOverview = {
  role: "buyer" | "agent" | "admin";
  metrics: MockMetric[];
  savedProperties: typeof mockProperties;
  recentlyViewed: typeof mockProperties;
  recommendedProperties: typeof mockProperties;
  inquiries: MockInquiry[];
  activeListings: typeof mockProperties;
  leads: MockInquiry[];
  pendingApprovals: typeof mockProperties;
  userStats: MockMetric[];
};

export const mockAnalytics = {
  propertiesListed: 150,
  monthlyVisitors: 1200,
  activeAgents: 45,
  verifiedListings: 320,
  pendingApprovals: 18,
  conversionRate: "12.8%",
};

function userRole(user: User | null): "buyer" | "agent" | "admin" {
  const roles = user?.roles.map((role) => role.role.name) ?? [];
  if (roles.includes("admin") || roles.includes("super_admin")) {
    return "admin";
  }
  if (roles.includes("agent")) {
    return "agent";
  }
  return "buyer";
}

export function getMockDashboardOverview(user: User | null): MockDashboardOverview {
  const role = userRole(user);
  const agentListings = user
    ? mockProperties.filter((property) => property.agent_id === user.id)
    : mockProperties.slice(0, 5);

  if (role === "admin") {
    return {
      role,
      metrics: [
        { label: "Total properties", value: "150", detail: "All listings in the marketplace" },
        { label: "Pending approvals", value: "18", detail: "Awaiting admin review" },
        { label: "Active agents", value: "45", detail: "Verified supply partners" },
        { label: "Verified listings", value: "320", detail: "Trust-reviewed properties" },
      ],
      savedProperties: [],
      recentlyViewed: [],
      recommendedProperties: [],
      inquiries: mockInquiries.slice(0, 5),
      activeListings: mockProperties.slice(0, 6),
      leads: mockInquiries.slice(0, 8),
      pendingApprovals: mockProperties.slice(6, 12),
      userStats: [
        {
          label: "Total users",
          value: String(mockUsers.length + 1248),
          detail: "Demo cohort plus platform growth",
        },
        {
          label: "Buyers",
          value: String(mockBuyers.length + 876),
          detail: "Verified buyer accounts",
        },
        {
          label: "Agents",
          value: String(mockAgents.length + 40),
          detail: "Professionals in review pipeline",
        },
      ],
    };
  }

  if (role === "agent") {
    return {
      role,
      metrics: [
        {
          label: "Active listings",
          value: String(agentListings.length || 5),
          detail: "Live marketplace inventory",
        },
        { label: "Leads", value: "64", detail: "Qualified buyer inquiries this month" },
        { label: "Property views", value: "8,430", detail: "Across all active listings" },
        { label: "Conversion rate", value: "12.8%", detail: "Inquiry to serious negotiation" },
      ],
      savedProperties: [],
      recentlyViewed: [],
      recommendedProperties: [],
      inquiries: mockInquiries.slice(0, 6),
      activeListings: agentListings.length ? agentListings : mockProperties.slice(0, 5),
      leads: mockInquiries.slice(0, 7),
      pendingApprovals: mockProperties.slice(12, 15),
      userStats: [],
    };
  }

  return {
    role,
    metrics: [
      { label: "Saved properties", value: "3", detail: "Shortlisted for closer review" },
      { label: "Recently viewed", value: "8", detail: "Properties opened this week" },
      { label: "My inquiries", value: "5", detail: "Active conversations with agents" },
      { label: "Recommended", value: "12", detail: "Matched to your buying profile" },
    ],
    savedProperties: mockProperties.slice(0, 3),
    recentlyViewed: mockProperties.slice(3, 7),
    recommendedProperties: mockProperties.slice(7, 11),
    inquiries: mockInquiries.slice(0, 5),
    activeListings: [],
    leads: [],
    pendingApprovals: [],
    userStats: [],
  };
}
