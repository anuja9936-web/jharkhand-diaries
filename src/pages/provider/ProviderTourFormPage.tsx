import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Save, Check } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Input, Select, Textarea } from '../../components/ui';
import { PageHeader } from '../../components/common/StateBlocks';
import {
  createProviderOffering,
  getProviderOfferingById,
  updateProviderOffering,
} from '../../services/provider/providerMarketplaceService';
import { GUIDE_SPECIALTIES, JHARKHAND_LANGUAGES } from '../../constants/provider';
import { useAuth } from '../../hooks/useAuth';
import type { ProviderOfferingStatus } from '../../types/provider';

const JHARKHAND_DISTRICTS = [
  'Ranchi', 'Latehar', 'Gumla', 'Khunti', 'Simdega', 'West Singhbhum',
  'East Singhbhum', 'Seraikela Kharsawan', 'Hazaribagh', 'Ramgarh',
  'Bokaro', 'Dhanbad', 'Giridih', 'Deoghar', 'Dumka', 'Godda',
  'Sahibganj', 'Pakur', 'Jamtara', 'Palamu', 'Garhwa', 'Chatra', 'Koderma'
];

export function ProviderTourFormPage() {
  const { offeringId } = useParams<{ offeringId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isEditing = Boolean(offeringId);

  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [specialty, setSpecialty] = useState<string>(GUIDE_SPECIALTIES[0]);
  const [destinationsCovered, setDestinationsCovered] = useState('');
  const [district, setDistrict] = useState(profile?.district || 'Latehar');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [guideName, setGuideName] = useState(profile?.owner_name || profile?.full_name || '');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Hindi', 'English']);
  const [duration, setDuration] = useState('Full Day (6-8 hours)');
  const [price, setPrice] = useState('1500');
  const [maxCapacity, setMaxCapacity] = useState('10');
  const [timing, setTiming] = useState('08:00 AM - 04:00 PM');
  const [includedServices, setIncludedServices] = useState('Certified guide, cultural storytelling, forest entry permits, mineral water');
  const [requirements, setRequirements] = useState('Comfortable walking shoes, sun protection, valid ID proof');
  const [coverImage, setCoverImage] = useState('');
  const [galleryText, setGalleryText] = useState('');
  const [status, setStatus] = useState<ProviderOfferingStatus>('published');

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offeringId) return;

    const loadTour = async () => {
      try {
        setLoading(true);
        const tour = await getProviderOfferingById(offeringId);
        if (!tour) {
          setError('Tour not found.');
          return;
        }

        setName(tour.name);
        setShortDescription(tour.short_description || '');
        setDescription(tour.description || '');
        setSpecialty(tour.category || GUIDE_SPECIALTIES[0]);
        setDistrict(tour.district || 'Ranchi');
        setPrice(tour.price ? String(tour.price) : '');
        setCoverImage(tour.cover_image || '');
        setGalleryText((tour.gallery || []).join('\n'));
        setStatus(tour.status);

        const meta = tour.metadata || {};
        if (typeof meta.destinations_covered === 'string') setDestinationsCovered(meta.destinations_covered);
        if (typeof meta.meeting_point === 'string') setMeetingPoint(meta.meeting_point);
        if (typeof meta.guide_name === 'string') setGuideName(meta.guide_name);
        if (Array.isArray(meta.languages)) setSelectedLanguages(meta.languages as string[]);
        if (typeof meta.duration === 'string') setDuration(meta.duration);
        if (meta.max_capacity) setMaxCapacity(String(meta.max_capacity));
        if (typeof meta.timing === 'string') setTiming(meta.timing);
        if (typeof meta.included_services === 'string') setIncludedServices(meta.included_services);
        if (typeof meta.requirements === 'string') setRequirements(meta.requirements);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tour details.');
      } finally {
        setLoading(false);
      }
    };

    void loadTour();
  }, [offeringId]);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a tour title.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const gallery = galleryText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const metadata: Record<string, unknown> = {
        guide_name: guideName.trim() || null,
        specialty,
        destinations_covered: destinationsCovered.trim() || null,
        meeting_point: meetingPoint.trim() || null,
        languages: selectedLanguages,
        duration: duration.trim() || null,
        max_capacity: maxCapacity ? Number(maxCapacity) : null,
        timing: timing.trim() || null,
        included_services: includedServices.trim() || null,
        requirements: requirements.trim() || null,
      };

      const payload = {
        kind: 'tour' as const,
        name: name.trim(),
        short_description: shortDescription.trim() || null,
        description: description.trim() || null,
        category: specialty,
        district,
        address: meetingPoint.trim() || null,
        price: price ? Number(price) : null,
        currency: 'INR',
        status,
        cover_image: coverImage.trim() || null,
        gallery,
        metadata,
      };

      if (isEditing && offeringId) {
        await updateProviderOffering(offeringId, payload);
      } else {
        await createProviderOffering(payload);
      }

      navigate('/provider/tours');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save tour service.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-ink-600">
        Loading tour details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/provider/tours">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Tours
          </Link>
        </Button>
      </div>

      <PageHeader
        eyebrow="Guide & Tour Operator"
        title={isEditing ? `Edit Tour: ${name}` : 'Create New Guided Tour'}
        description="Publish your itinerary, destinations, group size, and guided storytelling package."
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-5 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-ink-100 pb-3">
            1. Tour Overview & Itinerary Details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Tour / Itinerary Title *
              </span>
              <Input
                placeholder="e.g. Netarhat Sunrise & Tribal Forest Walk"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Specialization / Tour Theme
              </span>
              <Select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                {GUIDE_SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Primary District
              </span>
              <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </label>

            <label className="sm:col-span-2 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Destinations / Landmarks Covered
              </span>
              <Input
                placeholder="e.g. Magnolia Sunset Point, Koel View Point, Upper Ghaghri Falls"
                value={destinationsCovered}
                onChange={(e) => setDestinationsCovered(e.target.value)}
              />
            </label>

            <label className="sm:col-span-2 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Short Catchphrase / Summary
              </span>
              <Input
                placeholder="e.g. Immersive 6-hour walk discovering indigenous flora, waterfalls, and local folklore."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </label>

            <label className="sm:col-span-2 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Detailed Itinerary & Description
              </span>
              <Textarea
                placeholder="Describe the step-by-step route, history, tribal traditions, and unique experiences included in this guided tour..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </label>
          </div>
        </Card>

        {/* Guide Credentials & Languages */}
        <Card className="space-y-5 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-ink-100 pb-3">
            2. Guide Identity & Spoken Languages
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Lead Guide Name
              </span>
              <Input
                placeholder="e.g. Rahul Kumar"
                value={guideName}
                onChange={(e) => setGuideName(e.target.value)}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Meeting Point & Landmark
              </span>
              <Input
                placeholder="e.g. Netarhat Bus Stand / Forest Rest House Gate"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
              />
            </label>

            <div className="sm:col-span-2 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Languages Spoken by Guide
              </span>
              <div className="flex flex-wrap gap-2">
                {JHARKHAND_LANGUAGES.map((lang) => {
                  const active = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                        active
                          ? 'border-clay-700 bg-clay-700 text-white shadow-sm'
                          : 'border-ink-200 bg-white text-ink-700 hover:bg-sand'
                      }`}
                    >
                      {active && <Check className="h-3 w-3" />}
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Schedule, Pricing, Group Size */}
        <Card className="space-y-5 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-ink-100 pb-3">
            3. Pricing, Capacity & Schedule
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Price (INR) *
              </span>
              <Input
                type="number"
                placeholder="1500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <span className="text-[11px] text-ink-500">Per person or standard group rate</span>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Max Group Capacity
              </span>
              <Input
                type="number"
                placeholder="10"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Tour Duration
              </span>
              <Input
                placeholder="e.g. 4 Hours / Full Day"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </label>

            <label className="sm:col-span-3 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Daily Timing / Available Slots
              </span>
              <Input
                placeholder="e.g. Morning Batch: 07:00 AM - 11:00 AM | Afternoon Batch: 02:00 PM - 06:00 PM"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
              />
            </label>

            <label className="sm:col-span-3 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                What's Included in this Tour
              </span>
              <Input
                placeholder="e.g. Local certified guide, forest entry pass, traditional herbal tea, binoculars"
                value={includedServices}
                onChange={(e) => setIncludedServices(e.target.value)}
              />
            </label>

            <label className="sm:col-span-3 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                What Guests Should Bring / Special Requirements
              </span>
              <Input
                placeholder="e.g. Trekking shoes, mosquito repellent, water bottle, government ID"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </label>
          </div>
        </Card>

        {/* Photos & Status */}
        <Card className="space-y-5 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-ink-100 pb-3">
            4. Photos & Publishing Status
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Cover Photo URL
              </span>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
            </label>

            <label className="sm:col-span-2 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Gallery Photos (one URL per line)
              </span>
              <Textarea
                placeholder="https://...\nhttps://..."
                value={galleryText}
                onChange={(e) => setGalleryText(e.target.value)}
                rows={3}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Listing Status
              </span>
              <Select value={status} onChange={(e) => setStatus(e.target.value as ProviderOfferingStatus)}>
                <option value="published">Published (Visible to tourists)</option>
                <option value="draft">Draft (Private workspace only)</option>
                <option value="archived">Archived</option>
              </Select>
            </label>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" asChild>
            <Link to="/provider/tours">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" />
            {saving ? 'Saving Tour...' : isEditing ? 'Update Tour' : 'Publish Tour'}
          </Button>
        </div>
      </form>
    </div>
  );
}
