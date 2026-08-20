import type {
  ProviderCapability,
  ProviderOfferingKind,
  ProviderVerificationStatus,
} from './provider';

export type AlertType =
  | 'weather'
  | 'safety'
  | 'road'
  | 'closure'
  | 'festival'
  | 'emergency'
  | 'general';

export type AlertSeverity = 'info' | 'advisory' | 'warning' | 'critical';

export type AlertStatus = 'draft' | 'published' | 'archived';

export interface TourismAlert {
  id: string;
  title: string;
  description: string;
  type: AlertType;
  severity: AlertSeverity;
  district: string | null;
  destination_id?: string | null;
  destination_name?: string | null;
  start_date: string;
  end_date?: string | null;
  status: AlertStatus;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
}

export type FeedbackCategory =
  | 'tourist_feedback'
  | 'provider_complaint'
  | 'destination_issue'
  | 'safety_concern'
  | 'service_complaint'
  | 'other';

export type FeedbackStatus = 'new' | 'under_review' | 'resolved' | 'closed';

export interface TourismFeedback {
  id: string;
  reporter_name: string;
  reporter_email?: string | null;
  reporter_phone?: string | null;
  category: FeedbackCategory;
  subject: string;
  message: string;
  district?: string | null;
  destination_id?: string | null;
  destination_name?: string | null;
  provider_id?: string | null;
  provider_name?: string | null;
  status: FeedbackStatus;
  admin_notes?: string | null;
  resolution_summary?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AdminProviderItem {
  id: string;
  full_name: string | null;
  business_name: string | null;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  district: string | null;
  state: string | null;
  address: string | null;
  website_url: string | null;
  provider_categories: ProviderCapability[];
  verification_status: ProviderVerificationStatus;
  verification_details: Record<string, unknown>;
  verification_submitted_at: string | null;
  created_at: string;
  offerings_count?: number;
  active_offerings_by_kind?: Record<ProviderOfferingKind, number>;
}

export interface DistrictTourismSummary {
  district: string;
  destinationsCount: number;
  publishedDestinationsCount: number;
  providersCount: number;
  verifiedProvidersCount: number;
  underReviewProvidersCount: number;
  accommodationsCount: number;
  artisansCount: number;
  guidesCount: number;
  adventureCount: number;
  transportCount: number;
  requestsCount: number;
  reviewsCount: number;
  averageRating: number | null;
}

export interface AdminDashboardMetrics {
  destinations: {
    total: number;
    published: number;
    draft: number;
  };
  providers: {
    total: number;
    verified: number;
    under_review: number;
    unverified: number;
    rejected: number;
  };
  offerings: {
    total: number;
    byKind: Record<ProviderOfferingKind, number>;
  };
  requests: {
    total: number;
    pending: number;
    accepted: number;
    completed: number;
  };
  reviews: {
    total: number;
    averageRating: number | null;
  };
  alerts: {
    total: number;
    active: number;
    critical: number;
  };
  feedback: {
    total: number;
    new: number;
    under_review: number;
    resolved: number;
  };
}
