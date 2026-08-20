import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, BarChart3, CheckCircle2, Compass, MapPin, Store, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Input, Textarea } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader, PlaceholderPage, StatCard } from '../../components/common/StateBlocks';
import { ProviderListingCard } from '../../components/provider/ProviderListingCard';
import { ProviderReviewCard } from '../../components/provider/ProviderReviewCard';
import { ProviderRequestCard } from '../../components/provider/ProviderRequestCard';
import { getProviderCategoryLabel } from '../../constants/provider';
import { useAuth } from '../../hooks/useAuth';
import {
  getMyProviderOfferings,
  getMyProviderRequests,
  type ProviderRequestWithOffering,
} from '../../services/provider/providerMarketplaceService';
import { getMyProviderListings } from '../../services/provider/providerService';
import { getReviewsForDestinationIds } from '../../services/reviews/reviewService';
import { updateProfile } from '../../services/users/profileService';
import type { Destination } from '../../types/destination';
import type { ProviderOffering } from '../../types/provider';
import type { ReviewWithDestination } from '../../services/reviews/reviewService';

const providerBullets = {
  profile: [
    'Keep your provider identity, contact details, and avatar current.',
    'These profile details are shared with your managed listings and dashboard shell.',
  ],
  verification: [
    'Document review and verification workflows are ready for a future phase.',
    'This route stays in place for trust and compliance tools later.',
  ],
  payments: [
    'Settlement, payouts, and UPI tools will be added later.',
    'No payment logic is active in this release.',
  ],
  analytics: [
    'Performance charts will appear once analytics data is available.',
    'For now, listings and review counts give a quick operational snapshot.',
  ],
};

function getAverageRating(reviews: ReviewWithDestination[]) {
  if (reviews.length === 0) {
    return null;
  }

  return Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1));
}

function getProfileCompletion(profile: ReturnType<typeof useAuth>['profile']) {
  const fields = [
    profile?.business_name,
    profile?.owner_name,
    profile?.description,
    profile?.phone,
    profile?.avatar_url,
    profile?.cover_image_url,
    profile?.address,
    profile?.district,
    profile?.state,
    profile?.website_url,
    profile?.provider_categories?.length ? 'filled' : null,
  ];
  const filled = fields.filter((value) => Boolean(value && String(value).trim())).length;
  return Math.round((filled / fields.length) * 100);
}

function RecentListingCard({
  listing,
  reviewCount,
  averageRating,
  onDelete,
  deleting,
}: {
  listing: Destination;
  reviewCount: number;
  averageRating: number | null;
  onDelete: (listing: Destination) => void;
  deleting: boolean;
}) {
  return (
    <ProviderListingCard
      listing={listing}
      reviewCount={reviewCount}
      averageRating={averageRating}
      onDelete={onDelete}
      deleting={deleting}
    />
  );
}

export function ProviderDashboardPage() {
  const { profile, user } = useAuth();
  const [listings, setListings] = useState<Destination[]>([]);
  const [offerings, setOfferings] = useState<ProviderOffering[]>([]);
  const [requests, setRequests] = useState<ProviderRequestWithOffering[]>([]);
  const [reviews, setReviews] = useState<ReviewWithDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [listingResult, productResult, experienceResult, stayResult, requestResult] = await Promise.allSettled([
        getMyProviderListings(),
        getMyProviderOfferings('product'),
        getMyProviderOfferings('experience'),
        getMyProviderOfferings('stay'),
        getMyProviderRequests(),
      ]);

      const nextWarnings: string[] = [];

      if (listingResult.status === 'fulfilled') {
        setListings(listingResult.value);
      } else {
        setListings([]);
        nextWarnings.push('Your destination listings could not be loaded right now.');
      }

      const flattenedOfferings = [
        productResult.status === 'fulfilled' ? productResult.value : [],
        experienceResult.status === 'fulfilled' ? experienceResult.value : [],
        stayResult.status === 'fulfilled' ? stayResult.value : [],
      ].flat();
      setOfferings(flattenedOfferings);

      if (requestResult.status === 'fulfilled') {
        setRequests(requestResult.value);
      } else {
        setRequests([]);
        nextWarnings.push('Learning, booking, or purchase requests are not available yet.');
      }

      if (listingResult.status === 'fulfilled' && listingResult.value.length > 0) {
        try {
          const reviewRows = await getReviewsForDestinationIds(listingResult.value.map((listing) => listing.id));
          setReviews(reviewRows);
        } catch {
          setReviews([]);
          nextWarnings.push('Traveller reviews could not be loaded right now.');
        }
      } else {
        setReviews([]);
      }

      if (productResult.status === 'rejected' || experienceResult.status === 'rejected' || stayResult.status === 'rejected') {
        nextWarnings.push('Product, experience, or stay management is not available in the current database yet.');
      }

      setWarnings(nextWarnings);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load provider dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const totalsByKind = useMemo(
    () => ({
      product: offerings.filter((item) => item.kind === 'product').length,
      experience: offerings.filter((item) => item.kind === 'experience').length,
      stay: offerings.filter((item) => item.kind === 'stay').length,
    }),
    [offerings]
  );

  const totalListings = listings.length;
  const publishedListings = listings.filter((listing) => listing.status === 'published').length;
  const totalReviews = reviews.length;
  const averageRating = getAverageRating(reviews);
  const profileCompletion = getProfileCompletion(profile);
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((request) => request.status === 'pending').length;
  const providerCategories = profile?.provider_categories?.length
    ? profile.provider_categories.map((category) => getProviderCategoryLabel(category))
    : ['Destination owner', 'guide', 'artisan', 'stay host'];
  const categorySummary = providerCategories.join(' • ');

  const reviewStatsByListing = useMemo(() => {
    return listings.reduce(
      (acc, listing) => {
        const listingReviews = reviews.filter((review) => review.destination_id === listing.id);
        acc.counts[listing.id] = listingReviews.length;
        acc.averages[listing.id] =
          listingReviews.length > 0
            ? Number((listingReviews.reduce((sum, review) => sum + review.rating, 0) / listingReviews.length).toFixed(1))
            : null;
        return acc;
      },
      { counts: {} as Record<string, number>, averages: {} as Record<string, number | null> }
    );
  }, [listings, reviews]);

  const handleDeleteListing = async (listing: Destination) => {
    const confirmed = window.confirm(`Delete ${listing.name}? This will remove the listing from your dashboard.`);

    if (!confirmed) {
      return;
    }

    setDeletingListingId(listing.id);

    try {
      const { deleteProviderListing } = await import('../../services/provider/providerService');
      await deleteProviderListing(listing.id);
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete listing.');
    } finally {
      setDeletingListingId(null);
    }
  };

  const topListings = listings.slice(0, 3);
  const recentReviews = reviews.slice(0, 4);
  const recentRequests = requests.slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Provider workspace"
          title="Loading your provider dashboard"
          description="Pulling your listings, requests, products, and reviews together..."
        />
        <LoadingState label="Loading provider data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Provider workspace"
          title="Service provider dashboard"
          description="Manage your tourism business, experiences, products, and stays."
          actions={
            <Button asChild>
              <Link to="/provider/listings/new">Add New Listing</Link>
            </Button>
          }
        />
        <ErrorState title="Unable to load provider dashboard" message={error} />
      </div>
    );
  }

  const providerName = profile?.business_name ?? profile?.full_name ?? user?.email ?? 'Provider';

  return (
    <div className="space-y-6">
      {warnings.length ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-950">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Workspace notice</p>
            <p className="text-sm leading-6">
              Some provider portal sections are waiting on the remote database schema. Listings remain available, and the rest of the dashboard stays usable.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-amber-900">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-hidden rounded-3xl border border-ink-200 bg-white/95 p-5 shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">Service provider portal</Badge>
              <Badge variant="neutral">Profile synced</Badge>
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">Welcome back, {providerName}</h1>
              <p className="max-w-2xl text-sm leading-6 text-ink-600 md:text-base">
                Manage your tourism services, products, stays, and experiences from one organised workspace.
              </p>
              <p className="text-sm font-medium text-clay-700">{categorySummary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {providerCategories.slice(0, 4).map((category) => (
                <Badge key={category} variant="accent">
                  {category}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/provider/products/new">Add Product</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/provider/experiences/new">Add Experience</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/provider/stays/new">Add Stay</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/provider/profile">Edit Profile</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to={'/providers/' + (user?.id ?? profile?.id ?? '')}>View Public Profile</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-3xl border border-ink-200 bg-sand/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-clay-700">Profile completion</p>
              <p className="mt-3 text-3xl font-bold text-ink-900">{profileCompletion}%</p>
              <p className="mt-1 text-sm text-ink-600">Keep your business profile ready for travellers.</p>
            </div>
            <div className="rounded-3xl border border-ink-200 bg-sand/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-clay-700">Requests awaiting action</p>
              <p className="mt-3 text-3xl font-bold text-ink-900">{pendingRequests}</p>
              <p className="mt-1 text-sm text-ink-600">Learning, booking, and purchase enquiries.</p>
            </div>
            <div className="rounded-3xl border border-ink-200 bg-sand/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-clay-700">Reviews</p>
              <p className="mt-3 text-3xl font-bold text-ink-900">{averageRating != null ? averageRating.toFixed(1) : '0.0'}</p>
              <p className="mt-1 text-sm text-ink-600">
                {totalReviews > 0 ? `${totalReviews} traveller reviews` : 'Traveller reviews will appear here.'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total listings" value={String(totalListings)} detail="Destination records under your account" icon={Store} />
        <StatCard label="Published listings" value={String(publishedListings)} detail="Visible on the public tourism site" icon={CheckCircle2} />
        <StatCard label="Products" value={String(totalsByKind.product)} detail="Artisan goods and local products" icon={Compass} />
        <StatCard label="Experiences" value={String(totalsByKind.experience)} detail="Workshops, tours, and activities" icon={MapPin} />
        <StatCard label="Stays" value={String(totalsByKind.stay)} detail="Hotels, homestays, and guesthouses" icon={Users} />
        <StatCard label="Requests" value={String(totalRequests)} detail="Learning, booking, and purchase enquiries" icon={BarChart3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Quick actions</p>
              <h2 className="mt-1 text-2xl font-semibold text-ink-900">Build your provider portal</h2>
            </div>
            <Button asChild>
              <Link to="/provider/listings/new" className="inline-flex items-center gap-2">
                <Compass className="h-4 w-4" />
                Add Destination
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Button asChild variant="secondary">
              <Link to="/provider/products/new">Add Product</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/provider/experiences/new">Add Experience</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/provider/stays/new">Add Stay</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/provider/requests">View Requests</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/provider/reviews">View Reviews</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/provider/profile">Edit Profile</Link>
            </Button>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Profile snapshot</p>
              <h2 className="mt-1 text-2xl font-semibold text-ink-900">Identity at a glance</h2>
            </div>
            <Badge variant="accent">{profileCompletion}% complete</Badge>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Business name</p>
              <p className="mt-1 text-sm font-medium text-ink-900">{profile?.business_name ?? profile?.full_name ?? 'Not set yet'}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Owner</p>
              <p className="mt-1 text-sm font-medium text-ink-900">{profile?.owner_name ?? profile?.full_name ?? 'Not set yet'}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">District</p>
              <p className="mt-1 text-sm font-medium text-ink-900">{profile?.district ?? 'Not set yet'}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Categories</p>
              <p className="mt-1 text-sm font-medium text-ink-900">
                {profile?.provider_categories?.length ? profile.provider_categories.map((category) => getProviderCategoryLabel(category)).join(', ') : 'Not set yet'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Destination listings</p>
              <h2 className="mt-1 text-2xl font-semibold text-ink-900">Your managed destinations</h2>
            </div>
            {listings.length > 3 ? (
              <Button asChild variant="secondary">
                <Link to="/provider/listings">View all listings</Link>
              </Button>
            ) : null}
          </div>

          {topListings.length === 0 ? (
            <EmptyState
              title="No destinations yet"
              message="Add your first destination listing to start building your public tourism presence."
              actionLabel="Add New Listing"
              actionHref="/provider/listings/new"
            />
          ) : (
            <div className="space-y-4">
              {topListings.map((listing) => (
                <RecentListingCard
                  key={listing.id}
                  listing={listing}
                  reviewCount={reviewStatsByListing.counts[listing.id] ?? 0}
                  averageRating={reviewStatsByListing.averages[listing.id] ?? null}
                  onDelete={handleDeleteListing}
                  deleting={deletingListingId === listing.id}
                />
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Business offerings</p>
                <h2 className="mt-1 text-2xl font-semibold text-ink-900">Products, experiences, and stays</h2>
              </div>
              <Badge variant="accent">{offerings.length} active</Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-sand px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Products</p>
                <p className="mt-2 text-3xl font-bold text-ink-900">{totalsByKind.product}</p>
                <Button asChild variant="secondary" className="mt-4 w-full">
                  <Link to="/provider/products">Manage</Link>
                </Button>
              </div>
              <div className="rounded-2xl bg-sand px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Experiences</p>
                <p className="mt-2 text-3xl font-bold text-ink-900">{totalsByKind.experience}</p>
                <Button asChild variant="secondary" className="mt-4 w-full">
                  <Link to="/provider/experiences">Manage</Link>
                </Button>
              </div>
              <div className="rounded-2xl bg-sand px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Stays</p>
                <p className="mt-2 text-3xl font-bold text-ink-900">{totalsByKind.stay}</p>
                <Button asChild variant="secondary" className="mt-4 w-full">
                  <Link to="/provider/stays">Manage</Link>
                </Button>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Learning and booking requests</p>
                <h2 className="mt-1 text-2xl font-semibold text-ink-900">What travellers are asking for</h2>
              </div>
              <Badge variant="accent">{requests.length} total</Badge>
            </div>

            {recentRequests.length === 0 ? (
              <EmptyState
                title="No requests yet"
                message="Learning, booking, and purchase requests will appear here once tourists start reaching out."
                actionLabel="View requests"
                actionHref="/provider/requests"
              />
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <ProviderRequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Recent reviews</p>
              <h2 className="mt-1 text-2xl font-semibold text-ink-900">What travellers are saying</h2>
            </div>
            <Badge variant="accent">{recentReviews.length} recent</Badge>
          </div>

          {recentReviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              message="Traveller feedback will appear here once your destinations start attracting visitors."
              actionLabel="Open reviews"
              actionHref="/provider/reviews"
            />
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <ProviderReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </Card>

        <Card className="flex flex-col items-start justify-between gap-4 bg-ink-900 text-white md:flex-row md:items-center">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Next step</p>
            <h2 className="text-2xl font-semibold">Discover how your listings appear publicly</h2>
            <p className="max-w-2xl text-sm leading-6 text-white/75">
              Keep your provider presence updated so travellers always see polished, accurate, and trusted information.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link to="/explore" className="inline-flex items-center gap-2">
              Explore Jharkhand
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}

export function ProviderProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [businessName, setBusinessName] = useState(profile?.business_name ?? profile?.full_name ?? '');
  const [ownerName, setOwnerName] = useState(profile?.owner_name ?? '');
  const [description, setDescription] = useState(profile?.description ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [district, setDistrict] = useState(profile?.district ?? '');
  const [stateName, setStateName] = useState(profile?.state ?? 'Jharkhand');
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(profile?.cover_image_url ?? '');
  const [categoryText, setCategoryText] = useState((profile?.provider_categories ?? []).join(', '));
  const [socialLinksText, setSocialLinksText] = useState(
    profile?.social_links ? JSON.stringify(profile.social_links, null, 2) : '{\n  "instagram": "",\n  "facebook": ""\n}'
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setBusinessName(profile?.business_name ?? profile?.full_name ?? '');
    setOwnerName(profile?.owner_name ?? '');
    setDescription(profile?.description ?? '');
    setPhone(profile?.phone ?? '');
    setAddress(profile?.address ?? '');
    setDistrict(profile?.district ?? '');
    setStateName(profile?.state ?? 'Jharkhand');
    setWebsiteUrl(profile?.website_url ?? '');
    setAvatarUrl(profile?.avatar_url ?? '');
    setCoverImageUrl(profile?.cover_image_url ?? '');
    setCategoryText((profile?.provider_categories ?? []).join(', '));
    setSocialLinksText(profile?.social_links ? JSON.stringify(profile.social_links, null, 2) : '{\n  "instagram": "",\n  "facebook": ""\n}');
  }, [
    profile?.business_name,
    profile?.full_name,
    profile?.owner_name,
    profile?.description,
    profile?.phone,
    profile?.address,
    profile?.district,
    profile?.state,
    profile?.website_url,
    profile?.avatar_url,
    profile?.cover_image_url,
    profile?.provider_categories,
    profile?.social_links,
  ]);

  const categories = categoryText
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setMessage('Please sign in again to update your profile.');
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      let socialLinks: Record<string, string> | null = null;

      if (socialLinksText.trim()) {
        try {
          const parsed = JSON.parse(socialLinksText);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            socialLinks = Object.fromEntries(
              Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [key, typeof value === 'string' ? value : String(value ?? '')])
            );
          }
        } catch {
          setMessage('Social links must be valid JSON.');
          setSaving(false);
          return;
        }
      }

      await updateProfile(user.id, {
        full_name: businessName.trim(),
        business_name: businessName.trim() || null,
        owner_name: ownerName.trim() || null,
        description: description.trim() || null,
        phone: phone.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        cover_image_url: coverImageUrl.trim() || null,
        address: address.trim() || null,
        district: district.trim() || null,
        state: stateName.trim() || null,
        website_url: websiteUrl.trim() || null,
        provider_categories: categories,
        social_links: socialLinks,
      });
      await refreshProfile();
      setMessage('Profile updated successfully.');
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Provider profile"
        title="Business identity and contact details"
        description="Keep your provider profile clean so travellers and administrators see accurate information."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Profile editing</p>
              <h2 className="mt-1 text-2xl font-semibold text-ink-900">Update your public identity</h2>
            </div>
            <Badge variant="accent">{profile?.role ?? 'provider'}</Badge>
          </div>

          {message ? <div className="rounded-2xl border border-ink-200 bg-sand px-4 py-3 text-sm text-ink-700">{message}</div> : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Business / display name</span>
              <Input
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="Jharkhand Homestays"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Owner name</span>
              <Input
                value={ownerName}
                onChange={(event) => setOwnerName(event.target.value)}
                placeholder="Anuja Kumari"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Description</span>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tell travellers what makes your business special."
                className="min-h-28"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Contact phone</span>
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91 9XXXXXXXXX"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Email</span>
              <Input value={profile?.email ?? user?.email ?? ''} readOnly />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Address</span>
              <Input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Village, market, or property address" />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">District</span>
              <Input value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="Ranchi" />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">State</span>
              <Input value={stateName} onChange={(event) => setStateName(event.target.value)} placeholder="Jharkhand" />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Website / social website</span>
              <Input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://..." />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Avatar / logo URL</span>
              <Input
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Cover image URL</span>
              <Input
                value={coverImageUrl}
                onChange={(event) => setCoverImageUrl(event.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Provider categories</span>
              <Input
                value={categoryText}
                onChange={(event) => setCategoryText(event.target.value)}
                placeholder="Destination, Guide, Artisan"
              />
              <p className="text-xs text-ink-500">Separate multiple categories with commas.</p>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Social links JSON</span>
              <Textarea
                value={socialLinksText}
                onChange={(event) => setSocialLinksText(event.target.value)}
                placeholder='{\n  "instagram": "https://instagram.com/...",\n  "facebook": "https://facebook.com/..."\n}'
                className="min-h-32 font-mono text-xs"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button asChild variant="secondary">
                <Link to="/provider/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </form>
        </Card>

        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Profile snapshot</p>
          <div className="grid gap-3">
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Business name</p>
              <p className="mt-1 text-sm font-medium text-ink-900">{profile?.business_name || profile?.full_name || 'Not set'}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Owner</p>
              <p className="mt-1 text-sm font-medium text-ink-900">{profile?.owner_name || 'Not set'}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Email</p>
              <p className="mt-1 text-sm font-medium text-ink-900">{profile?.email ?? user?.email ?? 'No email available'}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">District</p>
              <p className="mt-1 text-sm font-medium text-ink-900">{profile?.district || 'Not set'}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Categories</p>
              <p className="mt-1 text-sm font-medium text-ink-900">
                {profile?.provider_categories?.length
                  ? profile.provider_categories.map((category) => getProviderCategoryLabel(category)).join(', ')
                  : 'Not set'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-ink-300 bg-white/70 p-4 text-sm leading-6 text-ink-600">
            Keep this information accurate so travellers and future moderation tools can trust your account identity.
          </div>

          <div className="space-y-3 rounded-2xl border border-ink-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Profile checklist</p>
            <ul className="space-y-2 text-sm leading-6 text-ink-700">
              {providerBullets.profile.map((bullet) => (
                <li key={bullet} className="rounded-xl bg-sand px-3 py-2">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function ProviderVerificationPage() {
  return (
    <PlaceholderPage
      eyebrow="Provider verification"
      title="Verification workflow"
      description="Document review and trust verification will be added in a later phase."
      bullets={providerBullets.verification}
    />
  );
}

export function ProviderPaymentsPage() {
  return (
    <PlaceholderPage
      eyebrow="Provider payments"
      title="Payments and settlements"
      description="UPI, settlement, and payout tooling will be introduced later."
      bullets={providerBullets.payments}
    />
  );
}

export function ProviderAnalyticsPage() {
  return (
    <PlaceholderPage
      eyebrow="Provider analytics"
      title="Provider analytics"
      description="Operational charts and conversion tracking will appear here in a later phase."
      bullets={providerBullets.analytics}
    />
  );
}

export function ProviderReviewsPage() {
  const [listings, setListings] = useState<Destination[]>([]);
  const [reviews, setReviews] = useState<ReviewWithDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const providerListings = await getMyProviderListings();
        const reviewRows = await getReviewsForDestinationIds(providerListings.map((listing) => listing.id));

        if (!alive) {
          return;
        }

        setListings(providerListings);
        setReviews(reviewRows);
      } catch (loadError) {
        if (alive) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load reviews.');
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    void loadReviews();

    return () => {
      alive = false;
    };
  }, []);

  const averageRating = getAverageRating(reviews);

  if (loading) {
    return <LoadingState label="Loading provider reviews..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load reviews" message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Provider reviews"
        title="Traveller feedback across your destinations"
        description="Read what visitors are saying about your destinations and local experiences."
        actions={
          <Button asChild variant="secondary">
            <Link to="/provider/dashboard">Back to Dashboard</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Review count" value={String(reviews.length)} detail="Feedback across managed listings" icon={Users} />
        <StatCard label="Average rating" value={averageRating ? averageRating.toFixed(1) : '0.0'} detail="Traveller sentiment" icon={BarChart3} />
        <StatCard label="Managed destinations" value={String(listings.length)} detail="Public listings under your account" icon={Store} />
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          message="Once travellers start leaving feedback, you’ll see it here."
          actionLabel="Open listings"
          actionHref="/provider/listings"
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ProviderReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
