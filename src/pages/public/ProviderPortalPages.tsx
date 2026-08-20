import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  HelpCircle,
  MapPin,
  Package,
  Send,
  Sparkles,
  Store,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Card, Input, Textarea } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/StateBlocks';
import { DEFAULT_DESTINATION_IMAGE } from '../../constants/destinations';
import { getProviderCategoryLabel, getProviderOfferingKindLabel } from '../../constants/provider';
import { useAuth } from '../../hooks/useAuth';
import { formatIndianCurrency } from '../../lib/utils';
import {
  createProviderRequest,
  getPublicProviderOfferingById,
  getPublicProviderOfferingsByProvider,
  getPublicProviderProfile,
} from '../../services/provider/providerMarketplaceService';
import type { ProviderOffering, ProviderOfferingKind, ProviderPublicProfile, ProviderRequestType } from '../../types/provider';

// ---------------------------------------------------------------------------
// Reusable Single-Action Request Form
// ---------------------------------------------------------------------------

interface RequestFormConfig {
  requestType: ProviderRequestType;
  title: string;
  subtitle: string;
  buttonLabel: string;
  dateLabel: string;
  durationLabel: string;
  durationPlaceholder: string;
  participantsLabel: string;
  participantsDefault: number;
  messageLabel: string;
  messagePlaceholder: string;
  successMessage: string;
}

function getRequestFormConfig(kind: ProviderOfferingKind): RequestFormConfig {
  switch (kind) {
    case 'product':
      return {
        requestType: 'order',
        title: 'Buy or Enquire',
        subtitle: 'Send a purchase or custom order enquiry directly to the artisan/creator.',
        buttonLabel: 'Send Purchase Enquiry',
        dateLabel: 'Desired delivery / pickup date',
        durationLabel: 'Preferred timeframe / rush order',
        durationPlaceholder: 'e.g. Standard, within 1 week',
        participantsLabel: 'Quantity desired',
        participantsDefault: 1,
        messageLabel: 'Notes or customization requirements',
        messagePlaceholder: 'Specify sizes, colors, customizations, or delivery address questions...',
        successMessage: 'Enquiry sent! The artisan will review your request and get back to you.',
      };
    case 'experience':
      return {
        requestType: 'learning',
        title: 'Request Learning Experience',
        subtitle: 'Connect with the artisan/guide to schedule an interactive hands-on workshop or session.',
        buttonLabel: 'Submit Learning Request',
        dateLabel: 'Preferred date',
        durationLabel: 'Preferred timing / duration',
        durationPlaceholder: 'e.g. Morning 10 AM, 2 hours',
        participantsLabel: 'Number of participants / learners',
        participantsDefault: 1,
        messageLabel: 'What would you like to learn?',
        messagePlaceholder: 'Tell the artisan about your experience level, specific craft questions, or group requirements...',
        successMessage: 'Learning request submitted! The artisan will confirm availability.',
      };
    case 'tour':
      return {
        requestType: 'tour',
        title: 'Book Guided Tour',
        subtitle: 'Connect directly with the local guide to confirm dates, itinerary route, and group schedule.',
        buttonLabel: 'Send Tour Request',
        dateLabel: 'Preferred tour date',
        durationLabel: 'Preferred timing / batch',
        durationPlaceholder: 'e.g. Morning 08:00 AM, Full Day',
        participantsLabel: 'Number of participants',
        participantsDefault: 2,
        messageLabel: 'Special requests or custom stops',
        messagePlaceholder: 'Mention language preferences, physical fitness level, pickup location, or custom landmarks...',
        successMessage: 'Tour booking request sent! The guide will confirm your itinerary and schedule.',
      };
    case 'transport':
      return {
        requestType: 'transport',
        title: 'Book Vehicle / Transfer',
        subtitle: 'Request pickup location, travel schedule, passenger count, and route options.',
        buttonLabel: 'Submit Transport Request',
        dateLabel: 'Travel date',
        durationLabel: 'Trip duration / return plan',
        durationPlaceholder: 'e.g. 1 day, one-way drop, 3-day rental',
        participantsLabel: 'Number of passengers',
        participantsDefault: 4,
        messageLabel: 'Pickup address & destination details',
        messagePlaceholder: 'Specify airport flight number, pickup landmark, luggage count, or sightseeing route...',
        successMessage: 'Transport request sent! The operator will confirm vehicle availability.',
      };
    case 'stay':
      return {
        requestType: 'booking',
        title: 'Enquire Availability & Book',
        subtitle: 'Request stay availability and booking support directly from the host.',
        buttonLabel: 'Request Stay Booking',
        dateLabel: 'Check-in date',
        durationLabel: 'Number of nights',
        durationPlaceholder: 'e.g. 2 nights',
        participantsLabel: 'Number of guests',
        participantsDefault: 2,
        messageLabel: 'Special requests or questions',
        messagePlaceholder: 'Mention arrival time, dietary preferences, extra beds needed, etc...',
        successMessage: 'Stay booking request sent! The host will contact you with availability.',
      };
  }
}

function PublicOfferingRequestForm({
  offering,
  providerProfile,
}: {
  offering: ProviderOffering;
  providerProfile: ProviderPublicProfile | null;
}) {
  const { user, profile, role } = useAuth();
  const config = getRequestFormConfig(offering.kind);

  const [preferredDate, setPreferredDate] = useState('');
  const [duration, setDuration] = useState('');
  const [participants, setParticipants] = useState(String(config.participantsDefault));
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const touristName = profile?.full_name ?? user?.email ?? '';
  const touristEmail = profile?.email ?? user?.email ?? '';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setNotice({ text: 'Please sign in to submit your enquiry.', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      setNotice(null);

      await createProviderRequest({
        providerId: offering.provider_id,
        offeringId: offering.id,
        requestType: config.requestType,
        touristName: touristName.trim() || 'Valued Tourist',
        touristEmail: touristEmail.trim() || null,
        preferredDate: preferredDate || null,
        duration: duration || null,
        participants: Number(participants) || 1,
        message: message.trim() || null,
      });

      setNotice({ text: config.successMessage, type: 'success' });
      setMessage('');
      setDuration('');
      setPreferredDate('');
      setParticipants(String(config.participantsDefault));
    } catch (submitError) {
      setNotice({
        text: submitError instanceof Error ? submitError.message : 'Unable to submit request.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const providerName = providerProfile?.business_name || providerProfile?.full_name || 'the provider';

  return (
    <Card className="border-clay-200/80 bg-white p-6 shadow-sm">
      <div className="space-y-2 border-b border-ink-100 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-clay-600" />
          <h2 className="text-xl font-bold text-ink-900">{config.title}</h2>
        </div>
        <p className="text-xs leading-relaxed text-ink-600">{config.subtitle}</p>
      </div>

      {!user ? (
        <div className="mt-5 space-y-4 rounded-2xl bg-sand/60 p-5 text-center">
          <p className="text-sm font-medium text-ink-800">
            Sign in as a tourist to send enquiries directly to <strong>{providerName}</strong>.
          </p>
          <Button asChild variant="primary" className="w-full">
            <Link to="/login">Sign in to Enquire</Link>
          </Button>
        </div>
      ) : role !== 'tourist' ? (
        <div className="mt-5 rounded-2xl bg-sand/60 p-4 text-center">
          <p className="text-xs text-ink-600">
            Enquiries can be submitted by tourist accounts. You are currently signed in with the <strong>{role}</strong> role.
          </p>
        </div>
      ) : (
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          {notice ? (
            <div
              className={`flex items-start gap-2.5 rounded-2xl p-3.5 text-xs font-medium ${
                notice.type === 'success'
                  ? 'border border-forest-200 bg-forest-50 text-forest-900'
                  : 'border border-clay-200 bg-clay-50 text-clay-900'
              }`}
            >
              {notice.type === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
              ) : (
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-clay-600" />
              )}
              <span>{notice.text}</span>
            </div>
          ) : null}

          {/* Contact summary */}
          <div className="rounded-xl bg-sand/40 p-3 text-xs text-ink-700">
            <span className="font-medium text-ink-900">Requesting as:</span> {touristName} ({touristEmail})
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-xs">
              <span className="font-medium text-ink-700">{config.dateLabel}</span>
              <Input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="h-9 text-xs"
              />
            </label>

            <label className="block space-y-1 text-xs">
              <span className="font-medium text-ink-700">{config.durationLabel}</span>
              <Input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder={config.durationPlaceholder}
                className="h-9 text-xs"
              />
            </label>
          </div>

          <label className="block space-y-1 text-xs">
            <span className="font-medium text-ink-700">{config.participantsLabel}</span>
            <Input
              type="number"
              min="1"
              step="1"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="h-9 text-xs"
            />
          </label>

          <label className="block space-y-1 text-xs">
            <span className="font-medium text-ink-700">{config.messageLabel}</span>
            <Textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={config.messagePlaceholder}
              className="text-xs"
            />
          </label>

          <Button type="submit" variant="primary" disabled={saving} className="w-full gap-2 py-2.5 text-xs font-semibold">
            <Send className="h-3.5 w-3.5" />
            {saving ? 'Submitting...' : config.buttonLabel}
          </Button>
        </form>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Unified Public Offering Detail Page (Product / Experience / Stay)
// ---------------------------------------------------------------------------

function PublicOfferingPage({ kind }: { kind: ProviderOfferingKind }) {
  const { offeringId } = useParams<{ offeringId: string }>();
  const [offering, setOffering] = useState<ProviderOffering | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderPublicProfile | null>(null);
  const [related, setRelated] = useState<ProviderOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadOffering() {
      if (!offeringId) {
        setError('Missing item identifier.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const record = await getPublicProviderOfferingById(offeringId);

        if (!alive) return;

        if (!record || record.kind !== kind) {
          setError(`This ${kind} is currently not available.`);
          setOffering(null);
          return;
        }

        setOffering(record);

        // Load provider profile and related offerings
        const [profile, providerItems] = await Promise.all([
          getPublicProviderProfile(record.provider_id).catch(() => null),
          getPublicProviderOfferingsByProvider(record.provider_id, kind).catch(() => []),
        ]);

        if (!alive) return;

        setProviderProfile(profile);
        setRelated(providerItems.filter((item) => item.id !== record.id).slice(0, 3));
      } catch (loadError) {
        if (alive) {
          setError(loadError instanceof Error ? loadError.message : `Unable to load this ${kind}.`);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadOffering();

    return () => {
      alive = false;
    };
  }, [kind, offeringId]);

  if (loading) {
    return <LoadingState label={`Loading ${getProviderOfferingKindLabel(kind).toLowerCase()} details...`} />;
  }

  if (error) {
    return <ErrorState title="Unable to load item" message={error} />;
  }

  if (!offering) {
    return (
      <EmptyState
        title="Item not found"
        message="This offering may have been unpublished or removed."
        actionLabel="Explore Marketplace"
        actionHref="/marketplace"
      />
    );
  }

  const image = offering.cover_image || DEFAULT_DESTINATION_IMAGE;
  const providerName = providerProfile?.business_name || providerProfile?.full_name || 'Local Jharkhand Provider';
  const location = offering.district || providerProfile?.district || 'Jharkhand';
  const kindLabel = getProviderOfferingKindLabel(kind);

  // Determine pricing display
  let priceDisplay: string | null = null;
  let priceSuffix = '';
  if (offering.price != null) {
    priceDisplay = formatIndianCurrency(offering.price);
    if (kind === 'stay') {
      priceSuffix = ' / night';
    } else if (kind === 'experience') {
      priceSuffix = ' / person';
    }
  }

  const isStay = kind === 'stay';
  const isExperience = kind === 'experience';

  const metadata = (offering.metadata ?? {}) as Record<string, unknown>;
  const amenities = Array.isArray(metadata.amenities)
    ? (metadata.amenities as string[])
    : isStay
      ? ['Local Hospitality', 'Private Space']
      : [];

  const highlights = Array.isArray(metadata.highlights)
    ? (metadata.highlights as string[])
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Back button link */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" className="gap-2 px-0 text-xs font-semibold text-ink-600 hover:text-clay-700">
          <Link
            to={
              kind === 'stay'
                ? '/accommodations'
                : kind === 'tour'
                  ? '/tours'
                  : kind === 'transport'
                    ? '/transport'
                    : '/marketplace'
            }
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>
              {kind === 'stay'
                ? 'Back to Accommodations'
                : kind === 'tour'
                  ? 'Back to Tours'
                  : kind === 'transport'
                    ? 'Back to Transport'
                    : 'Back to Marketplace'}
            </span>
          </Link>
        </Button>

        {offering.district ? (
          <Button asChild variant="secondary" size="sm" className="gap-1.5 text-xs">
            <Link to={`/map?district=${encodeURIComponent(offering.district)}`}>
              <MapPin className="h-3.5 w-3.5 text-clay-700" />
              <span>View Location on Map</span>
            </Link>
          </Button>
        ) : null}
      </div>

      {/* Main Offering Grid: Left = Details & Gallery, Right = Request Action */}
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left Column: Visuals, Identity, Description */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-ink-200/80 bg-white p-0 shadow-sm">
            {/* Cover Image Banner */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
              <img src={image} alt={offering.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Badge variant="accent" className="bg-white/95 text-xs font-semibold text-ink-900 shadow-sm">
                  {kindLabel}
                </Badge>
                {offering.category ? (
                  <Badge variant="neutral" className="bg-ink-900/80 text-xs text-white backdrop-blur-sm">
                    {offering.category}
                  </Badge>
                ) : null}
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-5 p-6">
              {/* Title & Price Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 pb-5">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                    {offering.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-600">
                    <span className="inline-flex items-center gap-1 font-medium text-ink-700">
                      <MapPin className="h-3.5 w-3.5 text-clay-600" />
                      {location}
                    </span>
                    <Link
                      to={`/providers/${offering.provider_id}`}
                      className="font-medium text-clay-700 hover:text-clay-800 hover:underline"
                    >
                      Offered by {providerName}
                    </Link>
                  </div>
                </div>

                {priceDisplay ? (
                  <div className="rounded-2xl bg-sand/60 px-4 py-2.5 text-right">
                    <span className="block text-[11px] font-medium uppercase tracking-wider text-ink-500">
                      {isExperience ? 'Fee' : isStay ? 'Rate' : 'Price'}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-ink-900">{priceDisplay}</span>
                      <span className="text-xs font-normal text-ink-600">{priceSuffix}</span>
                    </div>
                  </div>
                ) : (
                  <Badge variant="accent" className="text-xs">
                    Price on request
                  </Badge>
                )}
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-clay-700">Overview</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">
                  {offering.description || offering.short_description || 'No detailed description provided.'}
                </p>
              </div>

              {/* Stay Amenities */}
              {isStay && amenities.length > 0 ? (
                <div className="space-y-3 pt-3 border-t border-ink-100">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-clay-700">Amenities &amp; Features</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {amenities.map((am) => (
                      <div key={am} className="flex items-center gap-2 text-xs text-ink-700">
                        <CheckCircle2 className="h-4 w-4 text-forest-600 shrink-0" />
                        <span>{am}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Experience Highlights */}
              {isExperience && highlights.length > 0 ? (
                <div className="space-y-3 pt-3 border-t border-ink-100">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-clay-700">Experience Highlights</h3>
                  <div className="space-y-1.5">
                    {highlights.map((hl) => (
                      <div key={hl} className="flex items-center gap-2 text-xs text-ink-700">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Metadata Highlights (Material, Duration, Specifications, etc.) */}
              {metadata && Object.keys(metadata).length > 0 ? (
                <div className="grid gap-3 pt-3 border-t border-ink-100 sm:grid-cols-2">
                  {typeof metadata.duration === 'string' ? (
                    <div className="flex items-center gap-3 rounded-xl bg-sand/40 p-3 text-xs">
                      <Clock className="h-4 w-4 text-clay-600" />
                      <div>
                        <span className="font-semibold text-ink-900">Duration:</span>{' '}
                        <span className="text-ink-700">{metadata.duration}</span>
                      </div>
                    </div>
                  ) : null}

                  {typeof metadata.property_type === 'string' ? (
                    <div className="flex items-center gap-3 rounded-xl bg-sand/40 p-3 text-xs">
                      <Store className="h-4 w-4 text-clay-600" />
                      <div>
                        <span className="font-semibold text-ink-900">Property Type:</span>{' '}
                        <span className="text-ink-700">{metadata.property_type}</span>
                      </div>
                    </div>
                  ) : null}

                  {typeof metadata.materials === 'string' || typeof metadata.material === 'string' ? (
                    <div className="flex items-center gap-3 rounded-xl bg-sand/40 p-3 text-xs">
                      <Package className="h-4 w-4 text-clay-600" />
                      <div>
                        <span className="font-semibold text-ink-900">Materials:</span>{' '}
                        <span className="text-ink-700">{String(metadata.materials || metadata.material)}</span>
                      </div>
                    </div>
                  ) : null}

                  {typeof metadata.dimensions === 'string' ? (
                    <div className="flex items-center gap-3 rounded-xl bg-sand/40 p-3 text-xs">
                      <Package className="h-4 w-4 text-clay-600" />
                      <div>
                        <span className="font-semibold text-ink-900">Dimensions:</span>{' '}
                        <span className="text-ink-700">{metadata.dimensions}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>

          {/* Provider Card with direct Profile Link */}
          <Card className="flex flex-wrap items-center justify-between gap-4 border-ink-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-sand ring-1 ring-ink-200">
                <img
                  src={providerProfile?.avatar_url || DEFAULT_DESTINATION_IMAGE}
                  alt={providerName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-clay-700">Verified Provider</p>
                <h4 className="text-base font-bold text-ink-900">{providerName}</h4>
                <p className="text-xs text-ink-600">{location}</p>
              </div>
            </div>
            <Button asChild variant="secondary" className="text-xs">
              <Link to={`/providers/${offering.provider_id}`}>View Artisan Profile</Link>
            </Button>
          </Card>
        </div>

        {/* Right Column: Single Primary Request Action */}
        <div>
          <PublicOfferingRequestForm offering={offering} providerProfile={providerProfile} />
        </div>
      </div>

      {/* Related items from this provider if available */}
      {related.length > 0 ? (
        <div className="space-y-4 pt-6 border-t border-ink-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink-900">More {kind}s from this provider</h3>
            <Link
              to={`/providers/${offering.provider_id}`}
              className="text-xs font-semibold text-clay-700 hover:underline"
            >
              See all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((item) => {
              const kindRouteMap: Record<string, string> = {
                stay: 'stays',
                experience: 'experiences',
                product: 'products',
                tour: 'tours',
                transport: 'transport',
              };
              const kindRoute = kindRouteMap[item.kind] ?? 'products';
              return (
                <Link
                  key={item.id}
                  to={`/${kindRoute}/${item.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-clay-300 hover:shadow-md"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-sand">
                    <img
                      src={item.cover_image || DEFAULT_DESTINATION_IMAGE}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-3.5">
                    <h4 className="font-semibold text-sm text-ink-900 group-hover:text-clay-700">{item.name}</h4>
                    <div className="mt-auto pt-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-ink-900">
                        {item.price != null ? formatIndianCurrency(item.price) : 'Enquire'}
                      </span>
                      <span className="font-medium text-clay-700">View →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public Provider Profile Page (`/providers/:providerId`)
// ---------------------------------------------------------------------------

function PublicProviderProfilePage() {
  const { providerId } = useParams<{ providerId: string }>();
  const [profile, setProfile] = useState<ProviderPublicProfile | null>(null);
  const [products, setProducts] = useState<ProviderOffering[]>([]);
  const [experiences, setExperiences] = useState<ProviderOffering[]>([]);
  const [stays, setStays] = useState<ProviderOffering[]>([]);
  const [tours, setTours] = useState<ProviderOffering[]>([]);
  const [transports, setTransports] = useState<ProviderOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // General learning / enquiry form state
  const { user, profile: touristProfile, role } = useAuth();
  const [learningDate, setLearningDate] = useState('');
  const [learningParticipants, setLearningParticipants] = useState('1');
  const [learningMessage, setLearningMessage] = useState('');
  const [learningSubmitting, setLearningSubmitting] = useState(false);
  const [learningNotice, setLearningNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadProviderData() {
      if (!providerId) {
        setError('Missing provider identifier.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const providerProfile = await getPublicProviderProfile(providerId);

        if (!alive) return;

        if (!providerProfile) {
          setError('Provider profile not found.');
          setProfile(null);
          return;
        }

        setProfile(providerProfile);

        // Fetch products, experiences, stays, tours, and transports in parallel
        const [prodList, expList, stayList, tourList, transportList] = await Promise.all([
          getPublicProviderOfferingsByProvider(providerId, 'product').catch(() => []),
          getPublicProviderOfferingsByProvider(providerId, 'experience').catch(() => []),
          getPublicProviderOfferingsByProvider(providerId, 'stay').catch(() => []),
          getPublicProviderOfferingsByProvider(providerId, 'tour').catch(() => []),
          getPublicProviderOfferingsByProvider(providerId, 'transport').catch(() => []),
        ]);

        if (!alive) return;

        setProducts(prodList);
        setExperiences(expList);
        setStays(stayList);
        setTours(tourList);
        setTransports(transportList);
      } catch (loadError) {
        if (alive) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load provider profile.');
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadProviderData();

    return () => {
      alive = false;
    };
  }, [providerId]);

  const handleGeneralLearningRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || !providerId) {
      setLearningNotice({ text: 'Please sign in to submit a request.', type: 'error' });
      return;
    }

    try {
      setLearningSubmitting(true);
      setLearningNotice(null);

      await createProviderRequest({
        providerId,
        requestType: 'learning',
        touristName: touristProfile?.full_name ?? user.email ?? 'Interested Learner',
        touristEmail: touristProfile?.email ?? user.email ?? null,
        preferredDate: learningDate || null,
        participants: Number(learningParticipants) || 1,
        message: learningMessage.trim() || 'Custom craft learning workshop enquiry',
      });

      setLearningNotice({
        text: 'Your craft learning enquiry has been sent directly to the artisan!',
        type: 'success',
      });
      setLearningDate('');
      setLearningParticipants('1');
      setLearningMessage('');
    } catch (err) {
      setLearningNotice({
        text: err instanceof Error ? err.message : 'Failed to submit request.',
        type: 'error',
      });
    } finally {
      setLearningSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading provider profile..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load profile" message={error} />;
  }

  if (!profile) {
    return (
      <EmptyState
        title="Profile not found"
        message="This provider profile could not be located."
        actionLabel="Explore Marketplace"
        actionHref="/marketplace"
      />
    );
  }

  const isArtisan =
    profile.provider_categories?.some((cat) => cat.toLowerCase().includes('craft') || cat.toLowerCase().includes('artisan')) ||
    products.length > 0;

  const totalOfferings =
    products.length + experiences.length + stays.length + tours.length + transports.length;

  return (
    <div className="space-y-8 pb-12">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" className="gap-2 px-0 text-xs font-semibold text-ink-600 hover:text-clay-700">
          <Link to="/marketplace">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Marketplace
          </Link>
        </Button>
      </div>

      {/* Provider Hero / Header Card */}
      <Card className="overflow-hidden border-ink-200/80 bg-white p-0 shadow-sm">
        {/* Banner with earthy palette */}
        <div className="h-44 bg-gradient-to-r from-clay-300 via-sand to-forest-200" />

        <div className="space-y-5 px-6 pb-6 sm:px-8">
          {/* Avatar and Main Identity */}
          <div className="-mt-16 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="h-28 w-28 overflow-hidden rounded-3xl border-4 border-white bg-sand shadow-md ring-1 ring-ink-200/50">
                <img
                  src={profile.avatar_url || DEFAULT_DESTINATION_IMAGE}
                  alt={profile.business_name || profile.full_name || 'Provider'}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {profile.verification_status === 'verified' ? (
                    <Badge variant="success" className="inline-flex items-center gap-1 text-xs font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified Provider
                    </Badge>
                  ) : (
                    <Badge variant="accent" className="text-xs">
                      {isArtisan ? 'Master Artisan & Maker' : 'Verified Local Host'}
                    </Badge>
                  )}
                  {profile.district ? (
                    <Badge variant="neutral" className="text-xs">
                      {profile.district}, Jharkhand
                    </Badge>
                  ) : null}
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                  {profile.business_name || profile.full_name}
                </h1>
                {profile.owner_name && profile.business_name ? (
                  <p className="text-xs text-ink-600">Managed by {profile.owner_name}</p>
                ) : null}
              </div>
            </div>

            {/* Quick stats indicator */}
            <div className="flex items-center gap-3 rounded-2xl bg-sand/60 px-4 py-2 text-xs font-semibold text-ink-800">
              <Sparkles className="h-4 w-4 text-clay-700" />
              <span>{totalOfferings} Published Offerings</span>
            </div>
          </div>

          {/* About / Description */}
          <div className="space-y-2 border-t border-ink-100 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-clay-700">About the Provider</h3>
            <p className="text-sm leading-relaxed text-ink-700">
              {profile.description || 'Welcome to our local Jharkhand tourism offerings and heritage crafts.'}
            </p>
          </div>

          {/* Services Offered Badges */}
          {profile.provider_categories && profile.provider_categories.length > 0 ? (
            <div className="space-y-1.5 border-t border-ink-100 pt-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-clay-700">Services Offered</h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.provider_categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 rounded-full bg-sand px-3 py-1 text-xs font-semibold text-clay-800"
                  >
                    {getProviderCategoryLabel(cat)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      {/* Artisan Learning Section / Callout (If Artisan or offers Experiences) */}
      {isArtisan ? (
        <Card className="border-clay-300 bg-gradient-to-br from-clay-50/80 via-white to-sand/40 p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-clay-100 px-3 py-1 text-xs font-semibold text-clay-800">
                <GraduationCap className="h-3.5 w-3.5" />
                Hands-On Craft Learning
              </div>
              <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">
                Learn Traditional Crafts with {profile.business_name || profile.full_name}
              </h2>
              <p className="text-xs leading-relaxed text-ink-700">
                Discover indigenous techniques directly from local makers. Submit a learning request to schedule a private or small-group hands-on workshop.
              </p>
            </div>

            {/* Quick Learning Request Form */}
            <div className="rounded-2xl border border-clay-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-ink-900">Request a Learning Session</h3>
              <p className="text-[11px] text-ink-600 mt-0.5 mb-3">Connect directly with the artisan to schedule a date.</p>

              {!user ? (
                <div className="space-y-2 text-center pt-2">
                  <p className="text-xs text-ink-600">Sign in to send a learning request.</p>
                  <Button asChild variant="primary" className="w-full text-xs">
                    <Link to="/login">Sign in</Link>
                  </Button>
                </div>
              ) : role !== 'tourist' ? (
                <p className="text-xs text-ink-600">Available to tourist accounts.</p>
              ) : (
                <form onSubmit={handleGeneralLearningRequest} className="space-y-3">
                  {learningNotice ? (
                    <div
                      className={`rounded-xl p-2.5 text-xs ${
                        learningNotice.type === 'success'
                          ? 'bg-forest-50 text-forest-900 border border-forest-200'
                          : 'bg-clay-50 text-clay-900 border border-clay-200'
                      }`}
                    >
                      {learningNotice.text}
                    </div>
                  ) : null}

                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block space-y-1 text-xs">
                      <span className="font-medium text-ink-700">Preferred Date</span>
                      <Input
                        type="date"
                        value={learningDate}
                        onChange={(e) => setLearningDate(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </label>

                    <label className="block space-y-1 text-xs">
                      <span className="font-medium text-ink-700">Learners</span>
                      <Input
                        type="number"
                        min="1"
                        value={learningParticipants}
                        onChange={(e) => setLearningParticipants(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </label>
                  </div>

                  <label className="block space-y-1 text-xs">
                    <span className="font-medium text-ink-700">Message / Topics of Interest</span>
                    <Input
                      type="text"
                      placeholder="e.g. Sohrai wall art basics, natural dyes..."
                      value={learningMessage}
                      onChange={(e) => setLearningMessage(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </label>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={learningSubmitting}
                    className="w-full py-2 text-xs font-semibold"
                  >
                    {learningSubmitting ? 'Sending Request...' : 'Send Learning Request'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Card>
      ) : null}

      {/* Offerings Sections (Only show sections with items) */}
      <div className="space-y-8">
        {/* Products Section */}
        {products.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-ink-100 pb-2">
              <Package className="h-4 w-4 text-clay-700" />
              <h2 className="text-lg font-bold text-ink-900">Artisan Products & Goods ({products.length})</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((item) => (
                <Card
                  key={item.id}
                  className="group flex flex-col overflow-hidden border-ink-200 bg-white p-0 shadow-sm transition hover:-translate-y-1 hover:border-clay-300 hover:shadow-md"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-sand">
                    <img
                      src={item.cover_image || DEFAULT_DESTINATION_IMAGE}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-clay-700">
                      {item.category || 'Product'}
                    </span>
                    <h3 className="font-bold text-base text-ink-900 mt-1">{item.name}</h3>
                    <p className="mt-1 text-xs text-ink-600 line-clamp-2">
                      {item.short_description || item.description}
                    </p>
                    <div className="mt-auto pt-3 border-t border-ink-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-ink-900">
                        {item.price != null ? formatIndianCurrency(item.price) : 'Enquire'}
                      </span>
                      <Button asChild variant="primary" className="px-3 py-1.5 text-xs">
                        <Link to={`/products/${item.id}`}>Buy / Enquire</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        {/* Experiences Section */}
        {experiences.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-ink-100 pb-2">
              <Sparkles className="h-4 w-4 text-clay-700" />
              <h2 className="text-lg font-bold text-ink-900">Workshops & Experiences ({experiences.length})</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {experiences.map((item) => (
                <Card
                  key={item.id}
                  className="group flex flex-col overflow-hidden border-ink-200 bg-white p-0 shadow-sm transition hover:-translate-y-1 hover:border-clay-300 hover:shadow-md"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-sand">
                    <img
                      src={item.cover_image || DEFAULT_DESTINATION_IMAGE}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-clay-700">
                      {item.category || 'Experience'}
                    </span>
                    <h3 className="font-bold text-base text-ink-900 mt-1">{item.name}</h3>
                    <p className="mt-1 text-xs text-ink-600 line-clamp-2">
                      {item.short_description || item.description}
                    </p>
                    <div className="mt-auto pt-3 border-t border-ink-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-ink-900">
                        {item.price != null ? `From ${formatIndianCurrency(item.price)}` : 'Enquire'}
                      </span>
                      <Button asChild variant="primary" className="px-3 py-1.5 text-xs">
                        <Link to={`/experiences/${item.id}`}>Request Experience</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        {/* Stays Section */}
        {stays.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-ink-100 pb-2">
              <Store className="h-4 w-4 text-clay-700" />
              <h2 className="text-lg font-bold text-ink-900">Accommodations & Stays ({stays.length})</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stays.map((item) => (
                <Card
                  key={item.id}
                  className="group flex flex-col overflow-hidden border-ink-200 bg-white p-0 shadow-sm transition hover:-translate-y-1 hover:border-clay-300 hover:shadow-md"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-sand">
                    <img
                      src={item.cover_image || DEFAULT_DESTINATION_IMAGE}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-clay-700">
                      {item.category || 'Stay'}
                    </span>
                    <h3 className="font-bold text-base text-ink-900 mt-1">{item.name}</h3>
                    <p className="mt-1 text-xs text-ink-600 line-clamp-2">
                      {item.short_description || item.description}
                    </p>
                    <div className="mt-auto pt-3 border-t border-ink-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-ink-900">
                        {item.price != null ? `${formatIndianCurrency(item.price)} / night` : 'Enquire'}
                      </span>
                      <Button asChild variant="primary" className="px-3 py-1.5 text-xs">
                        <Link to={`/stays/${item.id}`}>View Stay</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        {/* Tours & Guiding Section */}
        {tours.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-ink-100 pb-2">
              <Compass className="h-4 w-4 text-clay-700" />
              <h2 className="text-lg font-bold text-ink-900">Guided Tours & Itineraries ({tours.length})</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((item) => (
                <Card
                  key={item.id}
                  className="group flex flex-col overflow-hidden border-ink-200 bg-white p-0 shadow-sm transition hover:-translate-y-1 hover:border-clay-300 hover:shadow-md"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-sand">
                    <img
                      src={item.cover_image || DEFAULT_DESTINATION_IMAGE}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-clay-700">
                      {item.category || 'Guided Tour'}
                    </span>
                    <h3 className="font-bold text-base text-ink-900 mt-1">{item.name}</h3>
                    <p className="mt-1 text-xs text-ink-600 line-clamp-2">
                      {item.short_description || item.description}
                    </p>
                    <div className="mt-auto pt-3 border-t border-ink-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-ink-900">
                        {item.price != null ? formatIndianCurrency(item.price) : 'Enquire'}
                      </span>
                      <Button asChild variant="primary" className="px-3 py-1.5 text-xs">
                        <Link to={`/tours/${item.id}`}>Book Tour</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        {/* Transport Services Section */}
        {transports.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-ink-100 pb-2">
              <Package className="h-4 w-4 text-clay-700" />
              <h2 className="text-lg font-bold text-ink-900">Transport & Vehicle Services ({transports.length})</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {transports.map((item) => (
                <Card
                  key={item.id}
                  className="group flex flex-col overflow-hidden border-ink-200 bg-white p-0 shadow-sm transition hover:-translate-y-1 hover:border-clay-300 hover:shadow-md"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-sand">
                    <img
                      src={item.cover_image || DEFAULT_DESTINATION_IMAGE}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-clay-700">
                      {item.category || 'Transport'}
                    </span>
                    <h3 className="font-bold text-base text-ink-900 mt-1">{item.name}</h3>
                    <p className="mt-1 text-xs text-ink-600 line-clamp-2">
                      {item.short_description || item.description}
                    </p>
                    <div className="mt-auto pt-3 border-t border-ink-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-ink-900">
                        {item.price != null ? `${formatIndianCurrency(item.price)}` : 'Enquire'}
                      </span>
                      <Button asChild variant="primary" className="px-3 py-1.5 text-xs">
                        <Link to={`/transport/${item.id}`}>Book Transfer</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        {/* Empty state if provider has 0 offerings published */}
        {totalOfferings === 0 ? (
          <EmptyState
            title="No published items yet"
            message="This provider has not published any products, experiences, stays, tours, or transport services at this time."
            actionLabel="Explore other offerings"
            actionHref="/marketplace"
          />
        ) : null}
      </div>
    </div>
  );
}

function PublicProductPage() {
  return <PublicOfferingPage kind="product" />;
}

function PublicExperiencePage() {
  return <PublicOfferingPage kind="experience" />;
}

function PublicStayPage() {
  return <PublicOfferingPage kind="stay" />;
}

function PublicTourPage() {
  return <PublicOfferingPage kind="tour" />;
}

function PublicTransportPage() {
  return <PublicOfferingPage kind="transport" />;
}

export {
  PublicProviderProfilePage,
  PublicProductPage,
  PublicExperiencePage,
  PublicStayPage,
  PublicTourPage,
  PublicTransportPage,
};
