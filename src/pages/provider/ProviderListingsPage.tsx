import { useEffect, useMemo, useState } from 'react';
import { Plus, Store, CheckCircle2, BarChart3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from '../../components/common/StateBlocks';
import { ProviderListingCard } from '../../components/provider/ProviderListingCard';
import { getMyProviderListings, deleteProviderListing } from '../../services/provider/providerService';
import { getReviewsForDestinationIds, type ReviewWithDestination } from '../../services/reviews/reviewService';
import type { Destination } from '../../types/destination';

export function ProviderListingsPage() {
  const [listings, setListings] = useState<Destination[]>([]);
  const [reviews, setReviews] = useState<ReviewWithDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const providerListings = await getMyProviderListings();
      const providerReviews = await getReviewsForDestinationIds(providerListings.map((listing) => listing.id));
      setListings(providerListings);
      setReviews(providerReviews);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const counts = useMemo(() => {
    return listings.reduce(
      (acc, listing) => {
        const listingReviews = reviews.filter((review) => review.destination_id === listing.id);
        acc.reviewCounts[listing.id] = listingReviews.length;
        acc.averageRatings[listing.id] =
          listingReviews.length > 0
            ? Number((listingReviews.reduce((sum, review) => sum + review.rating, 0) / listingReviews.length).toFixed(1))
            : null;
        return acc;
      },
      { reviewCounts: {} as Record<string, number>, averageRatings: {} as Record<string, number | null> }
    );
  }, [listings, reviews]);

  const handleDelete = async (listing: Destination) => {
    const confirmed = window.confirm(`Delete "${listing.name}"? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setDeletingListingId(listing.id);

    try {
      await deleteProviderListing(listing.id);
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete listing.');
    } finally {
      setDeletingListingId(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading your listings..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load listings" message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My listings"
        title="Manage your tourism portfolio"
        description="Track your listings, publish new experiences, and keep your provider presence current."
        actions={
          <Button asChild>
            <Link to="/provider/listings/new" className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Listing
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total listings" value={String(listings.length)} detail="All records under your account" icon={Store} />
        <StatCard
          label="Published"
          value={String(listings.filter((listing) => listing.status === 'published').length)}
          detail="Visible on the public tourism site"
          icon={CheckCircle2}
        />
        <StatCard label="Reviews received" value={String(reviews.length)} detail="Traveller feedback across listings" icon={Users} />
        <StatCard
          label="Average rating"
          value={
            reviews.length > 0
              ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)).toFixed(1)
              : '0.0'
          }
          detail="Based on published traveller ratings"
          icon={BarChart3}
        />
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title="No listings yet"
          message="Create your first provider listing to start showing up on the tourism platform."
          actionLabel="Add New Listing"
          actionHref="/provider/listings/new"
        />
      ) : (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">All listings</p>
              <h2 className="mt-1 text-2xl font-semibold text-ink-900">{listings.length} managed destinations</h2>
            </div>
            <Button asChild variant="secondary">
              <Link to="/provider/profile">Update profile</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {listings.map((listing) => (
              <ProviderListingCard
                key={listing.id}
                listing={listing}
                reviewCount={counts.reviewCounts[listing.id] ?? 0}
                averageRating={counts.averageRatings[listing.id] ?? null}
                onDelete={handleDelete}
                deleting={deletingListingId === listing.id}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
