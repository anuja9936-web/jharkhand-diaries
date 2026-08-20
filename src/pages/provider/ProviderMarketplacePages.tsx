import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Edit3, Plus, Save, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card, Input, Select, Textarea } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from '../../components/common/StateBlocks';
import { ProviderOfferingCard } from '../../components/provider/ProviderOfferingCard';
import { ProviderRequestCard } from '../../components/provider/ProviderRequestCard';
import { ProviderAIWriterModal } from '../../components/ai/ProviderAIWriterModal';
import { PROVIDER_CATEGORY_OPTIONS, getProviderOfferingKindLabel } from '../../constants/provider';
import { DEFAULT_DESTINATION_IMAGE } from '../../constants/destinations';
import { formatIndianCurrency } from '../../lib/utils';
import {
  createProviderOffering,
  deleteProviderOffering,
  getMyProviderOfferings,
  getMyProviderRequests,
  getProviderOfferingById,
  updateProviderOffering,
  updateProviderRequestStatus,
  type ProviderOfferingInput,
  type ProviderRequestWithOffering,
} from '../../services/provider/providerMarketplaceService';
import type { ProviderOffering, ProviderOfferingKind, ProviderOfferingStatus, ProviderRequestStatus } from '../../types/provider';

interface MarketplaceConfig {
  kind: ProviderOfferingKind;
  title: string;
  singular: string;
  description: string;
  createLabel: string;
  routeSegment: 'products' | 'experiences' | 'stays' | 'tours' | 'transport';
}

const MARKETPLACE_CONFIG: Record<ProviderOfferingKind, MarketplaceConfig> = {
  product: {
    kind: 'product',
    title: 'Products',
    singular: 'Product',
    description: 'Manage artisan goods, handicrafts, and local products that travellers can discover and request.',
    createLabel: 'Add Product',
    routeSegment: 'products',
  },
  experience: {
    kind: 'experience',
    title: 'Experiences',
    singular: 'Experience',
    description: 'Create cultural workshops, village tours, food experiences, and other bookable local activities.',
    createLabel: 'Add Experience',
    routeSegment: 'experiences',
  },
  stay: {
    kind: 'stay',
    title: 'Stays',
    singular: 'Stay',
    description: 'Manage hotels, homestays, guesthouses, and other accommodation options.',
    createLabel: 'Add Stay',
    routeSegment: 'stays',
  },
  tour: {
    kind: 'tour',
    title: 'Tours & Guides',
    singular: 'Tour',
    description: 'Manage guided itineraries, nature trails, and heritage walks.',
    createLabel: 'Add Tour',
    routeSegment: 'tours',
  },
  transport: {
    kind: 'transport',
    title: 'Transport Services',
    singular: 'Transport',
    description: 'Manage vehicle rentals, airport transfers, and tourist cab services.',
    createLabel: 'Add Vehicle',
    routeSegment: 'transport',
  },
};

const PROVIDER_STATUS_OPTIONS: ProviderOfferingStatus[] = ['draft', 'published', 'archived'];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitList(value: string) {
  return value
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function jsonMaybeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function jsonMaybeNumber(value: unknown) {
  return typeof value === 'number' ? String(value) : '';
}

function buildKindMetadata(kind: ProviderOfferingKind, form: OfferingFormState): Record<string, unknown> {
  if (kind === 'product') {
    return {
      material: form.material || null,
      dimensions: form.dimensions || null,
      stock_quantity: form.stockQuantity ? Number(form.stockQuantity) : null,
      availability: form.availabilityNotes || null,
    };
  }

  if (kind === 'experience') {
    return {
      duration: form.duration || null,
      max_participants: form.maxParticipants ? Number(form.maxParticipants) : null,
      skill_level: form.skillLevel || null,
      availability: form.availabilityNotes || null,
    };
  }

  return {
    property_type: form.propertyType || null,
    rooms: form.rooms ? Number(form.rooms) : null,
    room_types: splitList(form.roomTypes),
    amenities: splitList(form.amenities),
    availability: form.availabilityNotes || null,
  };
}

function offeringMetadataLabel(kind: ProviderOfferingKind, metadata: Record<string, unknown> | null) {
  if (!metadata) {
    return [];
  }

  if (kind === 'product') {
    return [jsonMaybeString(metadata.material), jsonMaybeNumber(metadata.stock_quantity)].filter(Boolean);
  }

  if (kind === 'experience') {
    return [jsonMaybeString(metadata.duration), jsonMaybeNumber(metadata.max_participants)].filter(Boolean);
  }

  return [jsonMaybeString(metadata.property_type), jsonMaybeNumber(metadata.rooms)].filter(Boolean);
}

interface OfferingFormState {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category: string;
  district: string;
  address: string;
  price: string;
  currency: string;
  status: ProviderOfferingStatus;
  cover_image: string;
  galleryText: string;
  material: string;
  dimensions: string;
  stockQuantity: string;
  duration: string;
  maxParticipants: string;
  skillLevel: string;
  propertyType: string;
  rooms: string;
  roomTypes: string;
  amenities: string;
  availabilityNotes: string;
}

const initialOfferingForm: OfferingFormState = {
  name: '',
  slug: '',
  short_description: '',
  description: '',
  category: '',
  district: '',
  address: '',
  price: '',
  currency: 'INR',
  status: 'draft',
  cover_image: '',
  galleryText: '',
  material: '',
  dimensions: '',
  stockQuantity: '',
  duration: '',
  maxParticipants: '',
  skillLevel: '',
  propertyType: '',
  rooms: '',
  roomTypes: '',
  amenities: '',
  availabilityNotes: '',
};

function serializeOffering(offering: ProviderOffering): OfferingFormState {
  return {
    name: offering.name,
    slug: offering.slug,
    short_description: offering.short_description ?? '',
    description: offering.description ?? '',
    category: offering.category ?? '',
    district: offering.district ?? '',
    address: offering.address ?? '',
    price: offering.price?.toString() ?? '',
    currency: offering.currency ?? 'INR',
    status: offering.status,
    cover_image: offering.cover_image ?? '',
    galleryText: (offering.gallery ?? []).join('\n'),
    material: jsonMaybeString(offering.metadata?.material),
    dimensions: jsonMaybeString(offering.metadata?.dimensions),
    stockQuantity: jsonMaybeNumber(offering.metadata?.stock_quantity),
    duration: jsonMaybeString(offering.metadata?.duration),
    maxParticipants: jsonMaybeNumber(offering.metadata?.max_participants),
    skillLevel: jsonMaybeString(offering.metadata?.skill_level),
    propertyType: jsonMaybeString(offering.metadata?.property_type),
    rooms: jsonMaybeNumber(offering.metadata?.rooms),
    roomTypes: Array.isArray(offering.metadata?.room_types) ? (offering.metadata.room_types as string[]).join('\n') : '',
    amenities: Array.isArray(offering.metadata?.amenities) ? (offering.metadata.amenities as string[]).join('\n') : '',
    availabilityNotes: jsonMaybeString(offering.metadata?.availability),
  };
}

function renderServiceStats(offerings: ProviderOffering[]) {
  const total = offerings.length;
  const published = offerings.filter((item) => item.status === 'published').length;
  const draft = offerings.filter((item) => item.status === 'draft').length;
  const averagePrice =
    total > 0
      ? Number((offerings.reduce((sum, item) => sum + Number(item.price ?? 0), 0) / total).toFixed(0))
      : null;

  return { total, published, draft, averagePrice };
}

function ManagementPage({
  kind,
}: {
  kind: ProviderOfferingKind;
}) {
  const config = MARKETPLACE_CONFIG[kind];
  const [offerings, setOfferings] = useState<ProviderOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setNotice(null);
      const data = await getMyProviderOfferings(kind);
      setOfferings(data);
    } catch (loadError) {
      setOfferings([]);
      setNotice(
        loadError instanceof Error
          ? `This section is waiting on the provider marketplace tables. ${loadError.message}`
          : `This section is waiting on the provider marketplace tables.`
      );
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const stats = useMemo(() => renderServiceStats(offerings), [offerings]);

  const handleDelete = async (offering: ProviderOffering) => {
    const confirmed = window.confirm(`Delete "${offering.name}"? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setDeletingId(offering.id);

    try {
      await deleteProviderOffering(offering.id);
      await loadData();
    } catch (deleteError) {
      setNotice(deleteError instanceof Error ? deleteError.message : `Unable to delete ${config.singular.toLowerCase()}.`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingState label={`Loading ${config.title.toLowerCase()}...`} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={config.title}
        title={`Manage your ${config.title.toLowerCase()}`}
        description={config.description}
        actions={
          <>
            <Button asChild>
              <Link to={`/provider/${config.routeSegment}/new`} className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {config.createLabel}
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/provider/dashboard">Back to Dashboard</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Total ${config.title.toLowerCase()}`} value={String(stats.total)} detail={`All ${config.title.toLowerCase()} under your account`} icon={Sparkles} />
        <StatCard label="Published" value={String(stats.published)} detail="Visible on the public tourism site" icon={CheckCircle2} />
        <StatCard label="Drafts" value={String(stats.draft)} detail="Saved but not public yet" icon={Edit3} />
        <StatCard
          label="Average price"
          value={stats.averagePrice != null ? formatIndianCurrency(stats.averagePrice) : '₹0'}
          detail={stats.total > 0 ? 'Average across your portfolio' : 'No items yet'}
          icon={Sparkles}
        />
      </div>

      {notice ? <ErrorState title={`Unable to load ${config.title.toLowerCase()}`} message={notice} /> : null}

      {offerings.length === 0 ? (
        <EmptyState
          title={`No ${config.title.toLowerCase()} yet`}
          message={`Add your first ${config.singular.toLowerCase()} to start building a richer provider presence.`}
          actionLabel={config.createLabel}
          actionHref={`/provider/${config.routeSegment}/new`}
        />
      ) : (
        <div className="space-y-4">
          {offerings.map((offering) => (
            <ProviderOfferingCard
              key={offering.id}
              offering={offering}
              onDelete={handleDelete}
              deleting={deletingId === offering.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OfferingFormPage({
  kind,
}: {
  kind: ProviderOfferingKind;
}) {
  const config = MARKETPLACE_CONFIG[kind];
  const navigate = useNavigate();
  const { offeringId } = useParams<{ offeringId?: string }>();
  const isEditMode = Boolean(offeringId);
  const [form, setForm] = useState<OfferingFormState>(initialOfferingForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offering, setOffering] = useState<ProviderOffering | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadOffering() {
      if (!offeringId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const record = await getProviderOfferingById(offeringId);

        if (!alive) {
          return;
        }

        if (!record || record.kind !== kind) {
          setError(`${config.singular} not found.`);
          setOffering(null);
          return;
        }

        setOffering(record);
        setForm(serializeOffering(record));
      } catch (loadError) {
        if (alive) {
          setError(loadError instanceof Error ? loadError.message : `Unable to load ${config.singular.toLowerCase()}.`);
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
  }, [config.singular, kind, offeringId]);

  const previewImage = form.cover_image.trim() || DEFAULT_DESTINATION_IMAGE;
  const previewTitle = form.name.trim() || `${config.singular} preview`;
  const previewDescription = form.short_description.trim() || form.description.trim() || 'Your live preview will appear here.';
  const kindMetadata = offeringMetadataLabel(kind, offering?.metadata ?? null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const price = form.price.trim() ? Number(form.price.trim()) : null;

    if (form.price.trim() && !Number.isFinite(price)) {
      setSaving(false);
      setError('Price must be a valid number.');
      return;
    }

    const payload: ProviderOfferingInput = {
      kind,
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      short_description: form.short_description.trim() || null,
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      district: form.district.trim() || null,
      address: form.address.trim() || null,
      price,
      currency: form.currency.trim() || 'INR',
      status: form.status,
      cover_image: form.cover_image.trim() || null,
      gallery: splitList(form.galleryText),
      metadata: buildKindMetadata(kind, form),
    };

    try {
      const saved = offering ? await updateProviderOffering(offering.id, payload) : await createProviderOffering(payload);
      navigate(`/provider/${config.routeSegment}/${saved.id}`, { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : `Unable to save ${config.singular.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label={isEditMode ? `Loading ${config.singular.toLowerCase()}...` : `Preparing ${config.singular.toLowerCase()} form...`} />;
  }

  if (error && isEditMode && !offering) {
    return <ErrorState title={`Unable to load ${config.singular.toLowerCase()}`} message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isEditMode ? `Edit ${config.singular.toLowerCase()}` : `Add ${config.singular.toLowerCase()}`}
        title={isEditMode ? `Update your ${config.singular.toLowerCase()}` : `Create a new ${config.singular.toLowerCase()}`}
        description={`Keep the details polished so travellers can trust your ${config.singular.toLowerCase()} listings.`}
        actions={
          <Button asChild variant="secondary">
            <Link to={`/provider/${config.routeSegment}`} className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to {config.title}
            </Link>
          </Button>
        }
      />

      {error && !isEditMode ? <ErrorState title={`Unable to save ${config.singular.toLowerCase()}`} message={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">{isEditMode ? 'Edit item' : 'New item'}</p>
              <h2 className="mt-1 text-2xl font-semibold text-ink-900">
                {isEditMode ? `Refine your ${config.singular.toLowerCase()}` : `Create a ${config.singular.toLowerCase()} listing`}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <ProviderAIWriterModal
                kind={kind}
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
              <Badge variant="accent">{form.status === 'published' ? 'Ready for public view' : 'Draft mode'}</Badge>
            </div>
          </div>

          <form className="grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
            <label className="block space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-ink-700">Name</span>
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder={`${config.singular} name`}
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Slug</span>
              <Input
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                placeholder="auto-generated-if-empty"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Category</span>
              <Select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              >
                <option value="">Select a category</option>
                {PROVIDER_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">District</span>
              <Input
                value={form.district}
                onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))}
                placeholder="Ranchi"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Address / location</span>
              <Input
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                placeholder="Village, market, or property address"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Price</span>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                placeholder="0"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Status</span>
              <Select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ProviderOfferingStatus }))}
              >
                {PROVIDER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Cover image URL</span>
              <Input
                value={form.cover_image}
                onChange={(event) => setForm((current) => ({ ...current, cover_image: event.target.value }))}
                placeholder="https://..."
              />
            </label>

            <label className="block space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-ink-700">Gallery URLs</span>
              <Textarea
                value={form.galleryText}
                onChange={(event) => setForm((current) => ({ ...current, galleryText: event.target.value }))}
                placeholder="One URL per line or comma-separated"
                className="min-h-28"
              />
            </label>

            <label className="block space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-ink-700">Short description</span>
              <Textarea
                value={form.short_description}
                onChange={(event) => setForm((current) => ({ ...current, short_description: event.target.value }))}
                placeholder="One-line summary for cards and previews"
                className="min-h-28"
              />
            </label>

            <label className="block space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-ink-700">Description</span>
              <Textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Describe the offering in more detail."
              />
            </label>

            {kind === 'product' ? (
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink-700">Material</span>
                  <Input
                    value={form.material}
                    onChange={(event) => setForm((current) => ({ ...current, material: event.target.value }))}
                    placeholder="Dokra metal, bamboo, cloth..."
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink-700">Stock quantity</span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stockQuantity}
                    onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value }))}
                    placeholder="12"
                  />
                </label>
                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium text-ink-700">Dimensions / size</span>
                  <Input
                    value={form.dimensions}
                    onChange={(event) => setForm((current) => ({ ...current, dimensions: event.target.value }))}
                    placeholder="Small, medium, large..."
                  />
                </label>
                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium text-ink-700">Availability notes</span>
                  <Textarea
                    value={form.availabilityNotes}
                    onChange={(event) => setForm((current) => ({ ...current, availabilityNotes: event.target.value }))}
                    placeholder="Made to order, seasonal stock, etc."
                    className="min-h-24"
                  />
                </label>
              </>
            ) : null}

            {kind === 'experience' ? (
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink-700">Duration</span>
                  <Input
                    value={form.duration}
                    onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
                    placeholder="2 hours"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink-700">Max participants</span>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={form.maxParticipants}
                    onChange={(event) => setForm((current) => ({ ...current, maxParticipants: event.target.value }))}
                    placeholder="10"
                  />
                </label>
                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium text-ink-700">Skill level</span>
                  <Input
                    value={form.skillLevel}
                    onChange={(event) => setForm((current) => ({ ...current, skillLevel: event.target.value }))}
                    placeholder="Beginner friendly"
                  />
                </label>
                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium text-ink-700">Availability notes</span>
                  <Textarea
                    value={form.availabilityNotes}
                    onChange={(event) => setForm((current) => ({ ...current, availabilityNotes: event.target.value }))}
                    placeholder="Weekends only, evening sessions, seasonal availability..."
                    className="min-h-24"
                  />
                </label>
              </>
            ) : null}

            {kind === 'stay' ? (
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink-700">Property type</span>
                  <Input
                    value={form.propertyType}
                    onChange={(event) => setForm((current) => ({ ...current, propertyType: event.target.value }))}
                    placeholder="Homestay / hotel / guesthouse"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink-700">Rooms</span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={form.rooms}
                    onChange={(event) => setForm((current) => ({ ...current, rooms: event.target.value }))}
                    placeholder="4"
                  />
                </label>
                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium text-ink-700">Room types</span>
                  <Textarea
                    value={form.roomTypes}
                    onChange={(event) => setForm((current) => ({ ...current, roomTypes: event.target.value }))}
                    placeholder="Single, double, family..."
                    className="min-h-24"
                  />
                </label>
                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium text-ink-700">Amenities</span>
                  <Textarea
                    value={form.amenities}
                    onChange={(event) => setForm((current) => ({ ...current, amenities: event.target.value }))}
                    placeholder="Wi-Fi, parking, meals, hot water..."
                    className="min-h-24"
                  />
                </label>
                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium text-ink-700">Availability notes</span>
                  <Textarea
                    value={form.availabilityNotes}
                    onChange={(event) => setForm((current) => ({ ...current, availabilityNotes: event.target.value }))}
                    placeholder="Seasonal openings, occupancy notes, etc."
                    className="min-h-24"
                  />
                </label>
              </>
            ) : null}

            <div className="flex flex-wrap gap-3 lg:col-span-2">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : isEditMode ? `Update ${config.singular}` : `Create ${config.singular}`}
              </Button>
              <Button asChild variant="secondary">
                <Link to={isEditMode && offering ? `/provider/${config.routeSegment}/${offering.id}` : `/provider/${config.routeSegment}`}>
                  Cancel
                </Link>
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
                <img src={previewImage} alt={previewTitle} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2">
                <Badge variant="accent">{form.category || getProviderOfferingKindLabel(kind)}</Badge>
                <p className="text-sm leading-6 text-ink-600">{previewDescription}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-sand px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">District</p>
                  <p className="mt-1 text-sm font-medium text-ink-900">{form.district || 'Not set'}</p>
                </div>
                <div className="rounded-2xl bg-sand px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Price</p>
                  <p className="mt-1 text-sm font-medium text-ink-900">{form.price ? formatIndianCurrency(Number(form.price)) : 'No price yet'}</p>
                </div>
              </div>
              {kindMetadata.length ? (
                <div className="flex flex-wrap gap-2 text-sm text-ink-600">
                  {kindMetadata.map((item) => (
                    <span key={item} className="inline-flex items-center rounded-full bg-ink-100 px-3 py-1">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Tips</p>
              <h3 className="mt-1 text-xl font-semibold text-ink-900">Polish your public presentation</h3>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-ink-700">
              <li className="rounded-2xl bg-sand px-4 py-3">Use a real cover image so your listing feels immediate and trustworthy.</li>
              <li className="rounded-2xl bg-sand px-4 py-3">Keep descriptions short, clear, and tourism-friendly.</li>
              <li className="rounded-2xl bg-sand px-4 py-3">Set draft until the page is ready for public travellers.</li>
            </ul>
            <Button asChild variant="secondary">
              <Link to={`/provider/${config.routeSegment}`} className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Back to {config.title}
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OfferingDetailPage({
  kind,
}: {
  kind: ProviderOfferingKind;
}) {
  const config = MARKETPLACE_CONFIG[kind];
  const { offeringId } = useParams<{ offeringId: string }>();
  const [offering, setOffering] = useState<ProviderOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const record = await getProviderOfferingById(offeringId);

        if (!alive) {
          return;
        }

        if (!record || record.kind !== kind) {
          setError(`${config.singular} not found or you do not have access to it.`);
          setOffering(null);
          return;
        }

        setOffering(record);
      } catch (loadError) {
        if (alive) {
          setError(loadError instanceof Error ? loadError.message : `Unable to load ${config.singular.toLowerCase()}.`);
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
  }, [config.singular, kind, offeringId]);

  if (loading) {
    return <LoadingState label={`Loading ${config.singular.toLowerCase()} preview...`} />;
  }

  if (error) {
    return <ErrorState title={`Unable to load ${config.singular.toLowerCase()}`} message={error} />;
  }

  if (!offering) {
    return <ErrorState title={`${config.singular} unavailable`} message={`We could not find that ${config.singular.toLowerCase()}.`} />;
  }

  const meta = offeringMetadataLabel(kind, offering.metadata);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${config.singular} preview`}
        title={offering.name}
        description="A provider-owned preview of how this item is managed in the portal."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to={`/provider/${config.routeSegment}`} className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/provider/${config.routeSegment}/${offering.id}/edit`} className="inline-flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit {config.singular}
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden p-0">
          <img src={offering.cover_image || DEFAULT_DESTINATION_IMAGE} alt={offering.name} className="h-80 w-full object-cover" />
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{getProviderOfferingKindLabel(kind)}</Badge>
              <Badge variant={offering.status === 'published' ? 'success' : offering.status === 'archived' ? 'neutral' : 'warning'}>
                {offering.status}
              </Badge>
            </div>
            <p className="text-sm leading-6 text-ink-700">{offering.description || offering.short_description || 'No description available.'}</p>
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Item details</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink-900">{offering.name}</h2>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Category</p>
              <p className="mt-1 text-sm font-medium text-ink-900">{offering.category || 'Not set'}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Location</p>
              <p className="mt-1 text-sm font-medium text-ink-900">{offering.district || 'Not set'}</p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Price</p>
              <p className="mt-1 text-sm font-medium text-ink-900">
                {offering.price != null ? formatIndianCurrency(offering.price) : 'No price yet'}
              </p>
            </div>
            <div className="rounded-2xl bg-sand px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Slug</p>
              <p className="mt-1 text-sm font-medium text-ink-900">{offering.slug}</p>
            </div>
          </div>

          {meta.length ? (
            <div className="flex flex-wrap gap-2 text-sm text-ink-600">
              {meta.map((item) => (
                <span key={item} className="inline-flex items-center rounded-full bg-ink-100 px-3 py-1">
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

function RequestsPage() {
  const [requests, setRequests] = useState<ProviderRequestWithOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | ProviderRequestStatus>('all');

  const loadRequests = async () => {
    try {
      setLoading(true);
      setNotice(null);
      const data = await getMyProviderRequests();
      setRequests(data);
    } catch (loadError) {
      setRequests([]);
      setNotice(loadError instanceof Error ? loadError.message : 'Unable to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const stats = useMemo(() => {
    return {
      pending: requests.filter((item) => item.status === 'pending').length,
      accepted: requests.filter((item) => item.status === 'accepted').length,
      completed: requests.filter((item) => item.status === 'completed').length,
      rejected: requests.filter((item) => item.status === 'rejected').length,
    };
  }, [requests]);

  const handleStatusChange = async (requestId: string, status: ProviderRequestStatus, responseMsg?: string) => {
    setUpdatingId(requestId);

    try {
      await updateProviderRequestStatus(requestId, status, responseMsg);
      await loadRequests();
    } catch (updateError) {
      setNotice(updateError instanceof Error ? updateError.message : 'Unable to update request.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = requests.filter((item) => {
    if (activeTab === 'all') return true;
    return item.status === activeTab;
  });

  if (loading) {
    return <LoadingState label="Loading provider requests..." />;
  }

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        eyebrow="Requests"
        title="Tourist Bookings & Service Inquiries"
        description="Review, accept, or decline reservations for your accommodations, tours, transport, experiences, and products."
        actions={
          <Button asChild variant="secondary">
            <Link to="/provider/dashboard">Back to Dashboard</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Pending" value={String(stats.pending)} detail="Awaiting your response" icon={Sparkles} />
        <StatCard label="Accepted" value={String(stats.accepted)} detail="Confirmed reservations" icon={CheckCircle2} />
        <StatCard label="Completed" value={String(stats.completed)} detail="Fulfilled services" icon={Save} />
        <StatCard label="Declined" value={String(stats.rejected)} detail="Rejected requests" icon={ArrowLeft} />
      </div>

      {notice ? (
        <ErrorState
          title="Notice"
          message={notice}
        />
      ) : null}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-ink-200 pb-3">
        {[
          { id: 'all' as const, label: 'All Requests', count: requests.length },
          { id: 'pending' as const, label: 'New / Pending', count: stats.pending },
          { id: 'accepted' as const, label: 'Accepted', count: stats.accepted },
          { id: 'completed' as const, label: 'Completed', count: stats.completed },
          { id: 'rejected' as const, label: 'Rejected', count: stats.rejected },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-forest-900 text-white shadow-xs'
                : 'bg-white text-ink-700 hover:bg-sand border border-ink-200/80'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeTab === tab.id ? 'bg-forest-700 text-white' : 'bg-sand text-ink-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState
          title="No requests in this view"
          message="When tourists send enquiries or booking requests for your listings, they will appear here in real time."
          actionLabel="View Dashboard"
          actionHref="/provider/dashboard"
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <ProviderRequestCard
              key={request.id}
              request={request}
              isUpdating={updatingId === request.id}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProviderProductsPage() {
  return <ManagementPage kind="product" />;
}

export function ProviderExperiencesPage() {
  return <ManagementPage kind="experience" />;
}

export function ProviderStaysPage() {
  return <ManagementPage kind="stay" />;
}

export function ProviderProductFormPage() {
  return <OfferingFormPage kind="product" />;
}

export function ProviderExperienceFormPage() {
  return <OfferingFormPage kind="experience" />;
}

export function ProviderStayFormPage() {
  return <OfferingFormPage kind="stay" />;
}

export function ProviderProductDetailPage() {
  return <OfferingDetailPage kind="product" />;
}

export function ProviderExperienceDetailPage() {
  return <OfferingDetailPage kind="experience" />;
}

export function ProviderStayDetailPage() {
  return <OfferingDetailPage kind="stay" />;
}

export function ProviderRequestsPage() {
  return <RequestsPage />;
}
