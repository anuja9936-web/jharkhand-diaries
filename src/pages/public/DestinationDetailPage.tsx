import { useEffect, useMemo, useState, type ComponentType, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Coins, Heart, MapPin, Mountain, MessageSquareText, Sparkles, Trash2, Waves } from 'lucide-react';
import { Badge, Button, Card, Textarea } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { FavouriteButton } from '../../components/destinations/FavouriteButton';
import {
  DEFAULT_DESTINATION_IMAGE,
  getDestinationCategoryLabel,
  getDestinationStatusLabel,
} from '../../constants/destinations';
import { useAuth } from '../../hooks/useAuth';
import { useTouristFavourites } from '../../hooks/useTouristFavourites';
import { formatIndianCurrency } from '../../lib/utils';
import { getDestinationBySlug } from '../../services/destinations/destinationService';
import {
  deleteReview,
  getDestinationReviewSummary,
  saveDestinationReview,
  type DestinationReviewSummary,
} from '../../services/reviews/reviewService';
import type { Destination } from '../../types/destination';

function renderStars(rating: number) {
  return '★★★★★'.slice(0, rating).padEnd(5, '☆');
}

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function RatingBar({
  rating,
  count,
  total,
}: {
  rating: number;
  count: number;
  total: number;
}) {
  const width = total > 0 ? `${Math.round((count / total) * 100)}%` : '0%';

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-10 font-medium text-ink-700">{rating}★</span>
      <div className="h-2 flex-1 rounded-full bg-ink-100">
        <div className="h-2 rounded-full bg-clay-500" style={{ width }} />
      </div>
      <span className="w-10 text-right text-ink-500">{count}</span>
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: DestinationReviewSummary['reviews'][number];
}) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{review.reviewer_name}</h3>
          <p className="text-sm text-ink-600">{formatReviewDate(review.created_at)}</p>
        </div>
        <Badge variant="accent">{renderStars(review.rating)}</Badge>
      </div>

      <p className="text-sm leading-6 text-ink-700">{review.review_text || 'No review text added yet.'}</p>

      {review.reviewer_avatar_url ? (
        <div className="flex items-center gap-3 rounded-2xl bg-sand/70 px-3 py-2 text-xs text-ink-600">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-700">
            <Heart className="h-4 w-4" />
          </span>
          Verified traveller profile available
        </div>
      ) : null}
    </Card>
  );
}

export function DestinationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { role } = useAuth();
  const { isAuthenticated, isTourist, isFavourite, pendingDestinationId, toggleFavourite } = useTouristFavourites();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DestinationReviewSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewDeleting, setReviewDeleting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const destinationId = destination?.id ?? null;
  const myReview = summary?.myReview ?? null;

  useEffect(() => {
    let alive = true;
    console.log('[DETAIL] slug =', slug);

    async function loadDestination() {
      if (!slug) {
        if (alive) {
          setError('Missing destination slug.');
          setIsLoading(false);
        }
        return;
      }

      try {
        console.log('[DETAIL] fetching destination', slug);
        setIsLoading(true);
        setError(null);
        const result = await getDestinationBySlug(slug);

        if (alive) {
          console.log('[DETAIL] destination result', result);
          setDestination(result);
        }
      } catch (loadError) {
        if (alive) {
          console.error('[DETAIL] load error', loadError);
          setError(loadError instanceof Error ? loadError.message : 'Failed to load destination.');
        }
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    }

    loadDestination();

    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    let alive = true;

    async function loadReviews() {
      if (!destinationId) {
        setSummary(null);
        setSummaryLoading(false);
        return;
      }

      try {
        setSummaryLoading(true);
        setSummaryError(null);
        const result = await getDestinationReviewSummary(destinationId);

        if (alive) {
          setSummary(result);
        }
      } catch (loadError) {
        if (alive) {
          setSummaryError(loadError instanceof Error ? loadError.message : 'Unable to load reviews.');
        }
      } finally {
        if (alive) {
          setSummaryLoading(false);
        }
      }
    }

    void loadReviews();

    return () => {
      alive = false;
    };
  }, [destinationId]);

  useEffect(() => {
    if (myReview) {
      setReviewRating(myReview.rating);
      setReviewText(myReview.review_text ?? '');
      return;
    }

    setReviewRating(5);
    setReviewText('');
  }, [myReview]);

  const ratingBreakdown = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: summary?.reviews.filter((review) => review.rating === rating).length ?? 0,
    }));

    return counts;
  }, [summary?.reviews]);

  const handleToggleFavourite = async () => {
    if (!destination) {
      return;
    }

    try {
      await toggleFavourite(destination.id);
    } catch (favoriteError) {
      window.alert(favoriteError instanceof Error ? favoriteError.message : 'Unable to update favourites.');
    }
  };

  const handleSaveReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!destination) {
      return;
    }

    if (!isAuthenticated) {
      setReviewMessage('Please sign in to write a review.');
      return;
    }

    if (!isTourist) {
      setReviewMessage('Only tourist accounts can write reviews.');
      return;
    }

    const trimmedReview = reviewText.trim();

    if (!trimmedReview) {
      setReviewMessage('Please write a short review before submitting.');
      return;
    }

    try {
      setReviewSaving(true);
      setReviewMessage(null);
      await saveDestinationReview({
        destinationId: destination.id,
        rating: reviewRating,
        reviewText: trimmedReview,
      });

      setReviewMessage('Your review has been saved.');
      const refreshed = await getDestinationReviewSummary(destination.id);
      setSummary(refreshed);
    } catch (saveError) {
      setReviewMessage(saveError instanceof Error ? saveError.message : 'Unable to save your review.');
    } finally {
      setReviewSaving(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!summary?.myReview) {
      return;
    }

    const confirmed = window.confirm('Delete your review?');

    if (!confirmed) {
      return;
    }

    try {
      setReviewDeleting(true);
      setReviewMessage(null);
      await deleteReview(summary.myReview.id);
      setReviewMessage('Your review has been deleted.');
      const refreshed = await getDestinationReviewSummary(destination?.id ?? summary.myReview.destination_id);
      setSummary(refreshed);
    } catch (deleteError) {
      setReviewMessage(deleteError instanceof Error ? deleteError.message : 'Unable to delete your review.');
    } finally {
      setReviewDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingState label="Loading destination details..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load destination" message={error} />;
  }

  if (!destination) {
    return (
      <Card className="border-dashed border-ink-300 bg-white/80 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-ink-900">Destination not found</h1>
          <p className="text-sm leading-6 text-ink-600">
            This destination may not exist yet or it may still be in draft status.
          </p>
          <Button asChild variant="secondary">
            <Link to="/explore">Back to Explore</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const coverImage = destination.cover_image || DEFAULT_DESTINATION_IMAGE;
  const totalReviews = summary?.reviews.length ?? 0;
  const averageRating = summary?.averageRating ?? null;
  const favouriteButton = (
    <FavouriteButton
      isFavourite={isFavourite(destination.id)}
      loading={pendingDestinationId === destination.id}
      canSave={isAuthenticated ? isTourist : true}
      onToggle={isAuthenticated && isTourist ? () => void handleToggleFavourite() : undefined}
      compact
      loginHref="/login"
      saveLabel="Save"
      savedLabel="Saved"
      loginLabel="Login to save"
      touristOnlyLabel="Tourist only"
    />
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Destination details"
        title={destination.name}
        description={destination.short_description || 'Destination details from the Jharkhand tourism database.'}
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/explore" className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Explore
              </Link>
            </Button>
            {favouriteButton}
          </div>
        }
      />

      <Card className="overflow-hidden p-0">
        <div className="relative aspect-[16/9] bg-sand">
          <img src={coverImage} alt={destination.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/65 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge variant="accent">{getDestinationCategoryLabel(destination.category)}</Badge>
            <Badge variant={destination.eco_zone ? 'success' : 'neutral'} className="inline-flex items-center gap-1">
              <Waves className="h-3.5 w-3.5" />
              {destination.eco_zone ? 'Eco zone' : 'Standard zone'}
            </Badge>
            <Badge variant="warning">{getDestinationStatusLabel(destination.status)}</Badge>
          </div>
        </div>

        <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-clay-700">Overview</p>
              <p className="mt-3 text-sm leading-7 text-ink-700">
                {destination.description || 'Full destination description will be added from the database.'}
              </p>
            </div>

            {destination.gallery && destination.gallery.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-clay-700">Gallery</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {destination.gallery.slice(0, 4).map((item, index) => (
                    <img
                      key={`${destination.slug}-gallery-${index}`}
                      src={item}
                      alt={`${destination.name} gallery ${index + 1}`}
                      className="h-36 w-full rounded-2xl object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4">
            <InfoRow icon={MapPin} label="District" value={destination.district} />
            <InfoRow icon={CalendarDays} label="Best time" value={destination.best_time || 'Check locally'} />
            <InfoRow icon={Coins} label="Entry fee" value={formatIndianCurrency(destination.entry_fee)} />
            <InfoRow
              icon={Mountain}
              label="Coordinates"
              value={
                destination.latitude != null && destination.longitude != null
                  ? `${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)}`
                  : 'Location data unavailable'
              }
            />

            <Card className="bg-sand">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-clay-700" />
                <div>
                  <p className="font-semibold text-ink-900">About this destination</p>
                  <p className="mt-2 text-sm leading-6 text-ink-600">
                    This page shows real data from the destinations table. Later phases will add maps, AI, vendor
                    workflows, and eco tracking.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink-900">Ratings & Reviews</h2>
              <p className="mt-1 text-sm text-ink-600">Read what travellers have shared about this destination.</p>
            </div>
            <Badge variant="accent">{totalReviews} reviews</Badge>
          </div>

          {summaryLoading ? (
            <LoadingState label="Loading reviews..." />
          ) : summaryError ? (
            <ErrorState title="Unable to load reviews" message={summaryError} />
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="bg-sand">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Average rating</p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="text-4xl font-bold text-ink-900">
                      {averageRating ? averageRating.toFixed(1) : '0.0'}
                    </span>
                    <span className="pb-1 text-sm text-ink-600">/ 5</span>
                  </div>
                  <p className="mt-2 text-sm text-ink-600">{averageRating ? renderStars(Math.round(averageRating)) : 'No ratings yet'}</p>
                </Card>
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Total reviews</p>
                  <p className="mt-3 text-4xl font-bold text-ink-900">{totalReviews}</p>
                  <p className="mt-2 text-sm text-ink-600">Feedback from fellow travellers</p>
                </Card>
              </div>

              {summary && summary.reviews.length > 0 ? (
                <div className="space-y-3">
                  {ratingBreakdown.map((item) => (
                    <RatingBar key={item.rating} rating={item.rating} count={item.count} total={summary.reviews.length} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No reviews yet"
                  message="Be the first to share how this destination felt in real life."
                />
              )}
            </div>
          )}
        </Card>

        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink-900">Write a Review</h2>
              <p className="mt-1 text-sm text-ink-600">Share your own experience with this destination.</p>
            </div>
            {role ? <Badge variant="accent">{role}</Badge> : null}
          </div>

          {reviewMessage ? (
            <div className="rounded-2xl border border-clay-200 bg-sand px-4 py-3 text-sm text-ink-700">{reviewMessage}</div>
          ) : null}

          {!isAuthenticated ? (
            <Card className="border-dashed border-ink-300 bg-white/80">
              <div className="space-y-4">
                <p className="text-sm leading-6 text-ink-600">Login to write a review and save your travel notes.</p>
                <Button asChild>
                  <Link to="/login">Login to write a review</Link>
                </Button>
              </div>
            </Card>
          ) : !isTourist ? (
            <Card className="border-dashed border-ink-300 bg-white/80">
              <p className="text-sm leading-6 text-ink-600">Only tourist accounts can write destination reviews.</p>
            </Card>
          ) : (
            <form className="space-y-4" onSubmit={handleSaveReview}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-ink-700">Rating</span>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewRating(rating)}
                      className={[
                        'rounded-2xl border px-3 py-3 text-sm font-semibold transition',
                        reviewRating === rating
                          ? 'border-clay-400 bg-clay-100 text-ink-900'
                          : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
                      ].join(' ')}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-ink-700">Review text</span>
                <Textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Tell other travellers what stood out to you..."
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={reviewSaving}>
                  <MessageSquareText className="h-4 w-4" />
                  {reviewSaving ? 'Saving...' : summary?.myReview ? 'Update Review' : 'Submit Review'}
                </Button>
                {myReview ? (
                  <Button type="button" variant="danger" onClick={() => void handleDeleteReview()} disabled={reviewDeleting}>
                    <Trash2 className="h-4 w-4" />
                    {reviewDeleting ? 'Deleting...' : 'Delete Review'}
                  </Button>
                ) : null}
              </div>
            </form>
          )}
        </Card>
      </div>

      <Card className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink-900">Traveller reviews</h2>
            <p className="mt-1 text-sm text-ink-600">Recent feedback from the community.</p>
          </div>
          <Badge variant="accent">{totalReviews} total</Badge>
        </div>

        {summary?.reviews.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {summary.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No published reviews yet"
            message="Once people start sharing experiences, the latest comments will appear here."
          />
        )}
      </Card>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="bg-white/90 py-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-sand p-3 text-ink-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">{label}</p>
          <p className="mt-1 text-sm font-medium text-ink-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}
