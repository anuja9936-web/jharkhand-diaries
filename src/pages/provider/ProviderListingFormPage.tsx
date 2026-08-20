import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Image, Save, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card, Input, Select, Textarea } from '../../components/ui';
import { ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { DESTINATION_CATEGORY_OPTIONS, DESTINATION_STATUS_VALUES, getDestinationCategoryLabel } from '../../constants/destinations';
import type { Destination, DestinationCategory, DestinationStatus } from '../../types/destination';
import {
  createProviderListing,
  getProviderListingById,
  updateProviderListing,
} from '../../services/provider/providerService';

import { ProviderAIWriterModal } from '../../components/ai/ProviderAIWriterModal';

interface ListingFormState {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  district: string;
  category: DestinationCategory;
  latitude: string;
  longitude: string;
  cover_image: string;
  galleryText: string;
  eco_zone: boolean;
  best_time: string;
  entry_fee: string;
  status: DestinationStatus;
}

const initialForm: ListingFormState = {
  name: '',
  slug: '',
  short_description: '',
  description: '',
  district: '',
  category: 'eco',
  latitude: '',
  longitude: '',
  cover_image: '',
  galleryText: '',
  eco_zone: false,
  best_time: '',
  entry_fee: '',
  status: 'draft',
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseGalleryText(value: string) {
  return value
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumberOrNull(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function serializeListing(destination: Destination): ListingFormState {
  return {
    name: destination.name,
    slug: destination.slug,
    short_description: destination.short_description ?? '',
    description: destination.description ?? '',
    district: destination.district,
    category: destination.category,
    latitude: destination.latitude?.toString() ?? '',
    longitude: destination.longitude?.toString() ?? '',
    cover_image: destination.cover_image ?? '',
    galleryText: (destination.gallery ?? []).join('\n'),
    eco_zone: destination.eco_zone,
    best_time: destination.best_time ?? '',
    entry_fee: destination.entry_fee?.toString() ?? '',
    status: destination.status,
  };
}

export function ProviderListingFormPage() {
  const { listingId } = useParams<{ listingId?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(listingId);
  const [form, setForm] = useState<ListingFormState>(initialForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<Destination | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadListing() {
      if (!listingId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const record = await getProviderListingById(listingId);

        if (!alive) {
          return;
        }

        if (!record) {
          setError('Listing not found.');
          setListing(null);
          return;
        }

        setListing(record);
        setForm(serializeListing(record));
      } catch (loadError) {
        if (alive) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load listing.');
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadListing();

    return () => {
      alive = false;
    };
  }, [listingId]);

  const previewImage = form.cover_image.trim();
  const previewTitle = form.name.trim() || 'Listing preview';
  const previewDescription = form.short_description.trim() || form.description.trim() || 'Your listing summary will appear here.';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const latitude = toNumberOrNull(form.latitude);
    const longitude = toNumberOrNull(form.longitude);
    const entryFee = toNumberOrNull(form.entry_fee);

    if (Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(entryFee)) {
      setSaving(false);
      setError('Latitude, longitude, and entry fee must be valid numbers.');
      return;
    }

    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        short_description: form.short_description || null,
        description: form.description || null,
        district: form.district,
        category: form.category,
        latitude,
        longitude,
        cover_image: form.cover_image || null,
        gallery: parseGalleryText(form.galleryText),
        eco_zone: form.eco_zone,
        best_time: form.best_time || null,
        entry_fee: entryFee,
        status: form.status,
      };

      const saved = listing ? await updateProviderListing(listing.id, payload) : await createProviderListing(payload);
      navigate(`/provider/listings/${saved.id}`, { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save listing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label={isEditMode ? 'Loading listing...' : 'Preparing listing form...'} />;
  }

  if (error && isEditMode && !listing) {
    return <ErrorState title="Unable to load listing" message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isEditMode ? 'Edit listing' : 'Add listing'}
        title={isEditMode ? 'Update your destination listing' : 'Create a new provider listing'}
        description="Keep the details accurate so travellers always see a polished public experience."
        actions={
          <Button asChild variant="secondary">
            <Link to="/provider/listings" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Listings
            </Link>
          </Button>
        }
      />

      {error && !isEditMode ? <ErrorState title="Unable to save listing" message={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">
                {isEditMode ? 'Edit listing' : 'New listing'}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-ink-900">
                {isEditMode ? 'Refine destination details' : 'Create a tourism entry'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <ProviderAIWriterModal
                kind="experience"
                currentTitle={form.name}
                district={form.district || 'Ranchi'}
                onApply={({ title, shortDescription, description }) => {
                  setForm((cur) => ({
                    ...cur,
                    name: title,
                    short_description: shortDescription,
                    description: description,
                  }));
                }}
              />
              <Badge variant="accent">{form.status === 'published' ? 'Published ready' : 'Draft mode'}</Badge>
            </div>
          </div>

          <form className="grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
            <label className="block space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-ink-700">Name</span>
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Hundru Falls"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Slug</span>
              <Input
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                placeholder="hundru-falls"
              />
              <p className="text-xs text-ink-500">Leave blank to auto-generate from the name.</p>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">District</span>
              <Input
                value={form.district}
                onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))}
                placeholder="Ranchi"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Category</span>
              <Select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as DestinationCategory,
                  }))
                }
              >
                {DESTINATION_CATEGORY_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Status</span>
              <Select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as DestinationStatus,
                  }))
                }
              >
                {DESTINATION_STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {status === 'draft' ? 'Draft' : 'Published'}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Entry fee</span>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.entry_fee}
                onChange={(event) => setForm((current) => ({ ...current, entry_fee: event.target.value }))}
                placeholder="0"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Latitude</span>
              <Input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))}
                placeholder="23.3174"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Longitude</span>
              <Input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))}
                placeholder="85.5297"
              />
            </label>

            <label className="block space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-ink-700">Short description</span>
              <Textarea
                value={form.short_description}
                onChange={(event) => setForm((current) => ({ ...current, short_description: event.target.value }))}
                placeholder="One-line summary shown on cards and preview panels."
                className="min-h-32"
              />
            </label>

            <label className="block space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-ink-700">Description</span>
              <Textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Full destination description for travellers."
              />
            </label>

            <label className="block space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-ink-700">Cover image URL</span>
              <Input
                value={form.cover_image}
                onChange={(event) => setForm((current) => ({ ...current, cover_image: event.target.value }))}
                placeholder="https://..."
              />
            </label>

            <label className="block space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-ink-700">Gallery image URLs</span>
              <Textarea
                value={form.galleryText}
                onChange={(event) => setForm((current) => ({ ...current, galleryText: event.target.value }))}
                placeholder="Paste one URL per line or comma-separated."
                className="min-h-28"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white px-4 py-4 lg:col-span-2">
              <input
                type="checkbox"
                checked={form.eco_zone}
                onChange={(event) => setForm((current) => ({ ...current, eco_zone: event.target.checked }))}
                className="h-4 w-4 rounded border-ink-300 text-clay-600 focus:ring-clay-400"
              />
              <span className="text-sm font-medium text-ink-700">Mark this listing as an eco-zone destination</span>
            </label>

            <label className="block space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-ink-700">Best time to visit</span>
              <Input
                value={form.best_time}
                onChange={(event) => setForm((current) => ({ ...current, best_time: event.target.value }))}
                placeholder="October to March"
              />
            </label>

            <div className="flex flex-wrap gap-3 lg:col-span-2">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : isEditMode ? 'Update Listing' : 'Create Listing'}
              </Button>
              <Button asChild variant="secondary">
                <Link to={isEditMode && listing ? `/provider/listings/${listing.id}` : '/provider/listings'}>Cancel</Link>
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="bg-sand p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Live preview</p>
              <h3 className="mt-1 text-xl font-semibold text-ink-900">{previewTitle}</h3>
            </div>
            <div className="space-y-4 p-5">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100">
                <img
                  src={previewImage || 'https://placehold.co/1200x800/png?text=Listing+Preview'}
                  alt={previewTitle}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <Badge variant="accent">{getDestinationCategoryLabel(form.category)}</Badge>
                <p className="text-sm leading-6 text-ink-600">{previewDescription}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-sand px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">District</p>
                  <p className="mt-1 text-sm font-medium text-ink-900">{form.district || 'Not set'}</p>
                </div>
                <div className="rounded-2xl bg-sand px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Entry fee</p>
                  <p className="mt-1 text-sm font-medium text-ink-900">
                    {form.entry_fee ? `₹${form.entry_fee}` : 'Free / check locally'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sand p-3 text-ink-700">
                <Image className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Tips</p>
                <h3 className="text-lg font-semibold text-ink-900">Provider listing checklist</h3>
              </div>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-ink-700">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-forest-600" />
                Keep titles and descriptions accurate for travellers.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-forest-600" />
                Use a real cover image URL to improve presentation quality.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-forest-600" />
                Publish when you are ready to make the listing visible publicly.
              </li>
            </ul>
            <Button asChild variant="secondary">
              <Link to="/provider/listings" className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Back to listings
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
