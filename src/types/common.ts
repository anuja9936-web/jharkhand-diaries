export type UserRole = 'tourist' | 'provider' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  business_name: string | null;
  owner_name: string | null;
  description: string | null;
  address: string | null;
  district: string | null;
  state: string | null;
  website_url: string | null;
  social_links: Record<string, string> | null;
  provider_categories: string[] | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  verification_status?: 'unverified' | 'under_review' | 'verified' | 'rejected' | null;
  verification_details?: Record<string, unknown> | null;
  verification_submitted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}
