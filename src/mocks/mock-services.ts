import type {
  AdminServicesDashboard,
  AdminProviderDecisionPayload,
  AdminProviderFilters,
  CustomerServicesDashboard,
  OwnerServiceProvider,
  PaginatedProviderAppeals,
  PaginatedServiceComplaints,
  PaginatedServiceProviders,
  PaginatedQuoteRequests,
  PaginatedServiceReviews,
  ProviderAppeal,
  ProviderAppealFilters,
  ProviderAppealPayload,
  PortfolioImage,
  PortfolioImageMetadataPayload,
  PortfolioImagePayload,
  PortfolioReorderPayload,
  QuoteRequest,
  QuoteRequestFilters,
  QuoteRequestPayload,
  ServiceBookingSummary,
  ServiceComplaint,
  ServiceComplaintFilters,
  ServiceComplaintPayload,
  ServiceProvider,
  ServiceProviderFilters,
  ProviderServicesDashboard,
  ServiceReview,
  ServiceReviewFilters,
  ServiceReviewFlagReason,
  ServiceReviewPayload,
  ProviderProfilePayload,
  ProviderTrade,
  ProviderTradePayload,
  ServiceArea,
  ServiceAreaPayload,
  TradeCategory,
} from "@/lib/api/services";

export const mockTradeCategories: TradeCategory[] = [
  {
    id: "cat-repairs",
    name: "Repairs",
    slug: "repairs",
    parent: null,
    description: "Repair and maintenance services for homes and properties.",
    icon: "wrench",
    display_order: 10,
    requires_certification: false,
    is_active: true,
    children: [
      {
        id: "cat-electrical",
        name: "Electrical",
        slug: "electrical",
        parent: "cat-repairs",
        description: "Electrical repairs and installations.",
        icon: "zap",
        display_order: 10,
        requires_certification: true,
        is_active: true,
        children: [],
      },
      {
        id: "cat-plumbing",
        name: "Plumbing",
        slug: "plumbing",
        parent: "cat-repairs",
        description: "Plumbing repairs and water systems.",
        icon: "droplet",
        display_order: 20,
        requires_certification: true,
        is_active: true,
        children: [],
      },
      {
        id: "cat-painting",
        name: "Painting",
        slug: "painting",
        parent: "cat-repairs",
        description: "Interior and exterior painting.",
        icon: "paintbrush",
        display_order: 30,
        requires_certification: false,
        is_active: true,
        children: [],
      },
      {
        id: "cat-carpentry",
        name: "Carpentry",
        slug: "carpentry",
        parent: "cat-repairs",
        description: "Woodwork, doors, fittings, and repairs.",
        icon: "hammer",
        display_order: 40,
        requires_certification: false,
        is_active: true,
        children: [],
      },
    ],
  },
  {
    id: "cat-utilities",
    name: "Utilities",
    slug: "utilities",
    parent: null,
    description: "Installation and utility services for connected properties.",
    icon: "plug",
    display_order: 20,
    requires_certification: false,
    is_active: true,
    children: [
      {
        id: "cat-cctv",
        name: "CCTV",
        slug: "cctv",
        parent: "cat-utilities",
        description: "CCTV and security camera installation.",
        icon: "camera",
        display_order: 10,
        requires_certification: true,
        is_active: true,
        children: [],
      },
      {
        id: "cat-solar",
        name: "Solar",
        slug: "solar",
        parent: "cat-utilities",
        description: "Solar power installation and maintenance.",
        icon: "sun",
        display_order: 20,
        requires_certification: true,
        is_active: true,
        children: [],
      },
      {
        id: "cat-internet",
        name: "Internet Installation",
        slug: "internet-installation",
        parent: "cat-utilities",
        description: "Internet and connectivity installation.",
        icon: "wifi",
        display_order: 30,
        requires_certification: false,
        is_active: true,
        children: [],
      },
    ],
  },
  {
    id: "cat-home-services",
    name: "Home Services",
    slug: "home-services",
    parent: null,
    description: "Move-in, cleaning, and home support services.",
    icon: "home",
    display_order: 30,
    requires_certification: false,
    is_active: true,
    children: [
      {
        id: "cat-cleaning",
        name: "Cleaning",
        slug: "cleaning",
        parent: "cat-home-services",
        description: "Residential and commercial cleaning.",
        icon: "sparkles",
        display_order: 10,
        requires_certification: false,
        is_active: true,
        children: [],
      },
      {
        id: "cat-moving",
        name: "Moving",
        slug: "moving",
        parent: "cat-home-services",
        description: "Moving, relocation, and packing services.",
        icon: "truck",
        display_order: 20,
        requires_certification: false,
        is_active: true,
        children: [],
      },
      {
        id: "cat-pest-control",
        name: "Pest Control",
        slug: "pest-control",
        parent: "cat-home-services",
        description: "Pest inspection and treatment.",
        icon: "shield",
        display_order: 30,
        requires_certification: true,
        is_active: true,
        children: [],
      },
    ],
  },
  {
    id: "cat-construction-services",
    name: "Construction",
    slug: "construction-services",
    parent: null,
    description: "Construction and professional building services.",
    icon: "hard-hat",
    display_order: 40,
    requires_certification: false,
    is_active: true,
    children: [
      {
        id: "cat-construction",
        name: "Construction",
        slug: "construction",
        parent: "cat-construction-services",
        description: "General construction services.",
        icon: "building",
        display_order: 10,
        requires_certification: true,
        is_active: true,
        children: [],
      },
      {
        id: "cat-architecture",
        name: "Architecture",
        slug: "architecture",
        parent: "cat-construction-services",
        description: "Architectural design and planning.",
        icon: "drafting-compass",
        display_order: 20,
        requires_certification: true,
        is_active: true,
        children: [],
      },
      {
        id: "cat-surveying",
        name: "Surveying",
        slug: "surveying",
        parent: "cat-construction-services",
        description: "Land and building surveying services.",
        icon: "map",
        display_order: 30,
        requires_certification: true,
        is_active: true,
        children: [],
      },
    ],
  },
];

const mockProviders: ServiceProvider[] = [
  {
    id: "provider-bright-spark",
    slug: "bright-spark-electrical",
    provider_type: "individual",
    business_name: "Bright Spark Electrical",
    headline: "Verified electrical repairs across Lagos",
    biography:
      "Residential wiring, inverter setup, lighting upgrades, and fault finding for apartments and family homes.",
    phone: "+2348012345678",
    email: "hello@brightspark.ng",
    country: "Nigeria",
    state: "Lagos",
    city: "Lagos",
    lga: "Eti-Osa",
    neighborhood: "Lekki",
    display_location: "Lekki, Lagos",
    verification_badges: [
      { label: "Identity Verified", status: "approved", verified_at: "2026-07-01" },
      { label: "Trade Verified", status: "approved", verified_at: "2026-07-03" },
    ],
    average_rating: "4.70",
    average_quality_rating: "4.80",
    average_punctuality_rating: "4.60",
    average_communication_rating: "4.70",
    average_value_rating: "4.60",
    published_review_count: 6,
    recommendation_percentage: 92,
    completed_jobs_count: 12,
    review_trust_signals: [
      { label: "Completed Jobs", status: "approved", value: "12" },
      { label: "Highly Rated", status: "approved", value: "4.70" },
      { label: "Recommended by Customers", status: "approved", value: "92%" },
    ],
    trades: [
      {
        id: "trade-bright-electrical",
        category: mockTradeCategories[0].children[0],
        is_primary: true,
        years_experience: 8,
        skill_level: "expert",
      },
    ],
    primary_trade: {
      id: "trade-bright-electrical",
      category: mockTradeCategories[0].children[0],
      is_primary: true,
      years_experience: 8,
      skill_level: "expert",
    },
    service_areas: [
      {
        id: "area-bright-lekki",
        country: "Nigeria",
        state: "Lagos",
        city: "Lagos",
        lga: "Eti-Osa",
        neighborhood: "Lekki",
        service_radius_km: 15,
      },
    ],
    portfolio: { items: [], message: "Portfolio uploads will be available in Sprint 9.2." },
    reviews_summary: reviewSummary("4.70", 6, 92, 12),
    created_at: "2026-07-31T08:00:00Z",
  },
  {
    id: "provider-clean-haven",
    slug: "clean-haven-services",
    provider_type: "company",
    business_name: "Clean Haven Services",
    headline: "Move-in and post-renovation cleaning for premium properties",
    biography:
      "Professional cleaning teams for shortlets, apartments, and newly completed homes in Abuja.",
    phone: "+2348023456789",
    email: "bookings@cleanhaven.ng",
    country: "Nigeria",
    state: "FCT",
    city: "Abuja",
    lga: "Municipal",
    neighborhood: "Maitama",
    display_location: "Maitama, Abuja",
    verification_badges: [
      { label: "Business Verified", status: "approved", verified_at: "2026-07-05" },
    ],
    average_rating: "4.50",
    average_quality_rating: "4.50",
    average_punctuality_rating: "4.40",
    average_communication_rating: "4.60",
    average_value_rating: "4.40",
    published_review_count: 5,
    recommendation_percentage: 80,
    completed_jobs_count: 9,
    review_trust_signals: [
      { label: "Completed Jobs", status: "approved", value: "9" },
      { label: "Highly Rated", status: "approved", value: "4.50" },
      { label: "Recommended by Customers", status: "approved", value: "80%" },
    ],
    trades: [
      {
        id: "trade-clean-haven",
        category: mockTradeCategories[2].children[0],
        is_primary: true,
        years_experience: 5,
        skill_level: "expert",
      },
    ],
    primary_trade: {
      id: "trade-clean-haven",
      category: mockTradeCategories[2].children[0],
      is_primary: true,
      years_experience: 5,
      skill_level: "expert",
    },
    service_areas: [
      {
        id: "area-clean-abuja",
        country: "Nigeria",
        state: "FCT",
        city: "Abuja",
        lga: "Municipal",
        neighborhood: "Maitama",
        service_radius_km: 20,
      },
    ],
    portfolio: { items: [], message: "Portfolio uploads will be available in Sprint 9.2." },
    reviews_summary: reviewSummary("4.50", 5, 80, 9),
    created_at: "2026-07-30T08:00:00Z",
  },
];

let mockOwnerProfile: OwnerServiceProvider | null = {
  ...mockProviders[0],
  status: "draft",
  private_address: "House 14, Admiralty Way, Lekki",
  completion: {
    is_complete: true,
    missing_fields: [],
    warnings: ["Submit your profile for RealityNG moderation when ready."],
  },
  portfolio_count: 0,
};

let mockOwnerTrades: ProviderTrade[] = [...(mockOwnerProfile.trades ?? [])];
let mockOwnerServiceAreas: ServiceArea[] = mockOwnerProfile.service_areas.map((area, index) => ({
  ...area,
  is_primary: index === 0,
}));
let mockOwnerPortfolio: PortfolioImage[] = [];
const mockCompletedBooking: ServiceBookingSummary = {
  id: "booking-demo-electrical",
  provider: {
    id: "provider-bright-spark",
    slug: "bright-spark-electrical",
    business_name: "Bright Spark Electrical",
    provider_type: "individual",
    display_location: "Lekki, Lagos",
  },
  title: "Inverter wiring repair",
  service_summary: "Completed inverter wiring repair in a Lekki apartment.",
  status: "completed",
  service_category: mockTradeCategories[0].children[0],
  completed_at: "2026-07-28T10:00:00Z",
  created_at: "2026-07-26T10:00:00Z",
};
const mockEligibleBooking: ServiceBookingSummary = {
  ...mockCompletedBooking,
  id: "booking-demo-painting",
  title: "Move-in paint touch-up",
  service_summary: "Completed wall touch-up before tenant move-in.",
  completed_at: "2026-08-02T13:00:00Z",
  created_at: "2026-08-01T10:00:00Z",
};

let mockServiceReviews: ServiceReview[] = [
  {
    id: "review-bright-spark-1",
    customer: "customer-demo",
    reviewer_label: "A. Verified customer",
    provider: {
      id: "provider-bright-spark",
      slug: "bright-spark-electrical",
      business_name: "Bright Spark Electrical",
      provider_type: "individual",
      display_location: "Lekki, Lagos",
    },
    booking: mockCompletedBooking,
    rating: 5,
    title: "Clean, careful electrical repair",
    comment: "The provider explained the issue clearly and fixed the inverter wiring neatly.",
    would_recommend: true,
    quality_rating: 5,
    punctuality_rating: 5,
    communication_rating: 5,
    value_rating: 4,
    status: "published",
    can_edit: false,
    provider_response: "Thank you for trusting our team.",
    provider_responded_at: "2026-07-29T12:00:00Z",
    moderation_reason: "",
    published_at: "2026-07-29T09:00:00Z",
    created_at: "2026-07-28T15:00:00Z",
    updated_at: "2026-07-29T12:00:00Z",
  },
  {
    id: "review-clean-haven-1",
    customer: "customer-demo",
    reviewer_label: "M. Verified customer",
    provider: {
      id: "provider-clean-haven",
      slug: "clean-haven-services",
      business_name: "Clean Haven Services",
      provider_type: "company",
      display_location: "Maitama, Abuja",
    },
    booking: {
      ...mockCompletedBooking,
      id: "booking-demo-cleaning",
      title: "Move-in deep cleaning",
      service_category: mockTradeCategories[2].children[0],
    },
    rating: 4,
    title: "Reliable cleaning crew",
    comment: "Good communication and the apartment was ready before tenant arrival.",
    would_recommend: true,
    quality_rating: 4,
    punctuality_rating: 4,
    communication_rating: 5,
    value_rating: 4,
    status: "published",
    can_edit: false,
    provider_response: "",
    provider_responded_at: null,
    moderation_reason: "",
    published_at: "2026-07-27T09:00:00Z",
    created_at: "2026-07-26T15:00:00Z",
    updated_at: "2026-07-27T09:00:00Z",
  },
];

let mockQuoteRequests: QuoteRequest[] = [
  {
    id: "quote-demo-electrical",
    customer: null,
    customer_name: "Ada Buyer",
    provider: {
      id: "provider-bright-spark",
      slug: "bright-spark-electrical",
      business_name: "Bright Spark Electrical",
      provider_type: "individual",
      display_location: "Lekki, Lagos",
    },
    service_category: mockTradeCategories[0].children[0],
    project_title: "Repair inverter wiring",
    project_description: "The inverter trips when power changes over in the apartment.",
    budget_range: "NGN 100,000 - 250,000",
    preferred_contact_method: "whatsapp",
    phone: "+2348090000000",
    email: "ada@example.com",
    property_address: "Lekki Phase 1",
    state: "Lagos",
    lga: "Eti-Osa",
    preferred_start_date: "2026-08-12",
    status: "submitted",
    viewed_at: null,
    responded_at: null,
    closed_at: null,
    created_at: "2026-08-01T09:00:00Z",
    updated_at: "2026-08-01T09:00:00Z",
  },
];

let mockServiceComplaints: ServiceComplaint[] = [
  {
    id: "complaint-demo-service-quality",
    complainant: "customer-demo",
    complainant_email: "ada@example.com",
    provider: {
      id: "provider-bright-spark",
      slug: "bright-spark-electrical",
      business_name: "Bright Spark Electrical",
      provider_type: "individual",
      display_location: "Lekki, Lagos",
    },
    quote_request: "quote-demo-electrical",
    review: null,
    booking: null,
    complaint_type: "customer",
    category: "service_quality",
    subject: "Follow-up needed on repair scope",
    description: "The customer wants the provider response reviewed by operations.",
    status: "open",
    assigned_admin: null,
    assigned_admin_email: "",
    resolution_notes: "",
    evidence: [],
    created_at: "2026-08-02T11:00:00Z",
    updated_at: "2026-08-02T11:00:00Z",
  },
];

let mockProviderAppeals: ProviderAppeal[] = [
  {
    id: "appeal-demo-warning",
    provider: {
      id: "provider-bright-spark",
      slug: "bright-spark-electrical",
      business_name: "Bright Spark Electrical",
      provider_type: "individual",
      display_location: "Lekki, Lagos",
    },
    submitted_by: "provider-owner",
    submitted_by_email: "artisan@example.com",
    appeal_type: "warning",
    reason: "We have updated our response workflow and request warning review.",
    status: "submitted",
    admin_notes: "",
    decided_by: null,
    decided_by_email: "",
    decided_at: null,
    created_at: "2026-08-03T10:00:00Z",
    updated_at: "2026-08-03T10:00:00Z",
  },
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function reviewSummary(
  average: string,
  count: number,
  recommendation: number,
  completedJobs: number,
) {
  return {
    average_rating: average,
    average_quality_rating: average,
    average_punctuality_rating: average,
    average_communication_rating: average,
    average_value_rating: average,
    completed_jobs_count: completedJobs,
    review_count: count,
    recommendation_percentage: recommendation,
    message:
      "Ratings are calculated from published reviews linked to completed RealityNG service engagements.",
  };
}

function findCategory(id: string) {
  return flattenCategories(mockTradeCategories).find(
    (category) => category.id === id || category.slug === id,
  );
}

function syncOwnerCollections() {
  if (!mockOwnerProfile) return;
  const primaryTrade = mockOwnerTrades.find((trade) => trade.is_primary) ?? mockOwnerTrades[0] ?? null;
  mockOwnerProfile = {
    ...mockOwnerProfile,
    trades: mockOwnerTrades,
    primary_trade: primaryTrade,
    service_areas: mockOwnerServiceAreas,
    portfolio: {
      items: mockOwnerPortfolio,
      message: mockOwnerPortfolio.length
        ? "Approved portfolio samples from this provider."
        : "Add portfolio images to strengthen your public profile.",
    },
    portfolio_count: mockOwnerPortfolio.length,
    completion: buildCompletion(mockOwnerProfile),
  };
}

function requireOwnerProfile() {
  if (!mockOwnerProfile) {
    throw new Error("Create a provider profile first.");
  }
  syncOwnerCollections();
  return mockOwnerProfile;
}

function buildCompletion(provider: OwnerServiceProvider) {
  const missing: string[] = [];
  if (!provider.business_name) missing.push("Business name");
  if (!provider.provider_type) missing.push("Provider type");
  if (!provider.headline) missing.push("Headline");
  if (!provider.biography) missing.push("Biography");
  if (!provider.phone && !provider.email) missing.push("Contact details");
  if (!mockOwnerTrades.some((trade) => trade.is_primary)) missing.push("Primary trade");
  if (mockOwnerServiceAreas.length === 0) missing.push("Service area");
  return {
    is_complete: missing.length === 0,
    missing_fields: missing,
    warnings: provider.status === "active" ? [] : ["Profile must be approved before it is public."],
  };
}

function updateMockProviderStatus(status: OwnerServiceProvider["status"], extra = {}) {
  const provider = requireOwnerProfile();
  mockOwnerProfile = {
    ...provider,
    status,
    ...extra,
    updated_at: new Date().toISOString(),
  };
  syncOwnerCollections();
  return mockOwnerProfile;
}

function flattenCategories(categories: TradeCategory[]): TradeCategory[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children)]);
}

function matchesText(value: string | undefined, query: string | undefined) {
  return (value ?? "").toLowerCase().includes((query ?? "").toLowerCase());
}

function filterQuoteRequests(filters: QuoteRequestFilters = {}) {
  let requests = [...mockQuoteRequests];
  if (filters.status) {
    requests = requests.filter((request) => request.status === filters.status);
  }
  if (filters.search) {
    requests = requests.filter(
      (request) =>
        matchesText(request.project_title, filters.search) ||
        matchesText(request.project_description, filters.search) ||
        matchesText(request.customer_name, filters.search),
    );
  }
  requests.sort((a, b) =>
    filters.ordering === "oldest"
      ? a.created_at.localeCompare(b.created_at)
      : b.created_at.localeCompare(a.created_at),
  );
  return requests;
}

function updateQuoteRequestStatus(id: string, status: QuoteRequest["status"]) {
  let updated: QuoteRequest | null = null;
  const now = new Date().toISOString();
  mockQuoteRequests = mockQuoteRequests.map((request) => {
    if (request.id !== id) return request;
    updated = {
      ...request,
      status,
      viewed_at: status === "viewed" ? now : request.viewed_at,
      responded_at: status === "responded" ? now : request.responded_at,
      closed_at: status === "closed" || status === "cancelled" ? now : request.closed_at,
      updated_at: now,
    };
    return updated;
  });
  if (!updated) throw new Error("Quote request was not found.");
  return updated;
}

function filterComplaints(filters: ServiceComplaintFilters = {}) {
  let complaints = [...mockServiceComplaints];
  if (filters.status) {
    complaints = complaints.filter((complaint) => complaint.status === filters.status);
  }
  if (filters.category) {
    complaints = complaints.filter((complaint) => complaint.category === filters.category);
  }
  if (filters.provider) {
    complaints = complaints.filter((complaint) => complaint.provider.id === filters.provider);
  }
  if (filters.search) {
    complaints = complaints.filter(
      (complaint) =>
        matchesText(complaint.subject, filters.search) ||
        matchesText(complaint.description, filters.search) ||
        matchesText(complaint.provider.business_name, filters.search),
    );
  }
  complaints.sort((a, b) =>
    filters.ordering === "oldest"
      ? a.created_at.localeCompare(b.created_at)
      : b.created_at.localeCompare(a.created_at),
  );
  return complaints;
}

function filterAppeals(filters: ProviderAppealFilters = {}) {
  let appeals = [...mockProviderAppeals];
  if (filters.status) {
    appeals = appeals.filter((appeal) => appeal.status === filters.status);
  }
  if (filters.appeal_type) {
    appeals = appeals.filter((appeal) => appeal.appeal_type === filters.appeal_type);
  }
  if (filters.provider) {
    appeals = appeals.filter((appeal) => appeal.provider.id === filters.provider);
  }
  return appeals.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function mockGetTradeCategories(): Promise<TradeCategory[]> {
  return mockTradeCategories;
}

export async function mockGetServiceProviders(
  filters: ServiceProviderFilters = {},
): Promise<PaginatedServiceProviders> {
  const allCategories = flattenCategories(mockTradeCategories);
  let providers = [...mockProviders];

  if (filters.search) {
    const query = filters.search;
    providers = providers.filter(
      (provider) =>
        matchesText(provider.business_name, query) ||
        matchesText(provider.headline, query) ||
        matchesText(provider.biography, query),
    );
  }
  if (filters.category) {
    const category = allCategories.find((item) => item.slug === filters.category);
    providers = providers.filter((provider) =>
      provider.trades.some((trade) => trade.category.slug === category?.slug),
    );
  }
  if (filters.state) {
    const state = filters.state;
    providers = providers.filter((provider) => matchesText(provider.state, state));
  }
  if (filters.city) {
    const city = filters.city;
    providers = providers.filter((provider) => matchesText(provider.city, city));
  }
  if (filters.lga) {
    const lga = filters.lga;
    providers = providers.filter((provider) => matchesText(provider.lga, lga));
  }
  if (filters.provider_type) {
    providers = providers.filter((provider) => provider.provider_type === filters.provider_type);
  }
  if (filters.ordering === "business_name") {
    providers.sort((a, b) => a.business_name.localeCompare(b.business_name));
  } else if (filters.ordering === "-average_rating") {
    providers.sort((a, b) => Number(b.average_rating) - Number(a.average_rating));
  } else {
    providers.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  return {
    count: providers.length,
    next: null,
    previous: null,
    results: providers,
  };
}

export async function mockGetServiceProvider(slug: string): Promise<ServiceProvider> {
  const provider = mockProviders.find((item) => item.slug === slug);
  if (!provider) {
    throw new Error("Service provider not found.");
  }
  return provider;
}

export async function mockCreateProviderProfile(
  payload: ProviderProfilePayload,
): Promise<OwnerServiceProvider> {
  if (mockOwnerProfile) {
    throw new Error("You already have a provider profile.");
  }
  mockOwnerProfile = {
    id: createId("provider"),
    slug: payload.business_name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ?? "my-provider",
    status: "draft",
    provider_type: payload.provider_type ?? "individual",
    business_name: payload.business_name ?? "",
    headline: payload.headline ?? "",
    biography: payload.biography ?? "",
    phone: payload.phone ?? "",
    email: payload.email ?? "",
    country: payload.country ?? "Nigeria",
    state: payload.state ?? "",
    city: payload.city ?? "",
    lga: payload.lga ?? "",
    neighborhood: payload.neighborhood ?? "",
    display_location: payload.display_location ?? [payload.city, payload.state].filter(Boolean).join(", "),
    private_address: payload.private_address ?? "",
    verification_badges: [],
    average_rating: "0.00",
    completed_jobs_count: 0,
    trades: [],
    primary_trade: null,
    service_areas: [],
    portfolio: { items: [], message: "Add portfolio images to strengthen your public profile." },
    reviews_summary: {
      average_rating: "0.00",
      completed_jobs_count: 0,
      review_count: 0,
      message: "Verified booking reviews will be available in a later Sprint 9 phase.",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completion: { is_complete: false, missing_fields: [], warnings: [] },
    portfolio_count: 0,
  };
  mockOwnerTrades = [];
  mockOwnerServiceAreas = [];
  mockOwnerPortfolio = [];
  syncOwnerCollections();
  return mockOwnerProfile;
}

export async function mockGetMyProviderProfile(): Promise<OwnerServiceProvider> {
  return requireOwnerProfile();
}

export async function mockUpdateMyProviderProfile(
  payload: ProviderProfilePayload,
): Promise<OwnerServiceProvider> {
  const provider = requireOwnerProfile();
  mockOwnerProfile = {
    ...provider,
    ...payload,
    display_location:
      payload.display_location ??
      provider.display_location ??
      [payload.city ?? provider.city, payload.state ?? provider.state].filter(Boolean).join(", "),
    updated_at: new Date().toISOString(),
  };
  syncOwnerCollections();
  return mockOwnerProfile;
}

export async function mockSubmitProviderProfile(): Promise<OwnerServiceProvider> {
  const provider = requireOwnerProfile();
  const completion = buildCompletion(provider);
  if (!completion.is_complete) {
    throw new Error(`Complete these items first: ${completion.missing_fields.join(", ")}`);
  }
  return updateMockProviderStatus("pending_review", { submitted_at: new Date().toISOString() });
}

export async function mockDeactivateProviderProfile(): Promise<OwnerServiceProvider> {
  return updateMockProviderStatus("inactive");
}

export async function mockListProviderTrades(): Promise<ProviderTrade[]> {
  syncOwnerCollections();
  return mockOwnerTrades;
}

export async function mockCreateProviderTrade(payload: ProviderTradePayload): Promise<ProviderTrade> {
  const category = findCategory(payload.category_id);
  if (!category) throw new Error("Trade category was not found.");
  if (mockOwnerTrades.some((trade) => trade.category.id === category.id)) {
    throw new Error("This trade category is already selected.");
  }
  if (payload.is_primary || mockOwnerTrades.length === 0) {
    mockOwnerTrades = mockOwnerTrades.map((trade) => ({ ...trade, is_primary: false }));
  }
  const trade: ProviderTrade = {
    id: createId("trade"),
    category,
    is_primary: payload.is_primary ?? mockOwnerTrades.length === 0,
    years_experience: payload.years_experience ?? null,
    skill_level: payload.skill_level ?? "intermediate",
  };
  mockOwnerTrades.push(trade);
  syncOwnerCollections();
  return trade;
}

export async function mockUpdateProviderTrade(
  id: string,
  payload: Partial<ProviderTradePayload>,
): Promise<ProviderTrade> {
  let updated: ProviderTrade | null = null;
  if (payload.is_primary) {
    mockOwnerTrades = mockOwnerTrades.map((trade) => ({ ...trade, is_primary: false }));
  }
  mockOwnerTrades = mockOwnerTrades.map((trade) => {
    if (trade.id !== id) return trade;
    updated = {
      ...trade,
      is_primary: payload.is_primary ?? trade.is_primary,
      years_experience: payload.years_experience ?? trade.years_experience,
      skill_level: payload.skill_level ?? trade.skill_level,
    };
    return updated;
  });
  if (!updated) throw new Error("Trade was not found.");
  syncOwnerCollections();
  return updated;
}

export async function mockDeleteProviderTrade(id: string): Promise<void> {
  const wasPrimary = mockOwnerTrades.find((trade) => trade.id === id)?.is_primary;
  mockOwnerTrades = mockOwnerTrades.filter((trade) => trade.id !== id);
  if (wasPrimary && mockOwnerTrades[0]) {
    mockOwnerTrades[0] = { ...mockOwnerTrades[0], is_primary: true };
  }
  syncOwnerCollections();
}

export async function mockListServiceAreas(): Promise<ServiceArea[]> {
  syncOwnerCollections();
  return mockOwnerServiceAreas;
}

export async function mockCreateServiceArea(payload: ServiceAreaPayload): Promise<ServiceArea> {
  if (payload.is_primary || mockOwnerServiceAreas.length === 0) {
    mockOwnerServiceAreas = mockOwnerServiceAreas.map((area) => ({ ...area, is_primary: false }));
  }
  const area: ServiceArea = {
    id: createId("area"),
    country: payload.country ?? "Nigeria",
    state: payload.state,
    city: payload.city,
    lga: payload.lga ?? "",
    neighborhood: payload.neighborhood ?? "",
    service_radius_km: payload.service_radius_km ?? null,
    is_primary: payload.is_primary ?? mockOwnerServiceAreas.length === 0,
  };
  mockOwnerServiceAreas.push(area);
  syncOwnerCollections();
  return area;
}

export async function mockUpdateServiceArea(
  id: string,
  payload: Partial<ServiceAreaPayload>,
): Promise<ServiceArea> {
  let updated: ServiceArea | null = null;
  if (payload.is_primary) {
    mockOwnerServiceAreas = mockOwnerServiceAreas.map((area) => ({ ...area, is_primary: false }));
  }
  mockOwnerServiceAreas = mockOwnerServiceAreas.map((area) => {
    if (area.id !== id) return area;
    updated = { ...area, ...payload };
    return updated;
  });
  if (!updated) throw new Error("Service area was not found.");
  syncOwnerCollections();
  return updated;
}

export async function mockDeleteServiceArea(id: string): Promise<void> {
  const wasPrimary = mockOwnerServiceAreas.find((area) => area.id === id)?.is_primary;
  mockOwnerServiceAreas = mockOwnerServiceAreas.filter((area) => area.id !== id);
  if (wasPrimary && mockOwnerServiceAreas[0]) {
    mockOwnerServiceAreas[0] = { ...mockOwnerServiceAreas[0], is_primary: true };
  }
  syncOwnerCollections();
}

export async function mockListPortfolioImages(): Promise<PortfolioImage[]> {
  return mockOwnerPortfolio;
}

export async function mockCreatePortfolioImage(
  payload: PortfolioImagePayload,
): Promise<PortfolioImage> {
  if (!payload.image.type.startsWith("image/")) {
    throw new Error("Upload a valid image file.");
  }
  const image: PortfolioImage = {
    id: createId("portfolio"),
    image_url: URL.createObjectURL(payload.image),
    caption: payload.caption ?? "",
    category: payload.category_id ? findCategory(payload.category_id) ?? null : null,
    display_order: payload.display_order ?? mockOwnerPortfolio.length,
    is_cover: payload.is_cover ?? mockOwnerPortfolio.length === 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (image.is_cover) {
    mockOwnerPortfolio = mockOwnerPortfolio.map((item) => ({ ...item, is_cover: false }));
  }
  mockOwnerPortfolio.push(image);
  syncOwnerCollections();
  return image;
}

export async function mockUpdatePortfolioImage(
  id: string,
  payload: PortfolioImageMetadataPayload,
): Promise<PortfolioImage> {
  let updated: PortfolioImage | null = null;
  if (payload.is_cover) {
    mockOwnerPortfolio = mockOwnerPortfolio.map((image) => ({ ...image, is_cover: false }));
  }
  mockOwnerPortfolio = mockOwnerPortfolio.map((image) => {
    if (image.id !== id) return image;
    updated = {
      ...image,
      caption: payload.caption ?? image.caption,
      category: payload.category_id ? findCategory(payload.category_id) ?? null : image.category,
      display_order: payload.display_order ?? image.display_order,
      is_cover: payload.is_cover ?? image.is_cover,
      updated_at: new Date().toISOString(),
    };
    return updated;
  });
  if (!updated) throw new Error("Portfolio image was not found.");
  syncOwnerCollections();
  return updated;
}

export async function mockDeletePortfolioImage(id: string): Promise<void> {
  const wasCover = mockOwnerPortfolio.find((image) => image.id === id)?.is_cover;
  mockOwnerPortfolio = mockOwnerPortfolio.filter((image) => image.id !== id);
  if (wasCover && mockOwnerPortfolio[0]) {
    mockOwnerPortfolio[0] = { ...mockOwnerPortfolio[0], is_cover: true };
  }
  syncOwnerCollections();
}

export async function mockSetPortfolioCover(id: string): Promise<PortfolioImage> {
  let selected: PortfolioImage | null = null;
  mockOwnerPortfolio = mockOwnerPortfolio.map((image) => {
    const next = { ...image, is_cover: image.id === id };
    if (next.is_cover) selected = next;
    return next;
  });
  if (!selected) throw new Error("Portfolio image was not found.");
  syncOwnerCollections();
  return selected;
}

export async function mockReorderPortfolioImages(
  payload: PortfolioReorderPayload,
): Promise<PortfolioImage[]> {
  const order = new Map(payload.items.map((item) => [item.id, item.display_order]));
  mockOwnerPortfolio = mockOwnerPortfolio
    .map((image) => ({ ...image, display_order: order.get(image.id) ?? image.display_order }))
    .sort((a, b) => a.display_order - b.display_order);
  syncOwnerCollections();
  return mockOwnerPortfolio;
}

export async function mockAdminListProviders(
  filters: AdminProviderFilters = {},
): Promise<PaginatedServiceProviders> {
  const providers = [requireOwnerProfile(), ...mockProviders].filter((provider) => {
    if (filters.status && provider.status !== filters.status) return false;
    if (filters.provider_type && provider.provider_type !== filters.provider_type) return false;
    if (filters.state && !matchesText(provider.state, filters.state)) return false;
    if (filters.city && !matchesText(provider.city, filters.city)) return false;
    if (filters.search && !matchesText(provider.business_name, filters.search)) return false;
    return true;
  });
  return { count: providers.length, next: null, previous: null, results: providers };
}

export async function mockAdminGetProvider(id: string): Promise<OwnerServiceProvider> {
  const owner = requireOwnerProfile();
  if (owner.id === id) return owner;
  const provider = mockProviders.find((item) => item.id === id);
  if (!provider) throw new Error("Provider was not found.");
  return { ...provider, status: provider.status ?? "active", completion: buildCompletion(owner) };
}

export async function mockAdminApproveProvider(id: string): Promise<OwnerServiceProvider> {
  if (requireOwnerProfile().id !== id) return mockAdminGetProvider(id);
  return updateMockProviderStatus("active", { reviewed_at: new Date().toISOString() });
}

export async function mockAdminRejectProvider(
  id: string,
  payload: AdminProviderDecisionPayload,
): Promise<OwnerServiceProvider> {
  if (requireOwnerProfile().id !== id) return mockAdminGetProvider(id);
  return updateMockProviderStatus("rejected", { rejection_reason: payload.reason ?? "" });
}

export async function mockAdminRequestProviderInfo(
  id: string,
  payload: AdminProviderDecisionPayload,
): Promise<OwnerServiceProvider> {
  if (requireOwnerProfile().id !== id) return mockAdminGetProvider(id);
  return updateMockProviderStatus("needs_more_information", {
    more_info_message: payload.message ?? "",
  });
}

export async function mockAdminSuspendProvider(
  id: string,
  payload: AdminProviderDecisionPayload,
): Promise<OwnerServiceProvider> {
  if (requireOwnerProfile().id !== id) return mockAdminGetProvider(id);
  return updateMockProviderStatus("suspended", {
    suspended_reason: payload.reason ?? "",
    suspension_type: payload.suspension_type ?? "temporary",
    suspension_expires_at: payload.suspension_expires_at ?? null,
  });
}

export async function mockAdminWarnProvider(
  id: string,
  payload: AdminProviderDecisionPayload,
): Promise<OwnerServiceProvider> {
  const provider = requireOwnerProfile();
  if (provider.id !== id) return mockAdminGetProvider(id);
  return updateMockProviderStatus(provider.status, {
    warning_count: (provider.warning_count ?? 0) + 1,
    last_warning_reason: payload.reason ?? "",
  });
}

export async function mockAdminReactivateProvider(id: string): Promise<OwnerServiceProvider> {
  if (requireOwnerProfile().id !== id) return mockAdminGetProvider(id);
  return updateMockProviderStatus("active", {
    suspended_reason: "",
    suspension_type: "",
    suspension_expires_at: null,
    appeal_status: "",
  });
}

export async function mockCreateQuoteRequest(
  providerSlug: string,
  payload: QuoteRequestPayload,
): Promise<QuoteRequest> {
  const provider = mockProviders.find((item) => item.slug === providerSlug);
  if (!provider) {
    throw new Error("Service provider not found.");
  }
  if (!payload.customer_name || !payload.phone || !payload.email) {
    throw new Error("Name, phone, and email are required for quote requests.");
  }
  const category = payload.service_category_id ? findCategory(payload.service_category_id) : null;
  const now = new Date().toISOString();
  const request: QuoteRequest = {
    id: createId("quote"),
    customer: null,
    customer_name: payload.customer_name,
    provider: {
      id: provider.id,
      slug: provider.slug,
      business_name: provider.business_name,
      provider_type: provider.provider_type,
      display_location: provider.display_location,
    },
    service_category: category ?? provider.primary_trade?.category ?? null,
    project_title: payload.project_title,
    project_description: payload.project_description,
    budget_range: payload.budget_range ?? "",
    preferred_contact_method: payload.preferred_contact_method,
    phone: payload.phone ?? "",
    email: payload.email ?? "",
    property_address: payload.property_address ?? "",
    state: payload.state,
    lga: payload.lga ?? "",
    preferred_start_date: payload.preferred_start_date ?? null,
    status: "submitted",
    viewed_at: null,
    responded_at: null,
    closed_at: null,
    created_at: now,
    updated_at: now,
  };
  mockQuoteRequests = [request, ...mockQuoteRequests];
  return request;
}

export async function mockListProviderQuoteRequests(
  filters: QuoteRequestFilters = {},
): Promise<PaginatedQuoteRequests> {
  const provider = requireOwnerProfile();
  const results = filterQuoteRequests(filters).filter(
    (request) => request.provider.id === provider.id || request.provider.slug === provider.slug,
  );
  return { count: results.length, next: null, previous: null, results };
}

export async function mockMarkQuoteRequestViewed(id: string): Promise<QuoteRequest> {
  return updateQuoteRequestStatus(id, "viewed");
}

export async function mockMarkQuoteRequestResponded(id: string): Promise<QuoteRequest> {
  return updateQuoteRequestStatus(id, "responded");
}

export async function mockMarkQuoteRequestClosed(id: string): Promise<QuoteRequest> {
  return updateQuoteRequestStatus(id, "closed");
}

export async function mockAdminListQuoteRequests(
  filters: QuoteRequestFilters = {},
): Promise<PaginatedQuoteRequests> {
  const results = filterQuoteRequests(filters);
  return { count: results.length, next: null, previous: null, results };
}

export async function mockAdminCloseQuoteRequest(id: string): Promise<QuoteRequest> {
  return updateQuoteRequestStatus(id, "closed");
}

function filterServiceReviews(filters: ServiceReviewFilters = {}) {
  let reviews = [...mockServiceReviews];
  if (filters.status) {
    reviews = reviews.filter((review) => review.status === filters.status);
  }
  if (filters.provider) {
    reviews = reviews.filter((review) => review.provider?.id === filters.provider);
  }
  if (filters.rating) {
    reviews = reviews.filter((review) => String(review.rating) === filters.rating);
  }
  if (filters.recommended === "true") {
    reviews = reviews.filter((review) => review.would_recommend);
  }
  if (filters.flagged === "true") {
    reviews = reviews.filter((review) => review.status === "flagged");
  }
  if (filters.ordering === "highest") {
    reviews.sort((left, right) => right.rating - left.rating);
  } else if (filters.ordering === "lowest") {
    reviews.sort((left, right) => left.rating - right.rating);
  } else if (filters.ordering === "oldest") {
    reviews.sort((left, right) => left.created_at.localeCompare(right.created_at));
  } else {
    reviews.sort((left, right) => right.created_at.localeCompare(left.created_at));
  }
  return reviews;
}

function updateMockReview(id: string, updates: Partial<ServiceReview>) {
  let updated: ServiceReview | null = null;
  mockServiceReviews = mockServiceReviews.map((review) => {
    if (review.id !== id) return review;
    updated = { ...review, ...updates, updated_at: new Date().toISOString() };
    return updated;
  });
  if (!updated) throw new Error("Review was not found.");
  return updated;
}

export async function mockListServiceReviews(
  providerSlug: string,
  filters: ServiceReviewFilters = {},
): Promise<PaginatedServiceReviews> {
  const results = filterServiceReviews(filters).filter(
    (review) => review.provider?.slug === providerSlug && review.status === "published",
  );
  return { count: results.length, next: null, previous: null, results };
}

export async function mockCreateServiceReview(
  payload: ServiceReviewPayload,
): Promise<ServiceReview> {
  if (payload.booking_id !== mockCompletedBooking.id) {
    throw new Error("Only completed service bookings can be reviewed.");
  }
  if (mockServiceReviews.some((review) => review.booking.id === payload.booking_id)) {
    throw new Error("A review already exists for this booking.");
  }
  const now = new Date().toISOString();
  const review: ServiceReview = {
    id: createId("review"),
    customer: "customer-demo",
    reviewer_label: "Verified customer",
    provider: {
      id: "provider-bright-spark",
      slug: "bright-spark-electrical",
      business_name: "Bright Spark Electrical",
      provider_type: "individual",
      display_location: "Lekki, Lagos",
    },
    booking: mockCompletedBooking,
    rating: payload.rating,
    title: payload.title,
    comment: payload.comment,
    would_recommend: payload.would_recommend,
    quality_rating: payload.quality_rating ?? null,
    punctuality_rating: payload.punctuality_rating ?? null,
    communication_rating: payload.communication_rating ?? null,
    value_rating: payload.value_rating ?? null,
    status: "pending",
    can_edit: true,
    provider_response: "",
    provider_responded_at: null,
    moderation_reason: "",
    published_at: null,
    created_at: now,
    updated_at: now,
  };
  mockServiceReviews = [review, ...mockServiceReviews];
  return review;
}

export async function mockListProviderServiceReviews(
  filters: ServiceReviewFilters = {},
): Promise<PaginatedServiceReviews> {
  const provider = requireOwnerProfile();
  const results = filterServiceReviews(filters).filter(
    (review) => review.provider?.id === provider.id || review.provider?.slug === provider.slug,
  );
  return { count: results.length, next: null, previous: null, results };
}

export async function mockRespondToServiceReview(
  id: string,
  responseText: string,
): Promise<ServiceReview> {
  const review = mockServiceReviews.find((item) => item.id === id);
  if (!review || review.status !== "published") {
    throw new Error("Only published reviews can receive provider responses.");
  }
  if (review.provider_response) {
    throw new Error("This review already has a provider response.");
  }
  return updateMockReview(id, {
    provider_response: responseText,
    provider_responded_at: new Date().toISOString(),
  });
}

export async function mockFlagServiceReview(
  id: string,
  reason: ServiceReviewFlagReason,
  details = "",
): Promise<ServiceReview> {
  void details;
  return updateMockReview(id, {
    status:
      reason === "privacy_concern" || reason === "conflict_of_interest"
        ? "flagged"
        : "published",
  });
}

export async function mockAdminListServiceReviews(
  filters: ServiceReviewFilters = {},
): Promise<PaginatedServiceReviews> {
  const results = filterServiceReviews(filters);
  return { count: results.length, next: null, previous: null, results };
}

export async function mockAdminGetServiceReview(id: string): Promise<ServiceReview> {
  const review = mockServiceReviews.find((item) => item.id === id);
  if (!review) throw new Error("Review was not found.");
  return review;
}

export async function mockAdminModerateServiceReview(
  id: string,
  action: "publish" | "hide" | "restore" | "remove" | "mark-disputed",
  reason = "",
): Promise<ServiceReview> {
  const statusByAction: Record<typeof action, ServiceReview["status"]> = {
    publish: "published",
    hide: "hidden",
    restore: "published",
    remove: "removed",
    "mark-disputed": "disputed",
  };
  return updateMockReview(id, {
    status: statusByAction[action],
    moderation_reason: reason,
    published_at:
      action === "publish" || action === "restore" ? new Date().toISOString() : undefined,
  });
}

export async function mockSubmitServiceComplaint(
  payload: ServiceComplaintPayload,
): Promise<ServiceComplaint> {
  const provider =
    mockProviders.find((item) => item.id === payload.provider_id) ?? requireOwnerProfile();
  const now = new Date().toISOString();
  const complaint: ServiceComplaint = {
    id: createId("complaint"),
    complainant: "mock-user",
    complainant_email: "demo@realityng.com",
    provider: {
      id: provider.id,
      slug: provider.slug,
      business_name: provider.business_name,
      provider_type: provider.provider_type,
      display_location: provider.display_location,
    },
    quote_request: payload.quote_request_id ?? null,
    review: payload.review_id ?? null,
    booking: payload.booking_id ?? null,
    complaint_type: payload.complaint_type,
    category: payload.category,
    subject: payload.subject,
    description: payload.description,
    status: "open",
    assigned_admin: null,
    assigned_admin_email: "",
    resolution_notes: "",
    evidence: [],
    created_at: now,
    updated_at: now,
  };
  mockServiceComplaints = [complaint, ...mockServiceComplaints];
  return complaint;
}

export async function mockListMyServiceComplaints(
  filters: ServiceComplaintFilters = {},
): Promise<PaginatedServiceComplaints> {
  const results = filterComplaints(filters);
  return { count: results.length, next: null, previous: null, results };
}

export async function mockGetMyServiceComplaint(id: string): Promise<ServiceComplaint> {
  return mockAdminGetComplaint(id);
}

export async function mockListProviderComplaints(
  filters: ServiceComplaintFilters = {},
): Promise<PaginatedServiceComplaints> {
  const provider = requireOwnerProfile();
  const results = filterComplaints(filters).filter(
    (complaint) => complaint.provider.id === provider.id || complaint.complainant === "mock-user",
  );
  return { count: results.length, next: null, previous: null, results };
}

export async function mockGetProviderComplaint(id: string): Promise<ServiceComplaint> {
  return mockAdminGetComplaint(id);
}

export async function mockSubmitProviderAppeal(
  payload: ProviderAppealPayload,
): Promise<ProviderAppeal> {
  const provider = requireOwnerProfile();
  const now = new Date().toISOString();
  const appeal: ProviderAppeal = {
    id: createId("appeal"),
    provider: {
      id: provider.id,
      slug: provider.slug,
      business_name: provider.business_name,
      provider_type: provider.provider_type,
      display_location: provider.display_location,
    },
    submitted_by: "mock-user",
    submitted_by_email: "artisan@example.com",
    appeal_type: payload.appeal_type,
    reason: payload.reason,
    status: "submitted",
    admin_notes: "",
    decided_by: null,
    decided_by_email: "",
    decided_at: null,
    created_at: now,
    updated_at: now,
  };
  mockProviderAppeals = [appeal, ...mockProviderAppeals];
  mockOwnerProfile = { ...provider, appeal_status: "submitted", updated_at: now };
  return appeal;
}

export async function mockListProviderAppeals(
  filters: ProviderAppealFilters = {},
): Promise<PaginatedProviderAppeals> {
  const provider = requireOwnerProfile();
  const results = filterAppeals(filters).filter((appeal) => appeal.provider.id === provider.id);
  return { count: results.length, next: null, previous: null, results };
}

export async function mockGetProviderAppeal(id: string): Promise<ProviderAppeal> {
  return mockAdminGetAppeal(id);
}

export async function mockAdminListComplaints(
  filters: ServiceComplaintFilters = {},
): Promise<PaginatedServiceComplaints> {
  const results = filterComplaints(filters);
  return { count: results.length, next: null, previous: null, results };
}

export async function mockAdminGetComplaint(id: string): Promise<ServiceComplaint> {
  const complaint = mockServiceComplaints.find((item) => item.id === id);
  if (!complaint) throw new Error("Complaint was not found.");
  return complaint;
}

export async function mockAdminModerateComplaint(
  id: string,
  action:
    | "review"
    | "resolve"
    | "reject"
    | "escalate"
    | "close"
    | "await-customer"
    | "await-provider",
  notes = "",
): Promise<ServiceComplaint> {
  const statusByAction: Record<typeof action, ServiceComplaint["status"]> = {
    review: "under_review",
    resolve: "resolved",
    reject: "rejected",
    escalate: "escalated",
    close: "closed",
    "await-customer": "awaiting_customer",
    "await-provider": "awaiting_provider",
  };
  const now = new Date().toISOString();
  let updated: ServiceComplaint | undefined;
  mockServiceComplaints = mockServiceComplaints.map((complaint) => {
    if (complaint.id !== id) return complaint;
    updated = {
      ...complaint,
      status: statusByAction[action],
      resolution_notes: notes || complaint.resolution_notes,
      updated_at: now,
    };
    return updated;
  });
  if (!updated) throw new Error("Complaint was not found.");
  return updated;
}

export async function mockAdminListAppeals(
  filters: ProviderAppealFilters = {},
): Promise<PaginatedProviderAppeals> {
  const results = filterAppeals(filters);
  return { count: results.length, next: null, previous: null, results };
}

export async function mockAdminGetAppeal(id: string): Promise<ProviderAppeal> {
  const appeal = mockProviderAppeals.find((item) => item.id === id);
  if (!appeal) throw new Error("Appeal was not found.");
  return appeal;
}

export async function mockAdminModerateAppeal(
  id: string,
  action: "approve" | "reject" | "reopen",
  notes = "",
): Promise<ProviderAppeal> {
  const statusByAction: Record<typeof action, ProviderAppeal["status"]> = {
    approve: "approved",
    reject: "rejected",
    reopen: "reopened",
  };
  const now = new Date().toISOString();
  let updated: ProviderAppeal | undefined;
  mockProviderAppeals = mockProviderAppeals.map((appeal) => {
    if (appeal.id !== id) return appeal;
    updated = {
      ...appeal,
      status: statusByAction[action],
      admin_notes: notes || appeal.admin_notes,
      decided_at: now,
      updated_at: now,
    };
    return updated;
  });
  if (!updated) throw new Error("Appeal was not found.");
  return updated;
}

function countQuotes() {
  return {
    submitted: mockQuoteRequests.filter((item) => item.status === "submitted").length,
    viewed: mockQuoteRequests.filter((item) => item.status === "viewed").length,
    responded: mockQuoteRequests.filter((item) => item.status === "responded").length,
    closed: mockQuoteRequests.filter((item) => item.status === "closed").length,
    cancelled: mockQuoteRequests.filter((item) => item.status === "cancelled").length,
  };
}

function countReviews() {
  return {
    pending: mockServiceReviews.filter((item) => item.status === "pending").length,
    published: mockServiceReviews.filter((item) => item.status === "published").length,
    flagged: mockServiceReviews.filter((item) => item.status === "flagged").length,
    hidden: mockServiceReviews.filter((item) => item.status === "hidden").length,
    disputed: mockServiceReviews.filter((item) => item.status === "disputed").length,
    removed: mockServiceReviews.filter((item) => item.status === "removed").length,
  };
}

function countProviders() {
  return {
    draft: mockOwnerProfile?.status === "draft" ? 1 : 0,
    pending_review: mockOwnerProfile?.status === "pending_review" ? 1 : 0,
    active: mockProviders.length,
    needs_more_information: 0,
    rejected: 0,
    suspended: 0,
    inactive: 0,
    archived: 0,
  };
}

export async function mockGetCustomerServicesDashboard(): Promise<CustomerServicesDashboard> {
  const quoteCounts = countQuotes();
  const submittedReviews = filterServiceReviews({ ordering: "newest" });
  return {
    stats: [
      {
        label: "Quote requests",
        value: String(mockQuoteRequests.length),
        detail: "Requests sent to service providers",
      },
      {
        label: "Pending responses",
        value: String(quoteCounts.submitted + quoteCounts.viewed),
        detail: "Quotes still awaiting provider follow-up",
      },
      {
        label: "Submitted reviews",
        value: String(submittedReviews.length),
        detail: "Reviews linked to completed service engagements",
      },
      {
        label: "Reviews waiting",
        value: "1",
        detail: "Completed services still eligible for review",
      },
    ],
    recent_quote_requests: mockQuoteRequests.slice(0, 5),
    submitted_reviews: submittedReviews.slice(0, 5),
    eligible_reviews: [mockEligibleBooking],
    recent_providers: mockProviders.slice(0, 2),
    recommended_providers: [...mockProviders].sort(
      (left, right) => Number(right.average_rating) - Number(left.average_rating),
    ),
    service_categories: mockTradeCategories,
    activity: [
      {
        id: "activity-quote",
        title: "Quote requested: Repair inverter wiring",
        description: "Bright Spark Electrical",
        status: "submitted",
        timestamp: "2026-08-01T09:00:00Z",
        href: "/dashboard/services",
      },
      {
        id: "activity-review",
        title: "Review submitted: Clean, careful electrical repair",
        description: "Bright Spark Electrical",
        status: "published",
        timestamp: "2026-07-28T15:00:00Z",
        href: "/dashboard/services/reviews",
      },
    ],
  };
}

export async function mockGetProviderServicesDashboard(): Promise<ProviderServicesDashboard> {
  const profile = requireOwnerProfile();
  const quoteRequests = filterQuoteRequests().filter(
    (item) => item.provider.id === profile.id || item.provider.slug === profile.slug,
  );
  const reviews = filterServiceReviews().filter(
    (item) => item.provider?.id === profile.id || item.provider?.slug === profile.slug,
  );
  const completion = profile.completion;
  const missingCount = completion?.missing_fields?.length ?? 0;
  const completionPercentage = Math.round(((7 - missingCount) / 7) * 100);
  return {
    profile,
    stats: [
      {
        label: "Profile completion",
        value: `${completionPercentage}%`,
        detail: completion?.is_complete ? "Profile is ready for moderation." : "Complete setup items.",
      },
      {
        label: "Average rating",
        value: profile.average_rating,
        detail: `${profile.published_review_count ?? 0} published reviews`,
      },
      {
        label: "Quote requests",
        value: String(quoteRequests.length),
        detail: "Total service enquiries received",
      },
      {
        label: "Completed jobs",
        value: String(profile.completed_jobs_count),
        detail: "Completed service engagements",
      },
      {
        label: "Portfolio",
        value: String(profile.portfolio_count ?? 0),
        detail: "Public work samples",
      },
      {
        label: "Coverage",
        value: String(profile.service_areas.length),
        detail: "Service areas listed",
      },
    ],
    quote_status_counts: countQuotes(),
    review_status_counts: countReviews(),
    recent_quote_requests: quoteRequests.slice(0, 5),
    latest_reviews: reviews.slice(0, 5),
    response_reminders: reviews.filter(
      (item) => item.status === "published" && !item.provider_response,
    ),
    activity: [
      {
        id: "provider-activity-quote",
        title: "New quote: Repair inverter wiring",
        description: "Ada Buyer",
        status: "submitted",
        timestamp: "2026-08-01T09:00:00Z",
        href: "/dashboard/artisan/quote-requests",
      },
      {
        id: "provider-activity-review",
        title: "Review: Reliable cleaning crew",
        description: "4/5 from a verified customer",
        status: "published",
        timestamp: "2026-07-26T15:00:00Z",
        href: "/dashboard/artisan/reviews",
      },
    ],
  };
}

export async function mockGetAdminServicesDashboard(): Promise<AdminServicesDashboard> {
  return {
    stats: [
      { label: "Pending provider approvals", value: "1", detail: "Profiles waiting for admin action" },
      { label: "Active providers", value: String(mockProviders.length), detail: "Public providers" },
      { label: "Open quote requests", value: String(mockQuoteRequests.length), detail: "Active enquiries" },
      {
        label: "Pending reviews",
        value: String(countReviews().pending),
        detail: "Reviews waiting for moderation",
      },
      {
        label: "Flagged reviews",
        value: String(countReviews().flagged),
        detail: "Reviews needing trust review",
      },
    ],
    provider_status_counts: countProviders(),
    quote_status_counts: countQuotes(),
    review_status_counts: countReviews(),
    pending_providers: mockOwnerProfile ? [mockOwnerProfile] : [],
    pending_reviews: mockServiceReviews.filter((item) => item.status === "pending"),
    flagged_reviews: mockServiceReviews.filter((item) => item.status === "flagged"),
    open_quote_requests: mockQuoteRequests,
    category_breakdown: mockTradeCategories.map((category) => ({
      label: category.name,
      value: category.children.length,
    })),
    geographic_breakdown: [
      { label: "Lagos", value: 1 },
      { label: "Abuja", value: 1 },
    ],
    activity: [
      {
        id: "admin-activity-provider",
        title: "Provider profile pending",
        description: mockOwnerProfile?.business_name ?? "Draft provider",
        status: mockOwnerProfile?.status ?? "draft",
        timestamp: "2026-08-01T12:00:00Z",
        href: "/admin/services/providers",
      },
      {
        id: "admin-activity-quote",
        title: "Quote request submitted",
        description: "Bright Spark Electrical",
        status: "submitted",
        timestamp: "2026-08-01T09:00:00Z",
        href: "/admin/services/quote-requests",
      },
    ],
  };
}
