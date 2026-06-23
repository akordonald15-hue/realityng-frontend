import type { Role, User } from "@/lib/auth/types";

type MockUserSeed = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: "admin" | "super_admin" | "agent" | "buyer";
  location: string;
  avatar_url: string;
  bio: string;
  verified: boolean;
};

const roles: Record<MockUserSeed["role"], Role> = {
  admin: {
    id: "role-admin",
    name: "admin",
    description: "Can review listings, agents, and platform activity.",
    created_at: "2026-01-01T00:00:00Z",
    approval_required: true,
  },
  super_admin: {
    id: "role-super-admin",
    name: "super_admin",
    description: "Executive platform administrator.",
    created_at: "2026-01-01T00:00:00Z",
    approval_required: true,
  },
  agent: {
    id: "role-agent",
    name: "agent",
    description: "Verified real estate professional.",
    created_at: "2026-01-01T00:00:00Z",
    approval_required: true,
  },
  buyer: {
    id: "role-buyer",
    name: "buyer",
    description: "Property buyer or renter.",
    created_at: "2026-01-01T00:00:00Z",
    approval_required: false,
  },
};

const seeds: MockUserSeed[] = [
  {
    id: "admin-1",
    first_name: "Adaora",
    last_name: "Okonkwo",
    email: "admin@realityng.com",
    phone_number: "+234 803 100 1100",
    role: "super_admin",
    location: "Lagos, Nigeria",
    avatar_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80",
    bio: "CEO-facing operations lead overseeing listing trust, approvals, and platform quality.",
    verified: true,
  },
  {
    id: "admin-2",
    first_name: "Kelechi",
    last_name: "Adebayo",
    email: "kelechi.admin@realityng.com",
    phone_number: "+234 805 220 2200",
    role: "admin",
    location: "Abuja, Nigeria",
    avatar_url:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
    bio: "Property verification manager focused on documentation, agent checks, and listing moderation.",
    verified: true,
  },
  {
    id: "admin-3",
    first_name: "Mariam",
    last_name: "Eze",
    email: "mariam.admin@realityng.com",
    phone_number: "+234 809 330 3300",
    role: "admin",
    location: "Port Harcourt, Nigeria",
    avatar_url:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=320&q=80",
    bio: "Customer trust analyst coordinating buyer escalations and agent response standards.",
    verified: true,
  },
  {
    id: "agent-1",
    first_name: "Tunde",
    last_name: "Balogun",
    email: "agent@realityng.com",
    phone_number: "+234 802 410 5100",
    role: "agent",
    location: "Lekki, Lagos",
    avatar_url:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=320&q=80",
    bio: "Premium Lagos agent specializing in waterfront apartments, family homes, and diaspora buyer representation.",
    verified: true,
  },
  {
    id: "agent-2",
    first_name: "Nneka",
    last_name: "Udom",
    email: "nneka.agent@realityng.com",
    phone_number: "+234 806 510 1200",
    role: "agent",
    location: "Uyo, Akwa Ibom",
    avatar_url:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=320&q=80",
    bio: "Akwa Ibom property advisor with deep coverage of shortlets, serviced apartments, and new estates.",
    verified: true,
  },
  {
    id: "agent-3",
    first_name: "Chinedu",
    last_name: "Nwosu",
    email: "chinedu.agent@realityng.com",
    phone_number: "+234 803 611 4300",
    role: "agent",
    location: "Enugu, Nigeria",
    avatar_url:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=320&q=80",
    bio: "Verified eastern corridor agent focused on land banking, commercial sites, and family residences.",
    verified: true,
  },
  {
    id: "agent-4",
    first_name: "Amina",
    last_name: "Bello",
    email: "amina.agent@realityng.com",
    phone_number: "+234 807 912 2400",
    role: "agent",
    location: "Maitama, Abuja",
    avatar_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=320&q=80",
    bio: "Abuja relocation specialist supporting diplomatic families, investors, and executive renters.",
    verified: true,
  },
  {
    id: "agent-5",
    first_name: "Femi",
    last_name: "Adeyemi",
    email: "femi.agent@realityng.com",
    phone_number: "+234 808 144 7800",
    role: "agent",
    location: "Ibadan, Oyo",
    avatar_url:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80",
    bio: "Southwest growth-market agent covering Ibadan estates, hotel conversions, and commercial land.",
    verified: true,
  },
  {
    id: "buyer-1",
    first_name: "Ify",
    last_name: "Madu",
    email: "buyer@realityng.com",
    phone_number: "+1 832 555 0144",
    role: "buyer",
    location: "Houston, USA",
    avatar_url:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=320&q=80",
    bio: "Diaspora buyer comparing Lagos apartments and Abuja family homes for relocation planning.",
    verified: true,
  },
  {
    id: "buyer-2",
    first_name: "David",
    last_name: "Oluwaseun",
    email: "david.buyer@realityng.com",
    phone_number: "+44 7700 900111",
    role: "buyer",
    location: "London, UK",
    avatar_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=320&q=80",
    bio: "Investor tracking land and shortlet opportunities across Lagos and Ibadan.",
    verified: true,
  },
  {
    id: "buyer-3",
    first_name: "Sade",
    last_name: "Lawal",
    email: "sade.buyer@realityng.com",
    phone_number: "+234 813 220 8899",
    role: "buyer",
    location: "Lagos, Nigeria",
    avatar_url:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80",
    bio: "First-time buyer researching verified apartment listings near business districts.",
    verified: true,
  },
  {
    id: "buyer-4",
    first_name: "Obinna",
    last_name: "Iroegbu",
    email: "obinna.buyer@realityng.com",
    phone_number: "+1 646 555 0119",
    role: "buyer",
    location: "New York, USA",
    avatar_url:
      "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=320&q=80",
    bio: "Diaspora professional evaluating Enugu land and Port Harcourt commercial opportunities.",
    verified: false,
  },
  {
    id: "buyer-5",
    first_name: "Halima",
    last_name: "Sani",
    email: "halima.buyer@realityng.com",
    phone_number: "+234 809 222 1010",
    role: "buyer",
    location: "Abuja, Nigeria",
    avatar_url:
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=320&q=80",
    bio: "Family-home buyer focused on gated communities with strong schools and security.",
    verified: true,
  },
  {
    id: "buyer-6",
    first_name: "Emeka",
    last_name: "Okoro",
    email: "emeka.buyer@realityng.com",
    phone_number: "+234 802 333 1010",
    role: "buyer",
    location: "Port Harcourt, Nigeria",
    avatar_url:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=320&q=80",
    bio: "Commercial-property buyer comparing hotels, offices, and mixed-use sites.",
    verified: true,
  },
  {
    id: "buyer-7",
    first_name: "Tara",
    last_name: "Ojo",
    email: "tara.buyer@realityng.com",
    phone_number: "+1 301 555 0188",
    role: "buyer",
    location: "Maryland, USA",
    avatar_url:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=320&q=80",
    bio: "Shortlet investor looking for professionally managed units in Lagos and Uyo.",
    verified: true,
  },
  {
    id: "buyer-8",
    first_name: "Kingsley",
    last_name: "Nnamdi",
    email: "kingsley.buyer@realityng.com",
    phone_number: "+234 806 777 9010",
    role: "buyer",
    location: "Enugu, Nigeria",
    avatar_url:
      "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&w=320&q=80",
    bio: "Land-banking buyer focused on titled plots and development corridors.",
    verified: false,
  },
  {
    id: "buyer-9",
    first_name: "Yewande",
    last_name: "Akin",
    email: "yewande.buyer@realityng.com",
    phone_number: "+234 818 555 7000",
    role: "buyer",
    location: "Ibadan, Nigeria",
    avatar_url:
      "https://images.unsplash.com/photo-1558898479-33c0057a5d12?auto=format&fit=crop&w=320&q=80",
    bio: "Buyer comparing Ibadan family homes and serviced apartments for long-term value.",
    verified: true,
  },
  {
    id: "buyer-10",
    first_name: "Samuel",
    last_name: "Etim",
    email: "samuel.buyer@realityng.com",
    phone_number: "+234 807 101 6060",
    role: "buyer",
    location: "Uyo, Nigeria",
    avatar_url:
      "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=320&q=80",
    bio: "Local buyer interested in gated estates, hotels, and shortlet income properties.",
    verified: true,
  },
];

function toUser(seed: MockUserSeed): User {
  return {
    id: seed.id,
    email: seed.email,
    phone_number: seed.phone_number,
    first_name: seed.first_name,
    last_name: seed.last_name,
    full_name: `${seed.first_name} ${seed.last_name}`,
    is_email_verified: seed.verified,
    is_phone_verified: seed.verified,
    is_active: true,
    is_suspended: false,
    last_login_at: "2026-06-23T09:00:00Z",
    created_at: "2026-01-15T08:00:00Z",
    updated_at: "2026-06-20T12:00:00Z",
    profile: {
      avatar_url: seed.avatar_url,
      bio: seed.bio,
      country: seed.location.includes("USA")
        ? "United States"
        : seed.location.includes("UK")
          ? "United Kingdom"
          : "Nigeria",
      state: seed.location.split(",")[0] ?? "",
      city: seed.location.split(",")[0] ?? "",
      address: seed.location,
      date_of_birth: null,
      gender: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
    },
    roles: [
      {
        id: `${seed.id}-role`,
        role: roles[seed.role],
        status: "approved",
        created_at: "2026-01-15T08:00:00Z",
        updated_at: "2026-01-15T08:00:00Z",
      },
    ],
  };
}

export const mockRoles = Object.values(roles);
export const mockUsers = seeds.map(toUser);
export const mockAdmins = mockUsers.filter((user) =>
  user.roles.some((userRole) => ["admin", "super_admin"].includes(userRole.role.name)),
);
export const mockAgents = mockUsers.filter((user) =>
  user.roles.some((userRole) => userRole.role.name === "agent"),
);
export const mockBuyers = mockUsers.filter((user) =>
  user.roles.some((userRole) => userRole.role.name === "buyer"),
);

export function findMockUserByEmail(email: string): User | undefined {
  return mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function findMockUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id);
}
