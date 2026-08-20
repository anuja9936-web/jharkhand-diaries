import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Input, Select, Textarea } from '../../components/ui';
import { PageHeader } from '../../components/common/StateBlocks';
import {
  createProviderOffering,
  getProviderOfferingById,
  updateProviderOffering,
} from '../../services/provider/providerMarketplaceService';
import { TRANSPORT_VEHICLE_TYPES } from '../../constants/provider';
import { useAuth } from '../../hooks/useAuth';
import type { ProviderOfferingStatus } from '../../types/provider';

const JHARKHAND_DISTRICTS = [
  'Ranchi', 'Latehar', 'Gumla', 'Khunti', 'Simdega', 'West Singhbhum',
  'East Singhbhum', 'Seraikela Kharsawan', 'Hazaribagh', 'Ramgarh',
  'Bokaro', 'Dhanbad', 'Giridih', 'Deoghar', 'Dumka', 'Godda',
  'Sahibganj', 'Pakur', 'Jamtara', 'Palamu', 'Garhwa', 'Chatra', 'Koderma'
];

export function ProviderTransportFormPage() {
  const { offeringId } = useParams<{ offeringId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isEditing = Boolean(offeringId);

  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [vehicleType, setVehicleType] = useState<string>(TRANSPORT_VEHICLE_TYPES[1]); // SUV default
  const [district, setDistrict] = useState(profile?.district || 'Ranchi');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [seatingCapacity, setSeatingCapacity] = useState('6');
  const [serviceRoutes, setServiceRoutes] = useState('Ranchi Airport ⇄ Netarhat, Betla National Park, Patratu Valley');
  const [driverIncluded, setDriverIncluded] = useState<'yes' | 'no' | 'optional'>('yes');
  const [acType, setAcType] = useState<'AC' | 'Non-AC' | 'Both Available'>('AC');
  const [price, setPrice] = useState('3500');
  const [pricingModel, setPricingModel] = useState('Per Day / Flat Circuit Rate');
  const [coverImage, setCoverImage] = useState('');
  const [galleryText, setGalleryText] = useState('');
  const [status, setStatus] = useState<ProviderOfferingStatus>('published');

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offeringId) return;

    const loadTransport = async () => {
      try {
        setLoading(true);
        const item = await getProviderOfferingById(offeringId);
        if (!item) {
          setError('Transport listing not found.');
          return;
        }

        setName(item.name);
        setShortDescription(item.short_description || '');
        setDescription(item.description || '');
        setVehicleType(item.category || TRANSPORT_VEHICLE_TYPES[0]);
        setDistrict(item.district || 'Ranchi');
        setPrice(item.price ? String(item.price) : '');
        setCoverImage(item.cover_image || '');
        setGalleryText((item.gallery || []).join('\n'));
        setStatus(item.status);

        const meta = item.metadata || {};
        if (typeof meta.registration_number === 'string') setRegistrationNumber(meta.registration_number);
        if (meta.seating_capacity) setSeatingCapacity(String(meta.seating_capacity));
        if (typeof meta.service_routes === 'string') setServiceRoutes(meta.service_routes);
        if (typeof meta.driver_included === 'string') setDriverIncluded(meta.driver_included as any);
        if (typeof meta.ac_type === 'string') setAcType(meta.ac_type as any);
        if (typeof meta.pricing_model === 'string') setPricingModel(meta.pricing_model);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transport details.');
      } finally {
        setLoading(false);
      }
    };

    void loadTransport();
  }, [offeringId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a vehicle or service name.');
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
        vehicle_type: vehicleType,
        registration_number: registrationNumber.trim() || null,
        seating_capacity: seatingCapacity ? Number(seatingCapacity) : null,
        service_routes: serviceRoutes.trim() || null,
        driver_included: driverIncluded,
        ac_type: acType,
        pricing_model: pricingModel.trim() || null,
      };

      const payload = {
        kind: 'transport' as const,
        name: name.trim(),
        short_description: shortDescription.trim() || null,
        description: description.trim() || null,
        category: vehicleType,
        district,
        address: serviceRoutes.trim() || null,
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

      navigate('/provider/transport');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save transport service.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-ink-600">
        Loading transport details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/provider/transport">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Transport
          </Link>
        </Button>
      </div>

      <PageHeader
        eyebrow="Transport & Travel Provider"
        title={isEditing ? `Edit Vehicle: ${name}` : 'Add Transport / Vehicle Service'}
        description="List your tourist cab, SUV, tempo traveller, or travel transfer service."
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-5 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-ink-100 pb-3">
            1. Vehicle & Service Details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Service / Vehicle Name *
              </span>
              <Input
                placeholder="e.g. 7-Seater AC Innova Crysta for Ranchi-Netarhat Circuit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Vehicle Category
              </span>
              <Select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                {TRANSPORT_VEHICLE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Primary Operating District
              </span>
              <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Vehicle Registration / Plate No. (Optional)
              </span>
              <Input
                placeholder="e.g. JH-01-XX-XXXX"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Seating Capacity (Passengers)
              </span>
              <Input
                type="number"
                placeholder="6"
                value={seatingCapacity}
                onChange={(e) => setSeatingCapacity(e.target.value)}
              />
            </label>

            <label className="sm:col-span-2 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Popular Routes & Service Coverage
              </span>
              <Input
                placeholder="e.g. Birsa Munda Airport Transfer, Patratu Valley, Betla National Park Safari Transfer"
                value={serviceRoutes}
                onChange={(e) => setServiceRoutes(e.target.value)}
              />
            </label>

            <label className="sm:col-span-2 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Short Highlight
              </span>
              <Input
                placeholder="e.g. Experienced hills driver, sanitized vehicle, luggage carrier, toll assistance."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </label>

            <label className="sm:col-span-2 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Detailed Service Description
              </span>
              <Textarea
                placeholder="Mention vehicle amenities, driver experience, luggage space, safety features, and rental policies..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </label>
          </div>
        </Card>

        {/* Driver & Features */}
        <Card className="space-y-5 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-ink-100 pb-3">
            2. Comfort, Driver & Inclusions
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Driver Included?
              </span>
              <Select value={driverIncluded} onChange={(e) => setDriverIncluded(e.target.value as any)}>
                <option value="yes">Yes (Experienced Tourist Driver)</option>
                <option value="no">No (Self-Drive / Rental)</option>
                <option value="optional">Optional / On Request</option>
              </Select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Air Conditioning
              </span>
              <Select value={acType} onChange={(e) => setAcType(e.target.value as any)}>
                <option value="AC">Full AC</option>
                <option value="Non-AC">Non-AC</option>
                <option value="Both Available">AC / Non-AC Switchable</option>
              </Select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Pricing Model
              </span>
              <Input
                placeholder="e.g. Flat Day Rate / ₹14 per KM"
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value)}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Base Price (INR) *
              </span>
              <Input
                type="number"
                placeholder="3500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <span className="text-[11px] text-ink-500">Standard rate displayed to travellers</span>
            </label>
          </div>
        </Card>

        {/* Photos & Status */}
        <Card className="space-y-5 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-ink-100 pb-3">
            3. Vehicle Photos & Status
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
                Additional Gallery Photos (one per line)
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
                Publishing Status
              </span>
              <Select value={status} onChange={(e) => setStatus(e.target.value as ProviderOfferingStatus)}>
                <option value="published">Published (Visible on platform)</option>
                <option value="draft">Draft (Private)</option>
                <option value="archived">Archived</option>
              </Select>
            </label>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" asChild>
            <Link to="/provider/transport">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" />
            {saving ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Publish Transport Service'}
          </Button>
        </div>
      </form>
    </div>
  );
}
