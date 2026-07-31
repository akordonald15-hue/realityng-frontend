import type {
  PaginatedServiceProviders,
  ServiceProvider,
  ServiceProviderFilters,
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
