import type {
  AdminProviderDecisionPayload,
  AdminProviderFilters,
  OwnerServiceProvider,
  PaginatedServiceProviders,
  PortfolioImage,
  PortfolioImageMetadataPayload,
  PortfolioImagePayload,
  PortfolioReorderPayload,
  ServiceProvider,
  ServiceProviderFilters,
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
    completed_jobs_count: 12,
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
    reviews_summary: {
      average_rating: "4.70",
      completed_jobs_count: 12,
      review_count: 0,
      message: "Verified booking reviews will be available in a later Sprint 9 phase.",
    },
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
    completed_jobs_count: 9,
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
    reviews_summary: {
      average_rating: "4.50",
      completed_jobs_count: 9,
      review_count: 0,
      message: "Verified booking reviews will be available in a later Sprint 9 phase.",
    },
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

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
  return updateMockProviderStatus("suspended", { suspended_reason: payload.reason ?? "" });
}

export async function mockAdminReactivateProvider(id: string): Promise<OwnerServiceProvider> {
  if (requireOwnerProfile().id !== id) return mockAdminGetProvider(id);
  return updateMockProviderStatus("active");
}
