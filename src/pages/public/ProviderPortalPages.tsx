import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, Package2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Card, Input, Textarea } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { DEFAULT_DESTINATION_IMAGE } from '../../constants/destinations';
import { getProviderCategoryLabel, getProviderOfferingKindLabel } from '../../constants/provider';
import { useAuth } from '../../hooks/useAuth';
import {
  createProviderRequest,
  getPublicProviderOfferingById,
  getPublicProviderOfferingsByProvider,
  getPublicProviderProfile,
} from '../../services/provider/providerMarketplaceService';
import type { ProviderOffering, ProviderOfferingKind } from '../../types/provider';

function formatCurrency(value: number | null, currency = 'INR') {
  if (value == null) {
    return 'Price on request';
  }

  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(value);
}

function PublicRequestForm({
  offering,
  ctaLabel,
  description,
}: {
  offering: ProviderOffering;
  ctaLabel: string;
  description: string;
}) {
  const { user, profile, role } = useAuth();
  const [preferredDate, setPreferredDate] = useState('');
  const [duration, setDuration] = useState('');
  const [participants, setParticipants] = useState('1');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const touristName = profile?.full_name ?? user?.email ?? '';
  const touristEmail = profile?.email ?? user?.email ?? '';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setNotice('Please sign in to submit a request.');
      return;
    }

    try {
      setSaving(true);
      setNotice(null);
      await createProviderRequest({
        providerId: offering.provider_id,
        offeringId: offering.id,
        requestType: offering.kind === 'product' ? 'order' : offering.kind === 'stay' ? 'booking' : 'learning',
        touristName,
        touristEmail,
        preferredDate: preferredDate || null,
        duration: duration || null,
        participants: Number(participants) || 1,
        message: message || description,
      });
      setNotice('Request submitted successfully. The provider will review it soon.');
      setMessage('');
      setDuration('');
      setPreferredDate('');
      setParticipants('1');
    } catch (submitError) {
      setNotice(submitError instanceof Error ? submitError.message : 'Unable to submit request.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Card className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Request action</p>
          <h2 className="text-2xl font-semibold text-ink-900">{ctaLabel}</h2>
          <p className="text-sm leading-6 text-ink-600">{description}</p>
        </div>
        <EmptyState
          title="Login required"
          message="Sign in to submit a learning, booking, or purchase request."
          actionLabel="Login"
          actionHref="/login"
        />
      </Card>
    );
  }

  if (role !== 'tourist') {
    return (
      <Card className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Request action</p>
          <h2 className="text-2xl font-semibold text-ink-900">{ctaLabel}</h2>
          <p className="text-sm leading-6 text-ink-600">{description}</p>
        </div>
        <EmptyState
          title="Tourist account required"
          message="This enquiry form is available to tourist accounts only."
          actionLabel="Explore marketplace"
          actionHref="/marketplace"
        />
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Request action</p>
        <h2 className="text-2xl font-semibold text-ink-900">{ctaLabel}</h2>
        <p className="text-sm leading-6 text-ink-600">{description}</p>
      </div>

      {notice ? <div className="rounded-2xl border border-ink-200 bg-sand px-4 py-3 text-sm text-ink-700">{notice}</div> : null}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink-700">Your name</span>
            <Input value={touristName} readOnly />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink-700">Email</span>
            <Input value={touristEmail} readOnly />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink-700">Preferred date</span>
            <Input type="date" value={preferredDate} onChange={(event) => setPreferredDate(event.target.value)} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink-700">Duration / timing</span>
            <Input value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="2 hours" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink-700">Participants</span>
            <Input type="number" min="1" step="1" value={participants} onChange={(event) => setParticipants(event.target.value)} />
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink-700">Message</span>
          <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder={`Tell the provider what you need...`} />
        </label>

        <Button type="submit" disabled={saving}>
          {saving ? 'Submitting...' : ctaLabel}
        </Button>
      </form>
    </Card>
  );
}

function PublicOfferingPage({
  kind,
}: {
  kind: ProviderOfferingKind;
}) {
  const { offeringId } = useParams<{ offeringId: string }>();
  const [offering, setOffering] = useState<ProviderOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [related, setRelated] = useState<ProviderOffering[]>([]);

  useEffect(() => {
    let alive = true;

    async function loadOffering() {
      if (!offeringId) {
        setError('Missing item id.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const record = await getPublicProviderOfferingById(offeringId);

        if (!alive) {
          return;
        }

        if (!record || record.kind !== kind) {
          setError('This item is not available.');
          setOffering(null);
          return;
        }

        setOffering(record);
        const providerItems = await getPublicProviderOfferingsByProvider(record.provider_id, kind);
        setRelated(providerItems.filter((item) => item.id !== record.id).slice(0, 3));
      } catch (loadError) {
        if (alive) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load this item.');
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
    return <LoadingState label="Loading public details..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load item" message={error} />;
  }

  if (!offering) {
    return <EmptyState title="Not found" message="This public item is unavailable." actionLabel="Explore destinations" actionHref="/explore" />;
  }

  const providerHint = getProviderOfferingKindLabel(kind);
  const image = offering.cover_image || DEFAULT_DESTINATION_IMAGE;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={providerHint}
        title={offering.name}
        description={offering.short_description || offering.description || 'A public provider offering from Jharkhand.'}
        actions={
          <Button asChild variant="secondary">
            <Link to={`/providers/${offering.provider_id}`} className="inline-flex items-center gap-2">
              View provider
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden p-0">
          <img src={image} alt={offering.name} className="h-80 w-full object-cover" />
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{getProviderOfferingKindLabel(offering.kind)}</Badge>
              <Badge variant="success">Published</Badge>
            </div>
            <p className="text-sm leading-6 text-ink-700">{offering.description || offering.short_description || 'No description available.'}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-sand px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Price</p>
                <p className="mt-1 text-sm font-medium text-ink-900">{formatCurrency(offering.price, offering.currency)}</p>
              </div>
              <div className="rounded-2xl bg-sand px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Location</p>
                <p className="mt-1 text-sm font-medium text-ink-900">{offering.district || 'Jharkhand'}</p>
              </div>
            </div>
          </div>
        </Card>

        <PublicRequestForm
          offering={offering}
          ctaLabel={kind === 'product' ? 'Purchase Request' : kind === 'stay' ? 'Request Booking' : 'Learn This Art'}
          description={
            kind === 'product'
              ? 'Send a purchase enquiry to the provider. Payment can be connected later without changing this request flow.'
              : kind === 'stay'
                ? 'Ask the provider for room availability or booking support.'
                : 'Request a learning session or guided cultural experience.'
          }
        />
      </div>

      {related.length ? (
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">More from this provider</p>
              <h2 className="mt-1 text-2xl font-semibold text-ink-900">Related {kind}s</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/${item.kind === 'stay' ? 'stays' : item.kind === 'experience' ? 'experiences' : 'products'}/${item.id}`}
                className="block rounded-2xl border border-ink-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100">
                  <img src={item.cover_image || DEFAULT_DESTINATION_IMAGE} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink-900">{item.name}</p>
                <p className="text-sm text-ink-600">{formatCurrency(item.price, item.currency)}</p>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function PublicProviderProfilePage() {
  const { providerId } = useParams<{ providerId: string }>();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getPublicProviderProfile>> | null>(null);
  const [offerings, setOfferings] = useState<ProviderOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      if (!providerId) {
        setError('Missing provider id.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const providerProfile = await getPublicProviderProfile(providerId);

        if (!alive) {
          return;
        }

        if (!providerProfile) {
          setError('Provider profile not found.');
          setProfile(null);
          return;
        }

        setProfile(providerProfile);
        const [products, experiences, stays] = await Promise.all([
          getPublicProviderOfferingsByProvider(providerId, 'product'),
          getPublicProviderOfferingsByProvider(providerId, 'experience'),
          getPublicProviderOfferingsByProvider(providerId, 'stay'),
        ]);
        setOfferings([...products, ...experiences, ...stays]);
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

    void loadProfile();

    return () => {
      alive = false;
    };
  }, [providerId]);

  const counts = useMemo(
    () => ({
      product: offerings.filter((item) => item.kind === 'product').length,
      experience: offerings.filter((item) => item.kind === 'experience').length,
      stay: offerings.filter((item) => item.kind === 'stay').length,
    }),
    [offerings]
  );

  if (loading) {
    return <LoadingState label="Loading provider profile..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load provider profile" message={error} />;
  }

  if (!profile) {
    return <EmptyState title="Profile not found" message="This provider profile is unavailable." actionLabel="Explore Jharkhand" actionHref="/explore" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Public provider profile"
        title={profile.business_name || profile.full_name || 'Provider'}
        description={profile.description || 'Discover destinations, products, experiences, and stays from this provider.'}
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="overflow-hidden p-0">
          <div className="h-56 bg-gradient-to-br from-clay-200 via-sand to-forest-100" />
          <div className="space-y-4 p-6">
            <div className="-mt-20 flex items-end gap-4">
              <div className="h-28 w-28 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg">
                <img
                  src={profile.avatar_url || DEFAULT_DESTINATION_IMAGE}
                  alt={profile.business_name || profile.full_name || 'Provider'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pb-2">
                <Badge variant="accent">Service provider</Badge>
                <h2 className="mt-2 text-3xl font-semibold text-ink-900">{profile.business_name || profile.full_name}</h2>
                <p className="text-sm text-ink-600">{profile.owner_name || 'Local provider'}</p>
              </div>
            </div>

            <p className="text-sm leading-6 text-ink-700">{profile.description || 'No description provided yet.'}</p>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-sand px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Location</p>
                <p className="mt-1 text-sm font-medium text-ink-900">
                  {profile.district || 'Jharkhand'} {profile.state ? `• ${profile.state}` : ''}
                </p>
              </div>
              <div className="rounded-2xl bg-sand px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Contact</p>
                <p className="mt-1 text-sm font-medium text-ink-900">{profile.phone || 'No contact shared'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.provider_categories?.map((category) => (
                <Badge key={category} variant="neutral">
                  {getProviderCategoryLabel(category)}
                </Badge>
              )) ?? null}
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Portfolio snapshot</p>
              <h2 className="mt-1 text-2xl font-semibold text-ink-900">What this provider offers</h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-sand px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Products</p>
              <p className="mt-2 text-3xl font-bold text-ink-900">{counts.product}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Experiences</p>
              <p className="mt-2 text-3xl font-bold text-ink-900">{counts.experience}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Stays</p>
              <p className="mt-2 text-3xl font-bold text-ink-900">{counts.stay}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-clay-700" />
          <h2 className="text-xl font-semibold text-ink-900">Public offerings</h2>
        </div>

        {offerings.length === 0 ? (
          <EmptyState title="No public offerings yet" message="This provider has not published any products, experiences, or stays yet." actionLabel="Explore destinations" actionHref="/explore" />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {offerings.map((offering) => (
              <Link
                key={offering.id}
                to={`/${offering.kind === 'stay' ? 'stays' : offering.kind === 'experience' ? 'experiences' : 'products'}/${offering.id}`}
                className="block rounded-2xl border border-ink-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100">
                  <img src={offering.cover_image || DEFAULT_DESTINATION_IMAGE} alt={offering.name} className="h-full w-full object-cover" />
                </div>
                <div className="mt-3 space-y-1">
                  <Badge variant="accent">{getProviderOfferingKindLabel(offering.kind)}</Badge>
                  <h3 className="text-lg font-semibold text-ink-900">{offering.name}</h3>
                  <p className="text-sm text-ink-600">{offering.short_description || offering.description || 'No description available.'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
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

export { PublicProviderProfilePage, PublicProductPage, PublicExperiencePage, PublicStayPage };
