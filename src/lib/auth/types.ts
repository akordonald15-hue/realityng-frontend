export type Role = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  approval_required: boolean;
};

export type UserRole = {
  id: string;
  role: Role;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  avatar_url: string | null;
  bio: string;
  country: string;
  state: string;
  city: string;
  address: string;
  date_of_birth: string | null;
  gender: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
};

export type User = {
  id: string;
  email: string;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_active: boolean;
  is_suspended: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  profile: UserProfile;
  roles: UserRole[];
};

export type AuthTokens = {
  access: string;
  refresh: string;
};
