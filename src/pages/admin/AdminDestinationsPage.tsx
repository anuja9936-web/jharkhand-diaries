import { useEffect, useState } from 'react';
import {
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, Input, Select, Textarea } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import {
  DEFAULT_DESTINATION_IMAGE,
  DESTINATION_CATEGORY_OPTIONS,
  JHARKHAND_DISTRICTS,
  getDestinationCategoryLabel,
} from '../../constants/destinations';
import {
  createAdminDestination,
  getAdminDestinations,
  setDestinationPublishStatus,
  updateAdminDestination,
} from '../../services/admin/adminGovernanceService';
import type { Destination, DestinationCategory, DestinationStatus } from '../../types/destination';

interface DestinationFormData {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  district: string;
  category: DestinationCategory;
  latitude: string;
  longitude: string;
  cover_image: string;
  gallery: string;
  eco_zone: boolean;
  best_time: string;
  entry_fee: string;
  status: DestinationStatus;
}

const INITIAL_FORM: DestinationFormData = {
  name: '',
  slug: '',
  short_description: '',
  description: '',
  district: 'Ranchi',
  category: 'waterfall',
  latitude: '23.3441',
  longitude: '85.3096',
  cover_image: '',
  gallery: '',
  eco_zone: false,
  best_time: 'October to March',
  entry_fee: '0',
  status: 'published',
};

export function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<DestinationStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<DestinationCategory | 'all'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DestinationFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminDestinations({
        status: statusFilter,
        category: categoryFilter,
        district: districtFilter,
        search: searchTerm,
      });
      setDestinations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load destinations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDestinations();
  }, [statusFilter, categoryFilter, districtFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loadDestinations();
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dest: Destination) => {
    setEditingId(dest.id);
    setFormData({
      name: dest.name,
      slug: dest.slug,
      short_description: dest.short_description || '',
      description: dest.description || '',
      district: dest.district,
      category: dest.category,
      latitude: dest.latitude != null ? String(dest.latitude) : '',
      longitude: dest.longitude != null ? String(dest.longitude) : '',
      cover_image: dest.cover_image || '',
      gallery: dest.gallery ? dest.gallery.join(', ') : '',
      eco_zone: dest.eco_zone,
      best_time: dest.best_time || '',
      entry_fee: dest.entry_fee != null ? String(dest.entry_fee) : '',
      status: dest.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveDestination = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError('Destination name is required.');
      return;
    }
    if (!formData.slug.trim()) {
      setFormError('Slug is required.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const galleryArray = formData.gallery
        ? formData.gallery
            .split(',')
            .map((url) => url.trim())
            .filter((url) => url.length > 0)
        : [];

      const payload = {
        name: formData.name,
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
        short_description: formData.short_description || null,
        description: formData.description || null,
        district: formData.district,
        category: formData.category,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        cover_image: formData.cover_image || DEFAULT_DESTINATION_IMAGE,
        gallery: galleryArray,
        eco_zone: formData.eco_zone,
        best_time: formData.best_time || null,
        entry_fee: formData.entry_fee ? parseFloat(formData.entry_fee) : null,
        status: formData.status,
      };

      if (editingId) {
        await updateAdminDestination(editingId, payload as any);
      } else {
        await createAdminDestination(payload as any);
      }

      setIsModalOpen(false);
      void loadDestinations();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save destination.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (dest: Destination) => {
    const nextStatus: DestinationStatus = dest.status === 'published' ? 'draft' : 'published';
    try {
      await setDestinationPublishStatus(dest.id, nextStatus);
      void loadDestinations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not change destination status.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Add Action */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          eyebrow="Content & Curation"
          title="Destination Management"
          description="Curate verified waterfalls, sacred hills, forest sanctuaries, and tribal heritage sites across Jharkhand."
        />
        <Button onClick={handleOpenCreate} size="sm" className="font-bold">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Destination
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search destinations by name or district..."
              className="pl-10 text-xs"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-auto text-xs min-w-[130px]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft (Unpublished)</option>
          </Select>

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="w-auto text-xs min-w-[150px]"
          >
            <option value="all">All Categories</option>
            {DESTINATION_CATEGORY_OPTIONS.filter((c) => c.value !== 'all').map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>

          <Select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-auto text-xs min-w-[140px]"
          >
            <option value="all">All Districts</option>
            {JHARKHAND_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>

          <Button type="submit" size="sm" variant="secondary" className="text-xs">
            Filter
          </Button>
        </form>
      </Card>

      {/* Destinations List */}
      {loading ? (
        <LoadingState label="Loading destinations..." />
      ) : error ? (
        <ErrorState title="Error loading destinations" message={error} />
      ) : destinations.length === 0 ? (
        <EmptyState
          title="No destinations found"
          message="No destinations match your search or filter settings."
          actionLabel="View All Destinations"
          actionHref="/admin/destinations"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest) => (
            <Card
              key={dest.id}
              className="flex flex-col justify-between overflow-hidden p-0 transition-all hover:border-clay-300 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] bg-sand overflow-hidden">
                <img
                  src={dest.cover_image || DEFAULT_DESTINATION_IMAGE}
                  alt={dest.name}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs ${
                      dest.status === 'published'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {dest.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                  {dest.eco_zone && (
                    <span className="rounded-full bg-emerald-800/90 text-white px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs">
                      Eco-Zone
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-clay-700 font-semibold uppercase tracking-wider">
                    <span>{getDestinationCategoryLabel(dest.category)}</span>
                    <span>•</span>
                    <span className="text-ink-600">{dest.district}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-ink-900 mt-1">{dest.name}</h3>
                  <p className="text-xs text-ink-600 line-clamp-2 mt-1">
                    {dest.short_description || dest.description || 'Verified Jharkhand tourism landmark.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-ink-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenEdit(dest)}
                      className="text-xs h-8 px-2.5"
                    >
                      <Edit2 className="mr-1 h-3 w-3" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleStatus(dest)}
                      className="text-xs h-8 px-2 text-ink-600 hover:text-ink-900"
                    >
                      {dest.status === 'published' ? (
                        <>
                          <EyeOff className="mr-1 h-3 w-3 text-amber-600" /> Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1 h-3 w-3 text-emerald-600" /> Publish
                        </>
                      )}
                    </Button>
                  </div>

                  <Link
                    to={`/destinations/${dest.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-clay-700 hover:underline"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Destination Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink-100 pb-4">
              <h2 className="font-display text-xl font-bold text-ink-900">
                {editingId ? 'Edit Destination' : 'Add New Destination'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-2 text-ink-400 hover:bg-sand hover:text-ink-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveDestination} className="space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 block sm:col-span-2">
                  <span className="font-bold text-ink-900">Destination Name *</span>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        name,
                        slug: !editingId
                          ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                          : formData.slug,
                      });
                    }}
                    placeholder="e.g. Hundru Falls"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">URL Slug *</span>
                  <Input
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. hundru-falls"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">District *</span>
                  <Select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  >
                    {JHARKHAND_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">Category *</span>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  >
                    {DESTINATION_CATEGORY_OPTIONS.filter((c) => c.value !== 'all').map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">Publication Status</span>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="published">Published (Visible to public)</option>
                    <option value="draft">Draft (Admin only)</option>
                  </Select>
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">Latitude (GPS)</span>
                  <Input
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="e.g. 23.4452"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">Longitude (GPS)</span>
                  <Input
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="e.g. 85.6541"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">Best Time to Visit</span>
                  <Input
                    value={formData.best_time}
                    onChange={(e) => setFormData({ ...formData, best_time: e.target.value })}
                    placeholder="e.g. September to February"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">Entry Fee (INR)</span>
                  <Input
                    type="number"
                    value={formData.entry_fee}
                    onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
                    placeholder="e.g. 20 (0 for free)"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="font-bold text-ink-900">Cover Image URL</span>
                <Input
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-ink-900">Gallery Image URLs (comma-separated)</span>
                <Input
                  value={formData.gallery}
                  onChange={(e) => setFormData({ ...formData, gallery: e.target.value })}
                  placeholder="https://..., https://..."
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-ink-900">Short Summary</span>
                <Input
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Brief 1-line hook for destination cards"
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-ink-900">Full Description & Visitor Guidelines</span>
                <Textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed background, cultural importance, accessibility tips, and safety instructions..."
                />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-ink-200 bg-sand/30 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.eco_zone}
                  onChange={(e) => setFormData({ ...formData, eco_zone: e.target.checked })}
                  className="h-4 w-4 rounded text-clay-700 focus:ring-clay-700"
                />
                <div>
                  <span className="font-bold text-ink-900 block">Eco-Sensitive Heritage Zone</span>
                  <span className="text-[11px] text-ink-600">
                    Flag this destination as requiring strict environmental, plastic-free, and tribal heritage protections.
                  </span>
                </div>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="font-bold">
                  {saving ? 'Saving...' : editingId ? 'Update Destination' : 'Create Destination'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
