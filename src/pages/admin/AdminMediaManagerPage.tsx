import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CloudUpload,
  Compass,
  Eye,
  HeartHandshake,
  Loader2,
  Mountain,
  Save,
  Sparkles,
  Star,
  Tent,
  Trash2,
  Truck,
  Upload,
} from 'lucide-react';
import { Badge, Button, Card, Input } from '../../components/ui';
import { PageHeader } from '../../components/common/StateBlocks';
import { TourismImage } from '../../components/common/TourismImage';
import {
  fetchCategoryEntities,
  updateDestinationMedia,
  updateOfferingMedia,
  uploadTourismPhoto,
  deleteTourismPhoto,
  type MediaEntity,
  type TourismFolder,
} from '../../services/storage/tourismStorageService';

type MediaCategory =
  | 'destinations'
  | 'stays'
  | 'crafts'
  | 'tours'
  | 'experiences'
  | 'transport';

interface CategoryOption {
  id: MediaCategory;
  label: string;
  folder: TourismFolder;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'destinations',
    label: 'Destinations & Heritage',
    folder: 'destinations',
    icon: Mountain,
    description: 'Waterfalls, wildlife sanctuaries, dams, hills, and ancient temples',
  },
  {
    id: 'stays',
    label: 'Accommodations & Stays',
    folder: 'stays',
    icon: Tent,
    description: 'Eco-resorts, forest cottages, village homestays, and campsites',
  },
  {
    id: 'crafts',
    label: 'Artisan Crafts & Products',
    folder: 'crafts',
    icon: HeartHandshake,
    description: 'Sohrai-Khovar murals, Dhokra bronze metalcraft, and Tussar silk',
  },
  {
    id: 'tours',
    label: 'Guided Tours & Trails',
    folder: 'tours',
    icon: Compass,
    description: 'Waterfall circuits, heritage walks, and cultural temple circuits',
  },
  {
    id: 'experiences',
    label: 'Adventures & Workshops',
    folder: 'experiences',
    icon: Sparkles,
    description: 'Hill treks, forest safaris, culinary immersion, and kayaking',
  },
  {
    id: 'transport',
    label: 'Transport & Safari Fleet',
    folder: 'transport',
    icon: Truck,
    description: 'Tourist cabs, outstation SUVs, and 4x4 forest expedition vehicles',
  },
];

export function AdminMediaManagerPage() {
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>('destinations');
  const [entities, setEntities] = useState<MediaEntity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active media editing state
  const [coverImage, setCoverImage] = useState<string>('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCategoryConfig = CATEGORY_OPTIONS.find((c) => c.id === selectedCategory)!;
  const currentEntity = entities.find((e) => e.id === selectedEntityId);

  // 1. Load entities whenever category changes
  useEffect(() => {
    async function loadEntities() {
      try {
        setLoading(true);
        setErrorMessage(null);
        const data = await fetchCategoryEntities(selectedCategory);
        setEntities(data);
        if (data.length > 0) {
          setSelectedEntityId(data[0].id);
          setCoverImage(data[0].cover_image || '');
          setGallery(data[0].gallery || []);
        } else {
          setSelectedEntityId('');
          setCoverImage('');
          setGallery([]);
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to fetch items');
      } finally {
        setLoading(false);
      }
    }

    void loadEntities();
  }, [selectedCategory]);

  // 2. Sync state when selected entity changes
  const handleSelectEntity = (entity: MediaEntity) => {
    setSelectedEntityId(entity.id);
    setCoverImage(entity.cover_image || '');
    setGallery(entity.gallery || []);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // 3. Multi-file upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentEntity) return;

    try {
      setUploading(true);
      setErrorMessage(null);
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadTourismPhoto(
          file,
          activeCategoryConfig.folder,
          currentEntity.slug
        );
        newUrls.push(result.publicUrl);
      }

      // If no cover image yet, set first uploaded image as cover
      const updatedCover = coverImage ? coverImage : newUrls[0];
      const updatedGallery = Array.from(new Set([...gallery, ...newUrls]));

      setCoverImage(updatedCover);
      setGallery(updatedGallery);

      // Auto-save to Supabase
      if (selectedCategory === 'destinations') {
        await updateDestinationMedia(currentEntity.id, updatedCover, updatedGallery);
      } else {
        await updateOfferingMedia(currentEntity.id, updatedCover, updatedGallery);
      }

      // Update local entity list
      setEntities((prev) =>
        prev.map((item) =>
          item.id === currentEntity.id
            ? { ...item, cover_image: updatedCover, gallery: updatedGallery }
            : item
        )
      );

      setSuccessMessage(`Successfully uploaded ${files.length} real photo(s) to Supabase Storage!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 4. Set an image as the main cover
  const handleSetCover = async (imageUrl: string) => {
    if (!currentEntity) return;
    setCoverImage(imageUrl);
    // Ensure cover image is in gallery as well
    const updatedGallery = gallery.includes(imageUrl) ? gallery : [imageUrl, ...gallery];
    setGallery(updatedGallery);

    try {
      setSaving(true);
      if (selectedCategory === 'destinations') {
        await updateDestinationMedia(currentEntity.id, imageUrl, updatedGallery);
      } else {
        await updateOfferingMedia(currentEntity.id, imageUrl, updatedGallery);
      }

      setEntities((prev) =>
        prev.map((item) =>
          item.id === currentEntity.id
            ? { ...item, cover_image: imageUrl, gallery: updatedGallery }
            : item
        )
      );

      setSuccessMessage('Cover image updated and saved to database.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save cover image');
    } finally {
      setSaving(false);
    }
  };

  // 5. Reorder gallery images
  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;

    const newGallery = [...gallery];
    const [moved] = newGallery.splice(index, 1);
    newGallery.splice(targetIndex, 0, moved);
    setGallery(newGallery);
  };

  // 6. Delete an image
  const handleDeleteImage = async (imageUrl: string) => {
    if (!currentEntity) return;
    const confirmDelete = window.confirm('Remove this photograph from the listing?');
    if (!confirmDelete) return;

    const newGallery = gallery.filter((img) => img !== imageUrl);
    let newCover = coverImage;
    if (coverImage === imageUrl) {
      newCover = newGallery.length > 0 ? newGallery[0] : '';
    }

    setGallery(newGallery);
    setCoverImage(newCover);

    try {
      setSaving(true);
      // Delete from Supabase Storage if it was uploaded there
      await deleteTourismPhoto(imageUrl);

      if (selectedCategory === 'destinations') {
        await updateDestinationMedia(currentEntity.id, newCover, newGallery);
      } else {
        await updateOfferingMedia(currentEntity.id, newCover, newGallery);
      }

      setEntities((prev) =>
        prev.map((item) =>
          item.id === currentEntity.id
            ? { ...item, cover_image: newCover, gallery: newGallery }
            : item
        )
      );

      setSuccessMessage('Image removed successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update after deletion');
    } finally {
      setSaving(false);
    }
  };

  // 7. Manual Save button
  const handleSaveAll = async () => {
    if (!currentEntity) return;

    try {
      setSaving(true);
      setErrorMessage(null);

      if (selectedCategory === 'destinations') {
        await updateDestinationMedia(currentEntity.id, coverImage, gallery);
      } else {
        await updateOfferingMedia(currentEntity.id, coverImage, gallery);
      }

      setEntities((prev) =>
        prev.map((item) =>
          item.id === currentEntity.id
            ? { ...item, cover_image: coverImage, gallery: gallery }
            : item
        )
      );

      setSuccessMessage('All media updates successfully saved to Supabase!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save media changes');
    } finally {
      setSaving(false);
    }
  };

  // Filtered entity list for left sidebar
  const filteredEntities = entities.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.district && e.district.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Media Governance"
        title="Real Photograph & Supabase Storage Manager"
        description="Upload verified photographs directly to public Supabase Storage bucket 'tourism-images', set cover photos, and curate authentic visual galleries across Jharkhand."
      />

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 shadow-2xs">
          <Check className="h-4 w-4 text-emerald-700 shrink-0" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-900 shadow-2xs">
          <AlertCircle className="h-4 w-4 text-red-700 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Category Tabs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORY_OPTIONS.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`group flex flex-col items-center gap-2 rounded-2xl p-3.5 text-center transition-all border ${
                isActive
                  ? 'bg-clay-700 text-white border-clay-800 shadow-md scale-[1.02]'
                  : 'bg-white text-ink-700 border-ink-200 hover:bg-sand/70 hover:border-ink-300'
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'bg-sand text-clay-800 group-hover:bg-sand-200'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold leading-tight">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace: Left = Listings Selector, Right = Photo & Gallery Editor */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Listings in selected category */}
        <Card className="p-4 lg:col-span-4 flex flex-col h-[650px] space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-ink-100">
            <h3 className="font-display text-sm font-bold text-ink-900">
              {activeCategoryConfig.label}
            </h3>
            <Badge variant="accent">{filteredEntities.length} items</Badge>
          </div>

          {/* Search box */}
          <Input
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs"
          />

          {/* Entity List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-ink-400 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-clay-600" />
                <span className="text-xs">Loading items...</span>
              </div>
            ) : filteredEntities.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-500">
                No items found in this category.
              </div>
            ) : (
              filteredEntities.map((item) => {
                const isSelected = item.id === selectedEntityId;
                const hasCover = Boolean(item.cover_image);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectEntity(item)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-all border ${
                      isSelected
                        ? 'bg-sand border-clay-400 text-ink-900 font-semibold shadow-2xs'
                        : 'bg-white border-ink-150 text-ink-700 hover:bg-sand/40 hover:border-ink-250'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate font-display font-bold text-ink-900">{item.name}</p>
                      <p className="text-[11px] text-ink-500 truncate">
                        {item.district || item.category || 'Jharkhand'}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {hasCover ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                          <Camera className="h-3 w-3" />
                          {item.gallery?.length || 1}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200">
                          No Photo
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Column: Active Media Editor */}
        <div className="lg:col-span-8 space-y-6">
          {currentEntity ? (
            <>
              {/* Active Entity Header & Upload Action */}
              <Card className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ink-150">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-clay-700">
                      Managing Visual Assets
                    </span>
                    <h2 className="font-display text-lg font-bold text-ink-900">
                      {currentEntity.name}
                    </h2>
                    <p className="text-xs text-ink-500">
                      Storage folder: <code className="rounded bg-sand-200 px-1 py-0.5 font-mono text-[11px] text-clay-800">tourism-images/{activeCategoryConfig.folder}/</code>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                    />

                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="font-bold text-xs"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Uploading to Storage...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                          Upload Real Photographs
                        </>
                      )}
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={handleSaveAll}
                      disabled={saving}
                      className="font-bold text-xs"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-1.5 h-3.5 w-3.5" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Upload Drag & Drop Prompt */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-clay-300 bg-sand/30 p-6 text-center cursor-pointer hover:bg-sand/60 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay-100 text-clay-800 mb-2">
                    <CloudUpload className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-ink-900">
                    Click to browse or drop high-resolution real photographs
                  </p>
                  <p className="text-[11px] text-ink-500 mt-0.5">
                    Supports JPG, PNG, WEBP, and AVIF up to 10MB per image.
                  </p>
                </div>
              </Card>

              {/* Gallery & Cover Image Management Grid */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-sm font-bold text-ink-900">
                      Uploaded Photographs ({gallery.length})
                    </h3>
                    <p className="text-xs text-ink-500">
                      Select which photo serves as the public cover, reorder gallery items, or remove old photos.
                    </p>
                  </div>
                </div>

                {gallery.length === 0 && !coverImage ? (
                  <div className="rounded-2xl border border-ink-150 bg-sand/20 p-8 text-center space-y-2">
                    <Camera className="mx-auto h-8 w-8 text-ink-400" />
                    <p className="font-display text-sm font-bold text-ink-800">No real photos uploaded yet</p>
                    <p className="text-xs text-ink-500 max-w-sm mx-auto">
                      Upload authentic field photographs above to populate this listing on the tourist portal.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Combine cover and gallery unique items */}
                    {Array.from(new Set([coverImage, ...gallery].filter(Boolean))).map((imgUrl, index) => {
                      const isCover = coverImage === imgUrl;

                      return (
                        <div
                          key={imgUrl}
                          className={`group relative flex flex-col rounded-2xl border overflow-hidden bg-white shadow-2xs transition-all ${
                            isCover ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-ink-200'
                          }`}
                        >
                          {/* Image Display */}
                          <div className="relative aspect-4/3 w-full bg-sand-100 overflow-hidden">
                            <TourismImage
                              src={imgUrl}
                              alt={`${currentEntity.name} ${index + 1}`}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              category={currentEntity.category}
                            />

                            {/* Cover Badge */}
                            {isCover && (
                              <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
                                <Star className="h-3 w-3 fill-white" />
                                Cover Photo
                              </div>
                            )}

                            {/* Action overlay */}
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(imgUrl)}
                                className="rounded-lg bg-red-600 p-1.5 text-white shadow-md hover:bg-red-700 transition-colors"
                                title="Delete image"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Image Footer Actions */}
                          <div className="p-3 bg-white space-y-2 border-t border-ink-100">
                            <p className="truncate text-[10px] font-mono text-ink-500" title={imgUrl}>
                              {imgUrl.split('/').pop()}
                            </p>

                            <div className="flex items-center justify-between gap-1 pt-1">
                              {!isCover ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetCover(imgUrl)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-clay-700 hover:text-clay-900 transition-colors"
                                >
                                  <Star className="h-3 w-3" />
                                  Set as Cover
                                </button>
                              ) : (
                                <span className="text-[11px] font-bold text-amber-700">
                                  Active Cover
                                </span>
                              )}

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(index, 'left')}
                                  disabled={index === 0}
                                  className="rounded p-1 text-ink-400 hover:bg-sand hover:text-ink-900 disabled:opacity-30"
                                  title="Move earlier in gallery"
                                >
                                  <ArrowLeft className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(index, 'right')}
                                  disabled={index === gallery.length - 1}
                                  className="rounded p-1 text-ink-400 hover:bg-sand hover:text-ink-900 disabled:opacity-30"
                                  title="Move later in gallery"
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Tourist Card Live Preview */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-ink-150">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-clay-700" />
                    <h3 className="font-display text-sm font-bold text-ink-900">
                      Tourist Portal Live Preview
                    </h3>
                  </div>
                  <span className="text-[11px] text-ink-500">
                    How tourists view this listing on explore & detail pages
                  </span>
                </div>

                <div className="max-w-md mx-auto overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
                  <div className="relative aspect-16/10 w-full bg-sand-100">
                    <TourismImage
                      src={coverImage}
                      alt={currentEntity.name}
                      category={currentEntity.category}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded-full bg-ink-950/70 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                      {currentEntity.district || 'Jharkhand'}
                    </div>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h4 className="font-display text-base font-bold text-ink-900">
                      {currentEntity.name}
                    </h4>
                    <p className="text-xs text-ink-600 line-clamp-2">
                      Real photograph verified & synced with Supabase Storage.
                    </p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center text-ink-500">
              <Camera className="mx-auto h-12 w-12 text-ink-300 mb-3" />
              <p className="font-display font-bold text-base text-ink-800">Select a listing to manage photos</p>
              <p className="text-xs text-ink-500 mt-1">Choose any item from the left column to upload and curate photographs.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
