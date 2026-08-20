export type ProviderCapability =
  | 'accommodation'
  | 'artisan'
  | 'guide'
  | 'adventure'
  | 'transport';

export type ProviderOfferingKind =
  | 'stay'
  | 'product'
  | 'experience'
  | 'tour'
  | 'transport';

export type ProviderOfferingStatus = 'draft' | 'published' | 'archived';

export type ProviderRequestType =
  | 'learning'
  | 'booking'
  | 'order'
  | 'tour'
  | 'transport'
  | 'enquiry';

export type ProviderRequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type ProviderVerificationStatus =
  | 'unverified'
  | 'under_review'
  | 'verified'
  | 'rejected';

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
  offering_kind?: ProviderOfferingKind | null;
  request_type: ProviderRequestType;
  tourist_id: string | null;
  tourist_name: string;
  tourist_email: string | null;
  preferred_date: string | null;
  start_date?: string | null;
  end_date?: string | null;
  duration: string | null;
  participants: number;
  number_of_people?: number;
  message: string | null;
  estimated_amount?: number | null;
  provider_response?: string | null;
  details?: Record<string, unknown> | null;
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
  verification_status?: ProviderVerificationStatus | null;
  created_at: string;
}

export interface ProviderNotification {
  id: string;
  provider_id: string;
  title: string;
  message: string;
  type: 'info' | 'request' | 'review' | 'verification' | 'alert';
  read: boolean;
  link?: string | null;
  created_at: string;
}

export interface TouristNotification {
  id: string;
  tourist_id: string;
  title: string;
  message: string;
  type: 'info' | 'booking_status' | 'alert' | 'review';
  read: boolean;
  link?: string | null;
  created_at: string;
}
