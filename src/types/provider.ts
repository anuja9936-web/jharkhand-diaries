export type ProviderOfferingKind = 'product' | 'experience' | 'stay';

export type ProviderOfferingStatus = 'draft' | 'published' | 'archived';

export type ProviderRequestType = 'learning' | 'booking' | 'order';

export type ProviderRequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface ProviderOffering {
  id: string;
  provider_id: string;
  kind: ProviderOfferingKind;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  district: string | null;
  address: string | null;
  price: number | null;
  currency: string;
  status: ProviderOfferingStatus;
  cover_image: string | null;
  gallery: string[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ProviderRequest {
  id: string;
  provider_id: string;
  offering_id: string | null;
  request_type: ProviderRequestType;
  tourist_id: string | null;
  tourist_name: string;
  tourist_email: string | null;
  preferred_date: string | null;
  duration: string | null;
  participants: number;
  message: string | null;
  status: ProviderRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface ProviderPublicProfile {
  id: string;
  full_name: string | null;
  business_name: string | null;
  owner_name: string | null;
  description: string | null;
  phone: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  address: string | null;
  district: string | null;
  state: string | null;
  website_url: string | null;
  provider_categories: string[] | null;
  created_at: string;
}
