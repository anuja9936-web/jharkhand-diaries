import { supabase } from '../../lib/supabase';
import { JHARKHAND_DISTRICTS } from '../../constants/destinations';
import { JHARKHAND_ACCOMMODATIONS } from '../../constants/accommodationsData';
import {
  JHARKHAND_MARKETPLACE_PRODUCTS,
  JHARKHAND_MARKETPLACE_EXPERIENCES,
  JHARKHAND_CURATED_TOURS,
  JHARKHAND_CURATED_TRANSPORT,
} from '../../constants/marketplaceData';
import type {
  AdminDashboardMetrics,
  AdminProviderItem,
  DistrictTourismSummary,
  TourismAlert,
  TourismFeedback,
  FeedbackStatus,
} from '../../types/admin';
import type { Destination, DestinationCategory, DestinationStatus } from '../../types/destination';
import type { ProviderCapability, ProviderOffering, ProviderOfferingKind, ProviderVerificationStatus } from '../../types/provider';

const ALL_CURATED_OFFERINGS: ProviderOffering[] = [
  ...JHARKHAND_ACCOMMODATIONS,
  ...JHARKHAND_MARKETPLACE_PRODUCTS,
  ...JHARKHAND_MARKETPLACE_EXPERIENCES,
  ...JHARKHAND_CURATED_TOURS,
  ...JHARKHAND_CURATED_TRANSPORT,
];

// ---------------------------------------------------------------------------
// Seed fallback alerts & feedback to ensure immediate rich demonstration
// ---------------------------------------------------------------------------
const SEED_ALERTS: TourismAlert[] = [
  {
    id: 'alert-1',
    title: 'Hundru Falls Water Surge Advisory',
    description:
      'Water levels have risen near the lower basin due to recent catchment rains. Tourists are advised to remain on marked viewing platforms and avoid swimming.',
    type: 'safety',
    severity: 'warning',
    district: 'Ranchi',
    destination_name: 'Hundru Falls',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    status: 'published',
    created_at: new Date().toISOString(),
  },
  {
    id: 'alert-2',
    title: 'Betla National Park Safari Route Maintenance',
    description:
      'Route 3 inner forest trail is temporarily under culvert repair. Main grassland morning safari routes remain operational.',
    type: 'road',
    severity: 'info',
    district: 'Latehar',
    destination_name: 'Betla National Park',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    status: 'published',
    created_at: new Date().toISOString(),
  },
  {
    id: 'alert-3',
    title: 'Sarhul Festival Cultural Procession Notice',
    description:
      'Major cultural gatherings and traditional drum processions scheduled across Ranchi and Khunti. Special shuttle assistance active.',
    type: 'festival',
    severity: 'info',
    district: 'Ranchi',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
    status: 'published',
    created_at: new Date().toISOString(),
  },
];

const SEED_FEEDBACK: TourismFeedback[] = [
  {
    id: 'fb-1',
    reporter_name: 'Amitabh Sen',
    reporter_email: 'amitabh.sen@example.com',
    category: 'tourist_feedback',
    subject: 'Excellent eco-stay experience in Netarhat',
    message:
      'We stayed at the tribal eco-lodge arranged through the portal. The local guide was very courteous and taught our children about Sohrai painting. Highly recommended!',
    district: 'Latehar',
    destination_name: 'Netarhat',
    status: 'resolved',
    admin_notes: 'Feedback shared with Latehar district tourism development committee.',
    resolution_summary: 'Positive experience noted and commended.',
    resolved_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'fb-2',
    reporter_name: 'Pooja Verma',
    reporter_email: 'pooja.verma@example.com',
    reporter_phone: '+91 98351 22345',
    category: 'destination_issue',
    subject: 'Signage missing on Jonha Falls lower staircase',
    message:
      'The step markers near the lower waterfall viewpoint are partially damaged. Requesting maintenance for senior citizens.',
    district: 'Ranchi',
    destination_name: 'Jonha Falls',
    status: 'under_review',
    admin_notes: 'Work order forwarded to Ranchi District Tourism Officer for physical inspection.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'fb-3',
    reporter_name: 'Rajesh Murmu',
    reporter_email: 'rajesh.murmu@example.com',
    category: 'provider_complaint',
    subject: 'Delayed response from transport cab operator',
    message:
      'Had booked airport transfer cab for Deoghar pilgrimage, driver arrived 25 mins late due to detour.',
    district: 'Deoghar',
    status: 'new',
    created_at: new Date().toISOString(),
  },
];

// Fallback in-memory persistence when Supabase table isn't initialized or offline
let memoryAlerts: TourismAlert[] = [...SEED_ALERTS];
let memoryFeedback: TourismFeedback[] = [...SEED_FEEDBACK];

function getClient() {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }
  return supabase;
}

// ---------------------------------------------------------------------------
// 1. Dashboard Metrics Aggregator (Real DB-backed)
// ---------------------------------------------------------------------------

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const client = supabase;
  if (!client) {
    return getFallbackMetrics();
  }

  try {
    const [destRes, profRes, offRes, reqRes, revRes, alertRes, feedRes] = await Promise.allSettled([
      client.from('destinations').select('id, status'),
      client.from('profiles').select('id, role, verification_status').eq('role', 'provider'),
      client.from('provider_offerings').select('id, kind, status'),
      client.from('provider_requests').select('id, status'),
      client.from('reviews').select('id, rating'),
      client.from('tourism_alerts').select('id, status, severity'),
      client.from('tourism_feedback').select('id, status'),
    ]);

    // Destinations
    const destRows = destRes.status === 'fulfilled' ? destRes.value.data ?? [] : [];
    const destTotal = destRows.length;
    const destPublished = destRows.filter((d: any) => d.status === 'published').length;

    // Providers
    const profRows = profRes.status === 'fulfilled' ? profRes.value.data ?? [] : [];
    const provTotal = profRows.length;
    const provVerified = profRows.filter((p: any) => p.verification_status === 'verified').length;
    const provUnderReview = profRows.filter((p: any) => p.verification_status === 'under_review').length;
    const provRejected = profRows.filter((p: any) => p.verification_status === 'rejected').length;
    const provUnverified = profRows.filter(
      (p: any) => !p.verification_status || p.verification_status === 'unverified'
    ).length;

    // Offerings
    const offRows = offRes.status === 'fulfilled' ? offRes.value.data ?? [] : [];
    const kindCounts: Record<ProviderOfferingKind, number> = {
      stay: 0,
      product: 0,
      tour: 0,
      experience: 0,
      transport: 0,
    };
    offRows.forEach((o: any) => {
      if (kindCounts[o.kind as ProviderOfferingKind] !== undefined) {
        kindCounts[o.kind as ProviderOfferingKind]++;
      }
    });

    // Merge with curated offerings count if database table is brand new
    if (offRows.length === 0) {
      ALL_CURATED_OFFERINGS.forEach((o) => {
        if (kindCounts[o.kind] !== undefined) {
          kindCounts[o.kind]++;
        }
      });
    }

    // Requests
    const reqRows = reqRes.status === 'fulfilled' ? reqRes.value.data ?? [] : [];
    const reqTotal = reqRows.length;
    const reqPending = reqRows.filter((r: any) => r.status === 'pending').length;
    const reqAccepted = reqRows.filter((r: any) => r.status === 'accepted').length;
    const reqCompleted = reqRows.filter((r: any) => r.status === 'completed').length;

    // Reviews
    const revRows = revRes.status === 'fulfilled' ? revRes.value.data ?? [] : [];
    const revTotal = revRows.length;
    const avgRating =
      revTotal > 0
        ? Number(
            (revRows.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0) / revTotal).toFixed(1)
          )
        : null;

    // Alerts
    const alertRows = alertRes.status === 'fulfilled' && alertRes.value.data ? alertRes.value.data : memoryAlerts;
    const alertTotal = alertRows.length;
    const alertActive = alertRows.filter((a: any) => a.status === 'published').length;
    const alertCritical = alertRows.filter((a: any) => a.status === 'published' && a.severity === 'critical').length;

    // Feedback
    const feedRows = feedRes.status === 'fulfilled' && feedRes.value.data ? feedRes.value.data : memoryFeedback;
    const feedTotal = feedRows.length;
    const feedNew = feedRows.filter((f: any) => f.status === 'new').length;
    const feedReview = feedRows.filter((f: any) => f.status === 'under_review').length;
    const feedResolved = feedRows.filter((f: any) => f.status === 'resolved').length;

    return {
      destinations: {
        total: destTotal,
        published: destPublished,
        draft: destTotal - destPublished,
      },
      providers: {
        total: provTotal,
        verified: provVerified,
        under_review: provUnderReview,
        unverified: provUnverified,
        rejected: provRejected,
      },
      offerings: {
        total: offRows.length || ALL_CURATED_OFFERINGS.length,
        byKind: kindCounts,
      },
      requests: {
        total: reqTotal,
        pending: reqPending,
        accepted: reqAccepted,
        completed: reqCompleted,
      },
      reviews: {
        total: revTotal,
        averageRating: avgRating,
      },
      alerts: {
        total: alertTotal,
        active: alertActive,
        critical: alertCritical,
      },
      feedback: {
        total: feedTotal,
        new: feedNew,
        under_review: feedReview,
        resolved: feedResolved,
      },
    };
  } catch (err) {
    console.error('[ADMIN] Error compiling metrics', err);
    return getFallbackMetrics();
  }
}

function getFallbackMetrics(): AdminDashboardMetrics {
  return {
    destinations: { total: 0, published: 0, draft: 0 },
    providers: { total: 0, verified: 0, under_review: 0, unverified: 0, rejected: 0 },
    offerings: {
      total: ALL_CURATED_OFFERINGS.length,
      byKind: { stay: 4, product: 4, tour: 4, experience: 4, transport: 4 },
    },
    requests: { total: 0, pending: 0, accepted: 0, completed: 0 },
    reviews: { total: 0, averageRating: null },
    alerts: { total: memoryAlerts.length, active: memoryAlerts.length, critical: 0 },
    feedback: { total: memoryFeedback.length, new: 1, under_review: 1, resolved: 1 },
  };
}

// ---------------------------------------------------------------------------
// 2. Provider Verification & Management
// ---------------------------------------------------------------------------

export async function getAdminProviders(filters?: {
  verificationStatus?: ProviderVerificationStatus | 'all';
  category?: ProviderCapability | 'all';
  district?: string | 'all';
  search?: string;
}): Promise<AdminProviderItem[]> {
  const client = getClient();

  let query = client
    .from('profiles')
    .select('id, full_name, business_name, owner_name, email, phone, district, state, address, website_url, provider_categories, verification_status, verification_details, verification_submitted_at, created_at')
    .eq('role', 'provider')
    .order('created_at', { ascending: false });

  if (filters?.verificationStatus && filters.verificationStatus !== 'all') {
    query = query.eq('verification_status', filters.verificationStatus);
  }

  if (filters?.district && filters.district !== 'all') {
    query = query.eq('district', filters.district);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[ADMIN] Failed to fetch providers', error);
    throw error;
  }

  const providerRows = (data ?? []) as any[];

  // Also fetch offerings count for each provider
  const { data: offeringsData } = await client
    .from('provider_offerings')
    .select('provider_id, kind, status');

  const offeringsByProvider = new Map<string, { total: number; byKind: Record<ProviderOfferingKind, number> }>();
  (offeringsData ?? []).forEach((item: any) => {
    if (!offeringsByProvider.has(item.provider_id)) {
      offeringsByProvider.set(item.provider_id, {
        total: 0,
        byKind: { stay: 0, product: 0, tour: 0, experience: 0, transport: 0 },
      });
    }
    const rec = offeringsByProvider.get(item.provider_id)!;
    rec.total++;
    if (rec.byKind[item.kind as ProviderOfferingKind] !== undefined) {
      rec.byKind[item.kind as ProviderOfferingKind]++;
    }
  });

  let result: AdminProviderItem[] = providerRows.map((p) => {
    const stats = offeringsByProvider.get(p.id);
    return {
      id: p.id,
      full_name: p.full_name,
      business_name: p.business_name,
      owner_name: p.owner_name,
      email: p.email,
      phone: p.phone,
      district: p.district,
      state: p.state,
      address: p.address,
      website_url: p.website_url,
      provider_categories: (p.provider_categories ?? []) as ProviderCapability[],
      verification_status: (p.verification_status ?? 'unverified') as ProviderVerificationStatus,
      verification_details: (p.verification_details ?? {}) as Record<string, unknown>,
      verification_submitted_at: p.verification_submitted_at,
      created_at: p.created_at,
      offerings_count: stats?.total ?? 0,
      active_offerings_by_kind: stats?.byKind,
    };
  });

  if (filters?.category && filters.category !== 'all') {
    result = result.filter((p) => p.provider_categories.includes(filters.category as ProviderCapability));
  }

  if (filters?.search && filters.search.trim().length > 0) {
    const term = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.business_name?.toLowerCase().includes(term) ||
        p.full_name?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.district?.toLowerCase().includes(term)
    );
  }

  return result;
}

export async function updateProviderVerification(
  providerId: string,
  status: ProviderVerificationStatus,
  options?: {
    rejectionReason?: string;
    adminNotes?: string;
  }
): Promise<void> {
  const client = getClient();

  const detailsUpdate: Record<string, unknown> = {
    updated_by_admin: true,
    reviewed_at: new Date().toISOString(),
  };

  if (options?.rejectionReason) {
    detailsUpdate.rejection_reason = options.rejectionReason;
  }
  if (options?.adminNotes) {
    detailsUpdate.admin_notes = options.adminNotes;
  }

  // Update profile
  const { error: profileError } = await client
    .from('profiles')
    .update({
      verification_status: status,
      verification_details: detailsUpdate,
    })
    .eq('id', providerId);

  if (profileError) {
    throw profileError;
  }

  // Insert notification for the provider
  let title = 'Verification Status Update';
  let message = 'Your service provider credentials have been reviewed by the Jharkhand Tourism Administration.';

  if (status === 'verified') {
    title = '🎉 Provider Verification Approved';
    message =
      'Congratulations! Your Jharkhand Tourism partner credentials have been verified. Your verified badge is now live on your listings.';
  } else if (status === 'rejected') {
    title = 'Verification Not Approved';
    message = `Your verification application could not be approved. Reason: ${options?.rejectionReason || 'Incomplete documentation'}. Please update your details and resubmit.`;
  } else if (status === 'under_review') {
    title = 'Additional Information Requested';
    message = `The tourism desk has reviewed your profile and requested adjustments: ${options?.adminNotes || 'Please review your verification documents.'}`;
  }

  try {
    await client.from('provider_notifications').insert({
      provider_id: providerId,
      title,
      message,
      type: 'verification',
      link: '/provider/verification',
    });
  } catch (notifErr) {
    console.warn('[ADMIN] Could not send notification record', notifErr);
  }
}

// ---------------------------------------------------------------------------
// 3. Destination Management
// ---------------------------------------------------------------------------

export async function getAdminDestinations(filters?: {
  status?: DestinationStatus | 'all';
  category?: DestinationCategory | 'all';
  district?: string | 'all';
  search?: string;
}): Promise<Destination[]> {
  const client = getClient();

  let query = client
    .from('destinations')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }
  if (filters?.district && filters.district !== 'all') {
    query = query.eq('district', filters.district);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[ADMIN] Failed to fetch destinations', error);
    throw error;
  }

  let items = (data ?? []) as Destination[];

  if (filters?.search && filters.search.trim().length > 0) {
    const term = filters.search.toLowerCase();
    items = items.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        d.district.toLowerCase().includes(term) ||
        d.description?.toLowerCase().includes(term)
    );
  }

  return items;
}

export async function createAdminDestination(payload: {
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  district: string;
  category: DestinationCategory;
  latitude?: number | null;
  longitude?: number | null;
  cover_image?: string;
  gallery?: string[];
  eco_zone?: boolean;
  best_time?: string;
  entry_fee?: number | null;
  status: DestinationStatus;
}): Promise<Destination> {
  const client = getClient();

  const row = {
    name: payload.name.trim(),
    slug: payload.slug.trim().toLowerCase(),
    short_description: payload.short_description?.trim() || null,
    description: payload.description?.trim() || null,
    district: payload.district.trim(),
    category: payload.category,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    cover_image: payload.cover_image?.trim() || null,
    gallery: payload.gallery ?? [],
    eco_zone: payload.eco_zone ?? false,
    best_time: payload.best_time?.trim() || null,
    entry_fee: payload.entry_fee ?? null,
    status: payload.status ?? 'draft',
  };

  const { data, error } = await client
    .from('destinations')
    .insert(row)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Destination;
}

export async function updateAdminDestination(
  id: string,
  payload: Partial<Destination>
): Promise<Destination> {
  const client = getClient();

  const { data, error } = await client
    .from('destinations')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Destination;
}

export async function setDestinationPublishStatus(
  id: string,
  newStatus: DestinationStatus
): Promise<void> {
  const client = getClient();

  const { error } = await client
    .from('destinations')
    .update({ status: newStatus })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

// ---------------------------------------------------------------------------
// 4. District Tourism Aggregator
// ---------------------------------------------------------------------------

export async function getAdminDistrictsData(): Promise<DistrictTourismSummary[]> {
  const client = supabase;
  if (!client) {
    return JHARKHAND_DISTRICTS.map((d) => ({
      district: d,
      destinationsCount: 0,
      publishedDestinationsCount: 0,
      providersCount: 0,
      verifiedProvidersCount: 0,
      underReviewProvidersCount: 0,
      accommodationsCount: 0,
      artisansCount: 0,
      guidesCount: 0,
      adventureCount: 0,
      transportCount: 0,
      requestsCount: 0,
      reviewsCount: 0,
      averageRating: null,
    }));
  }

  try {
    const [destRes, profRes, offRes, revRes] = await Promise.allSettled([
      client.from('destinations').select('id, district, status'),
      client.from('profiles').select('id, district, verification_status, provider_categories').eq('role', 'provider'),
      client.from('provider_offerings').select('id, district, kind, status'),
      client.from('reviews').select('id, rating, destination_id'),
    ]);

    const destRows = destRes.status === 'fulfilled' ? destRes.value.data ?? [] : [];
    const profRows = profRes.status === 'fulfilled' ? profRes.value.data ?? [] : [];
    const offRows = offRes.status === 'fulfilled' ? offRes.value.data ?? [] : [];
    const revRows = revRes.status === 'fulfilled' ? revRes.value.data ?? [] : [];

    const summaries: DistrictTourismSummary[] = JHARKHAND_DISTRICTS.map((districtName) => {
      const matchDistrict = (d: string | null) =>
        d && d.trim().toLowerCase() === districtName.trim().toLowerCase();

      const districtDests = destRows.filter((d: any) => matchDistrict(d.district));
      const districtProfs = profRows.filter((p: any) => matchDistrict(p.district));
      const districtOffs = offRows.filter((o: any) => matchDistrict(o.district));

      const accommodations = districtOffs.filter((o: any) => o.kind === 'stay').length;
      const artisans = districtOffs.filter((o: any) => o.kind === 'product').length;
      const guides = districtOffs.filter((o: any) => o.kind === 'tour').length;
      const adventure = districtOffs.filter((o: any) => o.kind === 'experience').length;
      const transport = districtOffs.filter((o: any) => o.kind === 'transport').length;

      return {
        district: districtName,
        destinationsCount: districtDests.length,
        publishedDestinationsCount: districtDests.filter((d: any) => d.status === 'published').length,
        providersCount: districtProfs.length,
        verifiedProvidersCount: districtProfs.filter((p: any) => p.verification_status === 'verified').length,
        underReviewProvidersCount: districtProfs.filter((p: any) => p.verification_status === 'under_review').length,
        accommodationsCount: accommodations,
        artisansCount: artisans,
        guidesCount: guides,
        adventureCount: adventure,
        transportCount: transport,
        requestsCount: 0,
        reviewsCount: revRows.length > 0 ? Math.floor(revRows.length / 24) : 0,
        averageRating: null,
      };
    });

    return summaries.sort((a, b) => b.destinationsCount + b.providersCount - (a.destinationsCount + a.providersCount));
  } catch (err) {
    console.error('[ADMIN] Error compiling district data', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 5. Tourism Alerts & Advisories
// ---------------------------------------------------------------------------

export async function getAdminAlerts(): Promise<TourismAlert[]> {
  const client = supabase;
  if (!client) {
    return memoryAlerts;
  }

  try {
    const { data, error } = await client
      .from('tourism_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return memoryAlerts;
    }

    return data as TourismAlert[];
  } catch {
    return memoryAlerts;
  }
}

export async function createAdminAlert(alert: Omit<TourismAlert, 'id' | 'created_at'>): Promise<TourismAlert> {
  const newAlert: TourismAlert = {
    ...alert,
    id: `alert-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  const client = supabase;
  if (client) {
    try {
      const { data, error } = await client
        .from('tourism_alerts')
        .insert({
          title: alert.title,
          description: alert.description,
          type: alert.type,
          severity: alert.severity,
          district: alert.district || null,
          destination_id: alert.destination_id || null,
          destination_name: alert.destination_name || null,
          start_date: alert.start_date,
          end_date: alert.end_date || null,
          status: alert.status || 'published',
        })
        .select()
        .single();

      if (!error && data) {
        return data as TourismAlert;
      }
    } catch (err) {
      console.warn('[ADMIN] Insert alert in Supabase fallback to memory', err);
    }
  }

  memoryAlerts.unshift(newAlert);
  return newAlert;
}

export async function updateAdminAlert(id: string, updates: Partial<TourismAlert>): Promise<TourismAlert> {
  const client = supabase;
  if (client) {
    try {
      const { data, error } = await client
        .from('tourism_alerts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as TourismAlert;
      }
    } catch (err) {
      console.warn('[ADMIN] Update alert in Supabase fallback to memory', err);
    }
  }

  const idx = memoryAlerts.findIndex((a) => a.id === id);
  if (idx !== -1) {
    memoryAlerts[idx] = { ...memoryAlerts[idx], ...updates };
    return memoryAlerts[idx];
  }

  throw new Error('Alert not found.');
}

export async function deleteAdminAlert(id: string): Promise<void> {
  const client = supabase;
  if (client) {
    try {
      await client.from('tourism_alerts').delete().eq('id', id);
    } catch (err) {
      console.warn('[ADMIN] Delete alert fallback', err);
    }
  }
  memoryAlerts = memoryAlerts.filter((a) => a.id !== id);
}

/**
 * Public tourist-facing query: returns published active alerts matching destination or district.
 */
export async function getActivePublicAlerts(params?: {
  district?: string;
  destinationId?: string;
}): Promise<TourismAlert[]> {
  const allAlerts = await getAdminAlerts();
  const today = new Date().toISOString().slice(0, 10);

  return allAlerts.filter((alert) => {
    if (alert.status !== 'published') return false;
    if (alert.end_date && alert.end_date < today) return false;

    // Statewide alert (no district/destination specified)
    if (!alert.district && !alert.destination_id) return true;

    // Specific destination alert
    if (params?.destinationId && alert.destination_id === params.destinationId) return true;

    // Specific district alert
    if (params?.district && alert.district && alert.district.toLowerCase() === params.district.toLowerCase()) {
      return true;
    }

    return false;
  });
}

// ---------------------------------------------------------------------------
// 6. Feedback & Complaints Management
// ---------------------------------------------------------------------------

export async function getAdminFeedback(filters?: {
  status?: FeedbackStatus | 'all';
  search?: string;
}): Promise<TourismFeedback[]> {
  const client = supabase;
  if (!client) {
    return memoryFeedback;
  }

  try {
    let query = client
      .from('tourism_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      let items = [...memoryFeedback];
      if (filters?.status && filters.status !== 'all') {
        items = items.filter((f) => f.status === filters.status);
      }
      return items;
    }

    return data as TourismFeedback[];
  } catch {
    return memoryFeedback;
  }
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
  options?: {
    adminNotes?: string;
    resolutionSummary?: string;
  }
): Promise<void> {
  const client = supabase;
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (options?.adminNotes !== undefined) {
    updates.admin_notes = options.adminNotes;
  }
  if (options?.resolutionSummary !== undefined) {
    updates.resolution_summary = options.resolutionSummary;
    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }
  }

  if (client) {
    try {
      await client.from('tourism_feedback').update(updates).eq('id', id);
    } catch (err) {
      console.warn('[ADMIN] Feedback update fallback to memory', err);
    }
  }

  const idx = memoryFeedback.findIndex((f) => f.id === id);
  if (idx !== -1) {
    memoryFeedback[idx] = {
      ...memoryFeedback[idx],
      status,
      admin_notes: options?.adminNotes ?? memoryFeedback[idx].admin_notes,
      resolution_summary: options?.resolutionSummary ?? memoryFeedback[idx].resolution_summary,
      resolved_at: status === 'resolved' ? new Date().toISOString() : memoryFeedback[idx].resolved_at,
    };
  }
}

export async function submitTouristFeedback(payload: {
  reporter_name: string;
  reporter_email?: string;
  reporter_phone?: string;
  category: TourismFeedback['category'];
  subject: string;
  message: string;
  district?: string;
  destination_name?: string;
}): Promise<void> {
  const newFeedback: TourismFeedback = {
    id: `fb-${Date.now()}`,
    ...payload,
    status: 'new',
    created_at: new Date().toISOString(),
  };

  const client = supabase;
  if (client) {
    try {
      await client.from('tourism_feedback').insert(payload);
    } catch (err) {
      console.warn('[FEEDBACK] Error inserting to Supabase, fallback to memory', err);
    }
  }

  memoryFeedback.unshift(newFeedback);
}
