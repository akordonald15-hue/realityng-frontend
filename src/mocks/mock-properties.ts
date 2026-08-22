import type {
  DashboardSummary,
  Favorite,
  ListingType,
  PaginatedFavorites,
  PaginatedProperties,
  Property,
  PropertyFilters,
  PropertyImage,
  PropertyPayload,
  PropertyType,
} from "@/lib/api/properties";
import { getMockSessionUser } from "@/mocks/mock-auth";
import { mockAgents } from "@/mocks/mock-users";

const FAVORITES_KEY = "realityng.mockFavorites";

const galleryPool = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1400&q=80",
];

type PropertySeed = {
  title: string;
  slug: string;
  description: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: string;
  state: string;
  city: string;
  address: string;
  lga?: string;
  neighborhood?: string;
  landmark?: string;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  land_size?: string | null;
  floor_area?: string | null;
  featured?: boolean;
  amenities: string[];
  agentIndex: number;
  imageOffset: number;
  views_count: number;
  inquiry_count: number;
};

const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  Lagos: { latitude: 6.4698, longitude: 3.5852 },
  Abuja: { latitude: 9.0765, longitude: 7.3986 },
  "Port Harcourt": { latitude: 4.8156, longitude: 7.0498 },
  Uyo: { latitude: 5.0377, longitude: 7.9128 },
  Enugu: { latitude: 6.5244, longitude: 7.5086 },
  Ibadan: { latitude: 7.3775, longitude: 3.947 },
};

function coordinatesFor(seed: PropertySeed, index: number) {
  const base = cityCoordinates[seed.city] ?? { latitude: 9.082, longitude: 8.6753 };
  const offset = (index % 5) * 0.008;
  return {
    latitude: Number((base.latitude + offset).toFixed(6)),
    longitude: Number((base.longitude + offset / 2).toFixed(6)),
  };
}

const propertySeeds: PropertySeed[] = [
  {
    title: "Waterfront Five-Bedroom Banana Island Duplex",
    slug: "waterfront-banana-island-duplex",
    description:
      "A rare waterfront duplex with private terrace, smart security, staff quarters, and lagoon views built for executive family living.",
    property_type: "duplex",
    listing_type: "sale",
    price: "1850000000",
    state: "Lagos",
    city: "Lagos",
    address: "Banana Island Road, Ikoyi",
    bedrooms: 5,
    bathrooms: 6,
    parking_spaces: 4,
    floor_area: "820",
    featured: true,
    amenities: ["Waterfront view", "Smart locks", "Staff quarters", "Pool", "24/7 security"],
    agentIndex: 0,
    imageOffset: 0,
    views_count: 1840,
    inquiry_count: 42,
  },
  {
    title: "Maitama Diplomatic Residence",
    slug: "maitama-diplomatic-residence",
    description:
      "Secure Abuja residence with generous reception rooms, landscaped grounds, and easy access to embassies and government districts.",
    property_type: "house",
    listing_type: "sale",
    price: "950000000",
    state: "FCT",
    city: "Abuja",
    address: "Maitama District",
    bedrooms: 6,
    bathrooms: 7,
    parking_spaces: 6,
    floor_area: "760",
    featured: true,
    amenities: ["Gated estate", "CCTV", "Garden", "Backup power", "Boys quarters"],
    agentIndex: 3,
    imageOffset: 1,
    views_count: 1210,
    inquiry_count: 28,
  },
  {
    title: "Lekki Phase 1 Serviced Apartment",
    slug: "lekki-phase-one-serviced-apartment",
    description:
      "A furnished room in a fully serviced three-bedroom apartment with elevator access, fitted kitchen, and shared resident amenities.",
    property_type: "apartment",
    listing_type: "apartment_share",
    price: "18000000",
    state: "Lagos",
    city: "Lagos",
    address: "Off Admiralty Way, Lekki Phase 1",
    bedrooms: 3,
    bathrooms: 4,
    parking_spaces: 2,
    floor_area: "210",
    featured: true,
    amenities: [
      "Private room",
      "Shared fitted kitchen",
      "Elevator",
      "Gym",
      "Pool",
      "Dedicated parking",
    ],
    agentIndex: 0,
    imageOffset: 2,
    views_count: 990,
    inquiry_count: 35,
  },
  {
    title: "Jabi Lake View Shortlet Penthouse",
    slug: "jabi-lake-view-shortlet-penthouse",
    description:
      "Income-ready shortlet penthouse with lake views, luxury furnishing, and professional facility management.",
    property_type: "shortlet",
    listing_type: "sale",
    price: "340000000",
    state: "FCT",
    city: "Abuja",
    address: "Jabi Lake District",
    bedrooms: 4,
    bathrooms: 5,
    parking_spaces: 3,
    floor_area: "330",
    featured: true,
    amenities: [
      "Lake view",
      "Fully furnished",
      "Concierge",
      "High-speed internet",
      "Rooftop lounge",
    ],
    agentIndex: 3,
    imageOffset: 3,
    views_count: 810,
    inquiry_count: 21,
  },
  {
    title: "Victoria Island Grade A Office Floor",
    slug: "victoria-island-grade-a-office-floor",
    description:
      "Open-plan commercial floor in a modern tower with reception, lift access, backup power, and ample parking.",
    property_type: "commercial",
    listing_type: "rent",
    price: "125000000",
    state: "Lagos",
    city: "Lagos",
    address: "Akin Adesola Street, Victoria Island",
    bedrooms: null,
    bathrooms: 6,
    parking_spaces: 12,
    floor_area: "900",
    amenities: ["Reception", "Elevators", "Backup power", "Fiber internet", "Parking"],
    agentIndex: 0,
    imageOffset: 4,
    views_count: 620,
    inquiry_count: 14,
  },
  {
    title: "GRA Phase 2 Port Harcourt Hotel",
    slug: "gra-phase-two-port-harcourt-hotel",
    description:
      "Operational boutique hotel with conference rooms, restaurant, pool, and stable corporate occupancy history.",
    property_type: "hotel",
    listing_type: "sale",
    price: "2200000000",
    state: "Rivers",
    city: "Port Harcourt",
    address: "GRA Phase 2",
    bedrooms: 42,
    bathrooms: 48,
    parking_spaces: 35,
    floor_area: "4200",
    featured: true,
    amenities: ["42 rooms", "Restaurant", "Conference hall", "Pool", "Generator house"],
    agentIndex: 2,
    imageOffset: 5,
    views_count: 760,
    inquiry_count: 18,
  },
  {
    title: "Uyo Luxury Shortlet Villas",
    slug: "uyo-luxury-shortlet-villas",
    description:
      "Cluster of furnished shortlet villas near key hospitality corridors with strong weekend occupancy potential.",
    property_type: "shortlet",
    listing_type: "sale",
    price: "480000000",
    state: "Akwa Ibom",
    city: "Uyo",
    address: "Ewet Housing Estate",
    bedrooms: 12,
    bathrooms: 14,
    parking_spaces: 10,
    floor_area: "980",
    amenities: ["Furnished villas", "Outdoor lounge", "Security", "Laundry", "Solar backup"],
    agentIndex: 1,
    imageOffset: 6,
    views_count: 690,
    inquiry_count: 17,
  },
  {
    title: "Enugu Independence Layout Duplex",
    slug: "enugu-independence-layout-duplex",
    description:
      "Finished five-bedroom duplex in a calm residential district with modern interiors and clean title.",
    property_type: "duplex",
    listing_type: "sale",
    price: "210000000",
    state: "Enugu",
    city: "Enugu",
    address: "Independence Layout",
    bedrooms: 5,
    bathrooms: 6,
    parking_spaces: 4,
    floor_area: "460",
    amenities: ["Clean title", "POP ceilings", "Family lounge", "CCTV", "Water treatment"],
    agentIndex: 2,
    imageOffset: 7,
    views_count: 540,
    inquiry_count: 11,
  },
  {
    title: "Ibadan Jericho Executive Apartments",
    slug: "ibadan-jericho-executive-apartments",
    description:
      "New-build block of serviced apartments positioned for professionals, visiting families, and rental yield.",
    property_type: "apartment",
    listing_type: "sale",
    price: "265000000",
    state: "Oyo",
    city: "Ibadan",
    address: "Jericho GRA",
    bedrooms: 8,
    bathrooms: 10,
    parking_spaces: 8,
    floor_area: "920",
    amenities: ["Serviced block", "CCTV", "Water treatment", "Generator", "Visitor parking"],
    agentIndex: 4,
    imageOffset: 8,
    views_count: 610,
    inquiry_count: 19,
  },
  {
    title: "Ikoyi Mixed-Use Commercial Building",
    slug: "ikoyi-mixed-use-commercial-building",
    description:
      "High-visibility mixed-use building with retail frontage, office floors, and premium tenant profile.",
    property_type: "commercial",
    listing_type: "sale",
    price: "3100000000",
    state: "Lagos",
    city: "Lagos",
    address: "Awolowo Road, Ikoyi",
    bedrooms: null,
    bathrooms: 18,
    parking_spaces: 28,
    floor_area: "3600",
    featured: true,
    amenities: [
      "Retail frontage",
      "Office floors",
      "Elevator",
      "Basement parking",
      "Security desk",
    ],
    agentIndex: 0,
    imageOffset: 9,
    views_count: 1180,
    inquiry_count: 23,
  },
  {
    title: "Asokoro Hillside Residential Land",
    slug: "asokoro-hillside-residential-land",
    description:
      "Prime titled residential land in Asokoro with elevation, access road, and strong long-term appreciation profile.",
    property_type: "land",
    listing_type: "sale",
    price: "780000000",
    state: "FCT",
    city: "Abuja",
    address: "Asokoro Extension",
    bedrooms: null,
    bathrooms: null,
    parking_spaces: null,
    land_size: "2200",
    amenities: ["C of O", "Access road", "Hillside view", "Residential zoning", "Survey plan"],
    agentIndex: 3,
    imageOffset: 10,
    views_count: 520,
    inquiry_count: 12,
  },
  {
    title: "Port Harcourt Old GRA Family Home",
    slug: "port-harcourt-old-gra-family-home",
    description:
      "Renovated family residence in Old GRA with mature landscaping, private study, and generous compound.",
    property_type: "house",
    listing_type: "rent",
    price: "35000000",
    state: "Rivers",
    city: "Port Harcourt",
    address: "Old GRA",
    bedrooms: 5,
    bathrooms: 6,
    parking_spaces: 5,
    floor_area: "620",
    amenities: ["Large compound", "Study", "Security post", "Backup power", "Garden"],
    agentIndex: 2,
    imageOffset: 0,
    views_count: 460,
    inquiry_count: 9,
  },
  {
    title: "Uyo Ring Road Commercial Plot",
    slug: "uyo-ring-road-commercial-plot",
    description:
      "Strategic commercial land parcel along an active corridor suitable for hospitality, retail, or showroom development.",
    property_type: "land",
    listing_type: "sale",
    price: "165000000",
    state: "Akwa Ibom",
    city: "Uyo",
    address: "Ring Road",
    bedrooms: null,
    bathrooms: null,
    parking_spaces: null,
    land_size: "1800",
    amenities: [
      "Commercial zoning",
      "Survey",
      "Road frontage",
      "Dry land",
      "Fast-growing corridor",
    ],
    agentIndex: 1,
    imageOffset: 1,
    views_count: 390,
    inquiry_count: 8,
  },
  {
    title: "Enugu New Haven Apartment Block",
    slug: "enugu-new-haven-apartment-block",
    description:
      "Tenant-ready apartment block in New Haven with consistent rental demand and neat common areas.",
    property_type: "apartment",
    listing_type: "sale",
    price: "320000000",
    state: "Enugu",
    city: "Enugu",
    address: "New Haven",
    bedrooms: 12,
    bathrooms: 12,
    parking_spaces: 10,
    floor_area: "1100",
    amenities: ["Multiple units", "Water system", "Parking", "Secure gate", "Strong rental demand"],
    agentIndex: 2,
    imageOffset: 2,
    views_count: 450,
    inquiry_count: 15,
  },
  {
    title: "Ibadan Moniya Industrial Warehouse",
    slug: "ibadan-moniya-industrial-warehouse",
    description:
      "Large warehouse property near industrial access routes with loading area, office annex, and expansion land.",
    property_type: "commercial",
    listing_type: "rent",
    price: "42000000",
    state: "Oyo",
    city: "Ibadan",
    address: "Moniya Industrial Axis",
    bedrooms: null,
    bathrooms: 4,
    parking_spaces: 18,
    floor_area: "2400",
    amenities: ["Loading bay", "Office annex", "Truck access", "Perimeter fence", "Expansion yard"],
    agentIndex: 4,
    imageOffset: 3,
    views_count: 330,
    inquiry_count: 7,
  },
  {
    title: "Oniru Beachfront Shortlet Apartment",
    slug: "oniru-beachfront-shortlet-apartment",
    description:
      "Beach-access shortlet apartment with tasteful furnishing, management-ready setup, and strong leisure demand.",
    property_type: "shortlet",
    listing_type: "sale",
    price: "185000000",
    state: "Lagos",
    city: "Lagos",
    address: "Oniru, Victoria Island",
    bedrooms: 2,
    bathrooms: 3,
    parking_spaces: 2,
    floor_area: "150",
    amenities: ["Beach access", "Furnished", "Concierge", "Pool", "Shortlet ready"],
    agentIndex: 0,
    imageOffset: 4,
    views_count: 870,
    inquiry_count: 31,
  },
  {
    title: "Wuse 2 Boutique Hotel",
    slug: "wuse-two-boutique-hotel",
    description:
      "Boutique hospitality asset in Wuse 2 with restaurant, rooftop lounge, and corporate guest pipeline.",
    property_type: "hotel",
    listing_type: "sale",
    price: "1450000000",
    state: "FCT",
    city: "Abuja",
    address: "Wuse 2",
    bedrooms: 28,
    bathrooms: 32,
    parking_spaces: 24,
    floor_area: "2800",
    amenities: [
      "28 rooms",
      "Rooftop lounge",
      "Restaurant",
      "Conference room",
      "Corporate bookings",
    ],
    agentIndex: 3,
    imageOffset: 5,
    views_count: 640,
    inquiry_count: 14,
  },
  {
    title: "Alausa Ikeja Corporate Office",
    slug: "alausa-ikeja-corporate-office",
    description:
      "Corporate office property close to government and commercial districts with flexible floor plates.",
    property_type: "commercial",
    listing_type: "rent",
    price: "85000000",
    state: "Lagos",
    city: "Lagos",
    address: "Alausa, Ikeja",
    bedrooms: null,
    bathrooms: 8,
    parking_spaces: 15,
    floor_area: "1250",
    amenities: ["Flexible floor plates", "Elevator", "Reception", "Parking", "Backup power"],
    agentIndex: 0,
    imageOffset: 6,
    views_count: 520,
    inquiry_count: 10,
  },
  {
    title: "Trans-Amadi Commercial Yard",
    slug: "trans-amadi-commercial-yard",
    description:
      "Fenced commercial yard with office structure, heavy vehicle access, and industrial neighborhood visibility.",
    property_type: "commercial",
    listing_type: "sale",
    price: "680000000",
    state: "Rivers",
    city: "Port Harcourt",
    address: "Trans-Amadi Industrial Layout",
    bedrooms: null,
    bathrooms: 5,
    parking_spaces: 30,
    land_size: "3500",
    amenities: [
      "Industrial access",
      "Office block",
      "Fenced yard",
      "Truck parking",
      "Power connection",
    ],
    agentIndex: 2,
    imageOffset: 7,
    views_count: 420,
    inquiry_count: 8,
  },
  {
    title: "Akobo Gated Estate Duplex",
    slug: "akobo-gated-estate-duplex",
    description:
      "Family-friendly duplex in a secure Ibadan estate with modern finishes, play area, and quick access to Akobo Road.",
    property_type: "duplex",
    listing_type: "sale",
    price: "145000000",
    state: "Oyo",
    city: "Ibadan",
    address: "Akobo Estate",
    bedrooms: 4,
    bathrooms: 5,
    parking_spaces: 3,
    floor_area: "380",
    amenities: ["Gated estate", "Play area", "Modern kitchen", "CCTV", "Water treatment"],
    agentIndex: 4,
    imageOffset: 8,
    views_count: 560,
    inquiry_count: 16,
  },
];

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function getFavoriteIds(): string[] {
  if (!canUseStorage()) {
    return ["property-1", "property-3", "property-4"];
  }
  const user = getMockSessionUser();
  const key = user ? `${FAVORITES_KEY}.${user.id}` : FAVORITES_KEY;
  const raw = window.localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as string[]) : ["property-1", "property-3", "property-4"];
}

function setFavoriteIds(ids: string[]) {
  if (!canUseStorage()) {
    return;
  }
  const user = getMockSessionUser();
  const key = user ? `${FAVORITES_KEY}.${user.id}` : FAVORITES_KEY;
  window.localStorage.setItem(key, JSON.stringify(ids));
}

function galleryFor(propertyId: string, offset: number): PropertyImage[] {
  return Array.from({ length: 6 }, (_, index) => {
    const url = galleryPool[(offset + index) % galleryPool.length];
    return {
      id: `${propertyId}-image-${index + 1}`,
      image_url: url,
      caption: index === 0 ? "Cover image" : `Gallery image ${index + 1}`,
      display_order: index + 1,
      is_cover: index === 0,
      created_at: "2026-06-20T10:00:00Z",
    };
  });
}

export const mockProperties: Property[] = propertySeeds.map((seed, index) => {
  const id = `property-${index + 1}`;
  const agent = mockAgents[seed.agentIndex % mockAgents.length];
  const gallery = galleryFor(id, seed.imageOffset);
  const coordinates = coordinatesFor(seed, index);
  const displayLocation = seed.neighborhood
    ? `${seed.neighborhood}, ${seed.city}`
    : seed.address;
  return {
    id,
    title: seed.title,
    slug: seed.slug,
    description: seed.description,
    property_type: seed.property_type,
    listing_type: seed.listing_type,
    price: seed.price,
    currency: "NGN",
    country: "Nigeria",
    state: seed.state,
    city: seed.city,
    lga: seed.lga,
    neighborhood: seed.neighborhood ?? seed.address.split(",")[0],
    landmark: seed.landmark,
    address: displayLocation,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    location_precision: "neighborhood",
    approximate_location: true,
    geocoding_status: "manual",
    display_location: displayLocation,
    location_metadata: {
      has_map_location: true,
      precision_label: "Neighborhood",
      privacy_note: "Location is approximate for privacy.",
    },
    bedrooms: seed.bedrooms,
    bathrooms: seed.bathrooms,
    parking_spaces: seed.parking_spaces,
    land_size: seed.land_size ?? null,
    floor_area: seed.floor_area ?? null,
    status: "approved",
    featured: Boolean(seed.featured),
    cover_image_url: gallery[0].image_url,
    image_count: gallery.length,
    image_gallery: gallery,
    is_favorited: false,
    amenities: seed.amenities,
    agent_id: agent.id,
    agent_name: agent.full_name,
    agent_phone: agent.phone_number,
    agent_email: agent.email,
    agent_avatar_url: agent.profile.avatar_url,
    views_count: seed.views_count,
    inquiry_count: seed.inquiry_count,
    created_at: `2026-06-${String((index % 20) + 1).padStart(2, "0")}T10:00:00Z`,
  };
});

function withFavoriteState(properties: Property[]): Property[] {
  const favorites = new Set(getFavoriteIds());
  return properties.map((property) => ({
    ...property,
    is_favorited: favorites.has(property.id),
  }));
}

function applyFilters(properties: Property[], filters: PropertyFilters): Property[] {
  let filtered = [...properties];
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter((property) => property.title.toLowerCase().includes(search));
  }
  if (filters.city) {
    const city = filters.city.toLowerCase();
    filtered = filtered.filter((property) => property.city.toLowerCase().includes(city));
  }
  if (filters.state) {
    const state = filters.state.toLowerCase();
    filtered = filtered.filter((property) => property.state.toLowerCase().includes(state));
  }
  if (filters.lga) {
    const lga = filters.lga.toLowerCase();
    filtered = filtered.filter((property) => property.lga?.toLowerCase().includes(lga));
  }
  if (filters.neighborhood) {
    const neighborhood = filters.neighborhood.toLowerCase();
    filtered = filtered.filter((property) =>
      property.neighborhood?.toLowerCase().includes(neighborhood),
    );
  }
  if (filters.property_type) {
    filtered = filtered.filter((property) => property.property_type === filters.property_type);
  }
  if (filters.listing_type) {
    filtered = filtered.filter((property) => property.listing_type === filters.listing_type);
  }
  if (filters.min_price) {
    filtered = filtered.filter((property) => Number(property.price) >= Number(filters.min_price));
  }
  if (filters.max_price) {
    filtered = filtered.filter((property) => Number(property.price) <= Number(filters.max_price));
  }
  if (filters.has_map_location === "true") {
    filtered = filtered.filter((property) => property.latitude && property.longitude);
  }
  if (filters.min_lat) {
    filtered = filtered.filter((property) => Number(property.latitude) >= Number(filters.min_lat));
  }
  if (filters.max_lat) {
    filtered = filtered.filter((property) => Number(property.latitude) <= Number(filters.max_lat));
  }
  if (filters.min_lng) {
    filtered = filtered.filter((property) => Number(property.longitude) >= Number(filters.min_lng));
  }
  if (filters.max_lng) {
    filtered = filtered.filter((property) => Number(property.longitude) <= Number(filters.max_lng));
  }
  const ordering = filters.ordering ?? "-featured";
  filtered.sort((first, second) => {
    if (ordering === "price") {
      return Number(first.price) - Number(second.price);
    }
    if (ordering === "-price") {
      return Number(second.price) - Number(first.price);
    }
    if (ordering === "-created_at") {
      return second.created_at.localeCompare(first.created_at);
    }
    return (
      Number(second.featured) - Number(first.featured) ||
      second.created_at.localeCompare(first.created_at)
    );
  });
  return filtered;
}

function paginate<T>(items: T[], page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize;
  const results = items.slice(start, start + pageSize);
  return {
    count: items.length,
    next: start + pageSize < items.length ? String(page + 1) : null,
    previous: page > 1 ? String(page - 1) : null,
    results,
  };
}

export async function mockGetPublicProperties(
  filters: PropertyFilters = {},
): Promise<PaginatedProperties> {
  return paginate(withFavoriteState(applyFilters(mockProperties, filters)));
}

export async function mockGetPublicProperty(propertySlug: string): Promise<Property> {
  const property = withFavoriteState(mockProperties).find((item) => item.slug === propertySlug);
  if (!property) {
    throw new Error("Property not found.");
  }
  return property;
}

export async function mockCreateProperty(payload: PropertyPayload): Promise<Property> {
  const user = getMockSessionUser();
  const id = `property-demo-${Date.now()}`;
  const slug = payload.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return {
    id,
    slug,
    ...payload,
    lga: payload.lga,
    neighborhood: payload.neighborhood,
    landmark: payload.landmark,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    location_precision: payload.location_precision ?? "neighborhood",
    approximate_location: payload.location_precision !== "exact" || !payload.show_exact_location,
    geocoding_status: payload.geocoding_status ?? "not_geocoded",
    display_location: payload.display_location ?? `${payload.city}, ${payload.state}`,
    location_metadata: {
      has_map_location: Boolean(payload.latitude && payload.longitude),
      precision_label: "Neighborhood",
      privacy_note: "Location is approximate for privacy.",
    },
    status: "draft",
    featured: false,
    cover_image_url: galleryPool[0],
    image_count: 0,
    image_gallery: [],
    is_favorited: false,
    amenities: ["Demo draft", "Owner-managed", "Ready for media upload"],
    agent_id: user?.id,
    agent_name: user?.full_name,
    agent_phone: user?.phone_number,
    agent_email: user?.email,
    agent_avatar_url: user?.profile.avatar_url,
    views_count: 0,
    inquiry_count: 0,
    created_at: new Date().toISOString(),
  };
}

export async function mockListPropertyImages(propertySlug: string): Promise<PropertyImage[]> {
  const property = await mockGetPublicProperty(propertySlug).catch(() => null);
  return property?.image_gallery ?? [];
}

export async function mockUploadPropertyImage({
  propertySlug,
  caption = "",
  displayOrder = 1,
  isCover = false,
}: {
  propertySlug: string;
  file: File;
  caption?: string;
  displayOrder?: number;
  isCover?: boolean;
}): Promise<PropertyImage> {
  return {
    id: `${propertySlug}-uploaded-${Date.now()}`,
    image_url: galleryPool[displayOrder % galleryPool.length],
    caption,
    display_order: displayOrder,
    is_cover: isCover,
    created_at: new Date().toISOString(),
  };
}

export async function mockUpdatePropertyImage(payload: {
  propertySlug: string;
  imageId: string;
  caption?: string;
  displayOrder?: number;
  isCover?: boolean;
}): Promise<PropertyImage> {
  const image = (await mockListPropertyImages(payload.propertySlug))[0];
  return {
    ...image,
    id: payload.imageId,
    caption: payload.caption ?? image?.caption ?? "",
    display_order: payload.displayOrder ?? image?.display_order ?? 1,
    is_cover: payload.isCover ?? image?.is_cover ?? false,
  };
}

export async function mockSetPropertyCoverImage(payload: {
  propertySlug: string;
  imageId: string;
}): Promise<PropertyImage> {
  return mockUpdatePropertyImage({ ...payload, isCover: true });
}

export async function mockDeletePropertyImage(): Promise<void> {
  return undefined;
}

export async function mockCreateFavorite(propertyId: string): Promise<Favorite> {
  const ids = Array.from(new Set([...getFavoriteIds(), propertyId]));
  setFavoriteIds(ids);
  const property =
    withFavoriteState(mockProperties).find((item) => item.id === propertyId) ?? mockProperties[0];
  return {
    id: `favorite-${propertyId}`,
    property: { ...property, is_favorited: true },
    created_at: new Date().toISOString(),
  };
}

export async function mockDeleteFavorite(propertyId: string): Promise<void> {
  setFavoriteIds(getFavoriteIds().filter((id) => id !== propertyId));
}

export async function mockListFavorites(page = 1): Promise<PaginatedFavorites> {
  const favoriteSet = new Set(getFavoriteIds());
  const favorites = withFavoriteState(mockProperties)
    .filter((property) => favoriteSet.has(property.id))
    .map((property) => ({
      id: `favorite-${property.id}`,
      property: { ...property, is_favorited: true },
      created_at: "2026-06-22T09:00:00Z",
    }));
  return paginate(favorites, page, 9);
}

export async function mockGetDashboardSummary(): Promise<DashboardSummary> {
  const user = getMockSessionUser();
  const activeListings = user?.roles.some((role) => role.role.name === "agent")
    ? mockProperties.filter((property) => property.agent_id === user.id).length
    : 0;
  return {
    saved_properties_count: getFavoriteIds().length,
    active_listings_count: activeListings,
    draft_listings_count: user?.roles.some((role) => role.role.name === "agent") ? 3 : 0,
  };
}
