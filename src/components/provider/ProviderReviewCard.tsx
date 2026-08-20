import { Badge, Card } from '../ui';
import { DEFAULT_DESTINATION_IMAGE } from '../../constants/destinations';
import type { ReviewWithDestination } from '../../services/reviews/reviewService';

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

export function ProviderReviewCard({ review }: { review: ReviewWithDestination }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-0 sm:grid-cols-[120px_1fr]">
        <div className="bg-ink-100">
          <img
            src={review.destination?.cover_image || DEFAULT_DESTINATION_IMAGE}
            alt={review.destination?.name ?? 'Destination'}
            className="h-full min-h-36 w-full object-cover"
          />
        </div>
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Recent review</p>
              <h3 className="mt-1 text-lg font-semibold text-ink-900">{review.destination?.name ?? 'Destination'}</h3>
              <p className="text-sm text-ink-600">{review.destination?.district ?? 'Jharkhand'}</p>
            </div>
            <Badge variant="accent">{renderStars(review.rating)}</Badge>
          </div>

          <p className="text-sm leading-6 text-ink-700">{review.review_text || 'No review text provided.'}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
            <span>{review.reviewer_name}</span>
            <span>•</span>
            <span>{formatReviewDate(review.created_at)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
