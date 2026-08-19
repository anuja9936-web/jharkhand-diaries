import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ComponentType } from 'react';
import { Badge, Button, Card } from '../../components/ui';
import { ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import {
  DEFAULT_DESTINATION_IMAGE,
  getDestinationCategoryLabel,
  getDestinationStatusLabel,
} from '../../constants/destinations';
import { formatIndianCurrency } from '../../lib/utils';
import { getDestinationBySlug } from '../../services/destinations/destinationService';
import type { Destination } from '../../types/destination';
import { ArrowLeft, CalendarDays, Coins, MapPin, Mountain, Sparkles, Waves } from 'lucide-react';

export function DestinationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Destination details"
        title={destination.name}
        description={destination.short_description || 'Destination details from the Jharkhand tourism database.'}
        actions={
          <Button asChild variant="secondary">
            <Link to="/explore" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Link>
          </Button>
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
          <div className="space-y-5">
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
                  <p className="font-semibold text-ink-900">Phase 1 note</p>
                  <p className="mt-2 text-sm leading-6 text-ink-600">
                    This page shows real data from the destinations table. Maps, AI, vendor workflows, and eco
                    tracking will be added in later phases.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
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
