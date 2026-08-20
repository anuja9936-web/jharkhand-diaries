import { useState, type FormEvent } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileText,
  Building2,
  Package,
  Compass,
  Sparkles,
  Car,
  Upload,
} from 'lucide-react';
import { Badge, Button, Card, Input, Textarea, Select } from '../../components/ui';
import { PageHeader } from '../../components/common/StateBlocks';
import { useAuth } from '../../hooks/useAuth';
import { submitProviderVerification } from '../../services/provider/providerMarketplaceService';
import { VERIFICATION_STATUS_LABELS } from '../../constants/provider';
import type { ProviderCapability } from '../../types/provider';

export function ProviderVerificationPage() {
  const { profile, refreshProfile } = useAuth();
  const currentStatus = profile?.verification_status ?? 'unverified';
  const currentDetails = (profile?.verification_details as Record<string, any>) || {};
  const statusConfig = VERIFICATION_STATUS_LABELS[currentStatus] ?? VERIFICATION_STATUS_LABELS.unverified;

  const capabilities = (profile?.provider_categories ?? []) as ProviderCapability[];

  // General Verification Fields
  const [legalName, setLegalName] = useState(currentDetails.legal_name || profile?.owner_name || profile?.full_name || '');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState(currentDetails.business_registration_number || '');
  const [aadhaarOrPan, setAadhaarOrPan] = useState(currentDetails.gov_id_number || '');
  const [contactPhone, setContactPhone] = useState(currentDetails.contact_phone || profile?.phone || '');
  const [operatingAddress, setOperatingAddress] = useState(currentDetails.operating_address || profile?.address || '');
  const [district, setDistrict] = useState(currentDetails.district || profile?.district || 'Ranchi');

  // Capability-Specific Fields
  const [homestayLicense, setHomestayLicense] = useState(currentDetails.homestay_license || '');
  const [propertyOwnershipType, setPropertyOwnershipType] = useState(currentDetails.property_ownership_type || 'Owned');
  const [artisanShgName, setArtisanShgName] = useState(currentDetails.artisan_shg_name || '');
  const [giTagAffiliation, setGiTagAffiliation] = useState(currentDetails.gi_tag_affiliation || '');
  const [guideLicenseId, setGuideLicenseId] = useState(currentDetails.guide_license_id || '');
  const [guideExperienceYears, setGuideExperienceYears] = useState(currentDetails.guide_experience_years || '3');
  const [adventureSafetyCert, setAdventureSafetyCert] = useState(currentDetails.adventure_safety_cert || '');
  const [transportCommercialPermit, setTransportCommercialPermit] = useState(currentDetails.transport_commercial_permit || '');
  const [documentUrls, setDocumentUrls] = useState(currentDetails.document_urls || '');

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!legalName.trim()) {
      setError('Please provide your legal name.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const verificationPayload = {
        legal_name: legalName.trim(),
        business_registration_number: businessRegistrationNumber.trim() || null,
        gov_id_number: aadhaarOrPan.trim() || null,
        contact_phone: contactPhone.trim() || null,
        operating_address: operatingAddress.trim() || null,
        district,
        homestay_license: homestayLicense.trim() || null,
        property_ownership_type: propertyOwnershipType,
        artisan_shg_name: artisanShgName.trim() || null,
        gi_tag_affiliation: giTagAffiliation.trim() || null,
        guide_license_id: guideLicenseId.trim() || null,
        guide_experience_years: guideExperienceYears,
        adventure_safety_cert: adventureSafetyCert.trim() || null,
        transport_commercial_permit: transportCommercialPermit.trim() || null,
        document_urls: documentUrls.trim() || null,
        submitted_at: new Date().toISOString(),
      };

      await submitProviderVerification(verificationPayload);
      await refreshProfile();
      setSuccessMessage(
        'Verification information submitted! Your details are now under review by Jharkhand Tourism administrators.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit verification.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasCapability = (cap: ProviderCapability) => capabilities.includes(cap);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Trust & Security"
        title="Provider Verification"
        description="Verify your tourism business, guide identity, artisan collective, or transport fleet to earn the Verified badge."
      />

      {/* Verification Status Banner */}
      <Card
        className={`relative overflow-hidden rounded-3xl border-2 p-6 shadow-sm ${
          currentStatus === 'verified'
            ? 'border-emerald-500 bg-emerald-50/50'
            : currentStatus === 'under_review'
            ? 'border-amber-500 bg-amber-50/50'
            : currentStatus === 'rejected'
            ? 'border-red-400 bg-red-50/50'
            : 'border-ink-200 bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                currentStatus === 'verified'
                  ? 'bg-emerald-600 text-white'
                  : currentStatus === 'under_review'
                  ? 'bg-amber-600 text-white'
                  : currentStatus === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-sand text-ink-700'
              }`}
            >
              {currentStatus === 'verified' ? (
                <ShieldCheck className="h-6 w-6" />
              ) : currentStatus === 'under_review' ? (
                <Clock className="h-6 w-6" />
              ) : (
                <ShieldAlert className="h-6 w-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-ink-900">
                  {statusConfig.label}
                </span>
                <Badge variant={statusConfig.badgeVariant}>
                  {currentStatus.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-ink-600 max-w-xl">
                {statusConfig.description}
              </p>
            </div>
          </div>

          {profile?.verification_submitted_at && (
            <div className="text-right text-xs text-ink-500">
              <span>Last Submitted:</span>
              <p className="font-medium text-ink-800">
                {new Date(profile.verification_submitted_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      </Card>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Identity */}
        <Card className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
            <FileText className="h-5 w-5 text-clay-700" />
            <h2 className="font-display text-lg font-bold text-ink-900">
              1. Business & Legal Identity
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Full Legal Name of Owner / Representative *
              </span>
              <Input
                placeholder="As per Government ID"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                required
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Govt ID / Aadhaar / PAN (Last 4 digits or ID)
              </span>
              <Input
                placeholder="XXXX-XXXX-1234 / ABCDE1234F"
                value={aadhaarOrPan}
                onChange={(e) => setAadhaarOrPan(e.target.value)}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Business / Enterprise Registration No. (Optional)
              </span>
              <Input
                placeholder="UDYAM / MSME / Trade License No."
                value={businessRegistrationNumber}
                onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Primary Contact Phone
              </span>
              <Input
                placeholder="+91 9XXXXXXXXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Operating District
              </span>
              <Input
                placeholder="Ranchi / Latehar / Khunti"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </label>

            <label className="sm:col-span-2 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Operating Business Address
              </span>
              <Input
                placeholder="Village / Road, Block / Landmark, District"
                value={operatingAddress}
                onChange={(e) => setOperatingAddress(e.target.value)}
              />
            </label>
          </div>
        </Card>

        {/* Adaptive Capability Requirements */}
        <Card className="space-y-5 p-5 sm:p-6">
          <div className="border-b border-ink-100 pb-3">
            <h2 className="font-display text-lg font-bold text-ink-900">
              2. Capability-Specific Verification
            </h2>
            <p className="mt-0.5 text-xs text-ink-600">
              Provide credentials matching your active service categories.
            </p>
          </div>

          <div className="space-y-6">
            {/* Accommodation fields */}
            {(hasCapability('accommodation') || capabilities.length === 0) && (
              <div className="rounded-2xl border border-ink-200 bg-sand/40 p-4 space-y-3">
                <div className="flex items-center gap-2 font-display text-sm font-bold text-ink-900">
                  <Building2 className="h-4 w-4 text-clay-700" />
                  Accommodation & Homestay Verification
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs text-ink-700 font-medium">Property Ownership</span>
                    <Select
                      value={propertyOwnershipType}
                      onChange={(e) => setPropertyOwnershipType(e.target.value)}
                    >
                      <option value="Owned">Owned by Host</option>
                      <option value="Leased">Leased / Managed</option>
                      <option value="Community / Tribal Trust">Community / Tribal Trust</option>
                    </Select>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs text-ink-700 font-medium">Homestay / Tourism Reg. No.</span>
                    <Input
                      placeholder="e.g. JTDC/HS/2024/..."
                      value={homestayLicense}
                      onChange={(e) => setHomestayLicense(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Artisan fields */}
            {(hasCapability('artisan') || capabilities.length === 0) && (
              <div className="rounded-2xl border border-ink-200 bg-sand/40 p-4 space-y-3">
                <div className="flex items-center gap-2 font-display text-sm font-bold text-ink-900">
                  <Package className="h-4 w-4 text-clay-700" />
                  Artisan & Craft Producer Verification
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs text-ink-700 font-medium">Artisan Card / SHG Name</span>
                    <Input
                      placeholder="e.g. Jharcraft Artisan Card / Mahila SHG"
                      value={artisanShgName}
                      onChange={(e) => setArtisanShgName(e.target.value)}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs text-ink-700 font-medium">GI-Tag / Craft Tradition Affiliation</span>
                    <Input
                      placeholder="e.g. Sohrai-Khovar Art Collective"
                      value={giTagAffiliation}
                      onChange={(e) => setGiTagAffiliation(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Guide fields */}
            {(hasCapability('guide') || capabilities.length === 0) && (
              <div className="rounded-2xl border border-ink-200 bg-sand/40 p-4 space-y-3">
                <div className="flex items-center gap-2 font-display text-sm font-bold text-ink-900">
                  <Compass className="h-4 w-4 text-clay-700" />
                  Guide & Tour Operator Credentials
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs text-ink-700 font-medium">Tour Guide License / Badge No.</span>
                    <Input
                      placeholder="e.g. JTDC-GUIDE-889"
                      value={guideLicenseId}
                      onChange={(e) => setGuideLicenseId(e.target.value)}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs text-ink-700 font-medium">Guiding Experience (Years)</span>
                    <Input
                      type="number"
                      placeholder="3"
                      value={guideExperienceYears}
                      onChange={(e) => setGuideExperienceYears(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Adventure fields */}
            {(hasCapability('adventure') || capabilities.length === 0) && (
              <div className="rounded-2xl border border-ink-200 bg-sand/40 p-4 space-y-3">
                <div className="flex items-center gap-2 font-display text-sm font-bold text-ink-900">
                  <Sparkles className="h-4 w-4 text-clay-700" />
                  Adventure Safety & Equipment Compliance
                </div>
                <label className="block space-y-1">
                  <span className="text-xs text-ink-700 font-medium">Safety Training / Mountaineering / First Aid Certificate</span>
                  <Input
                    placeholder="e.g. Certified Mountaineering Course (NIM/HMI) / CPR Trained"
                    value={adventureSafetyCert}
                    onChange={(e) => setAdventureSafetyCert(e.target.value)}
                  />
                </label>
              </div>
            )}

            {/* Transport fields */}
            {(hasCapability('transport') || capabilities.length === 0) && (
              <div className="rounded-2xl border border-ink-200 bg-sand/40 p-4 space-y-3">
                <div className="flex items-center gap-2 font-display text-sm font-bold text-ink-900">
                  <Car className="h-4 w-4 text-clay-700" />
                  Transport & Commercial Permits
                </div>
                <label className="block space-y-1">
                  <span className="text-xs text-ink-700 font-medium">Commercial Permit / Tourist Cab License No.</span>
                  <Input
                    placeholder="e.g. All Jharkhand Tourist Vehicle Permit No."
                    value={transportCommercialPermit}
                    onChange={(e) => setTransportCommercialPermit(e.target.value)}
                  />
                </label>
              </div>
            )}
          </div>
        </Card>

        {/* Document Links */}
        <Card className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
            <Upload className="h-5 w-5 text-clay-700" />
            <h2 className="font-display text-lg font-bold text-ink-900">
              3. Supporting Document URLs
            </h2>
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
              Document Cloud Storage / Drive Links (one per line)
            </span>
            <Textarea
              placeholder="Paste Google Drive, Dropbox, or public image links for your certificates/licenses..."
              value={documentUrls}
              onChange={(e) => setDocumentUrls(e.target.value)}
              rows={3}
            />
            <span className="text-[11px] text-ink-500">
              Make sure link permissions are set to "Anyone with link can view".
            </span>
          </label>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={submitting}>
            <ShieldCheck className="mr-1.5 h-4 w-4" />
            {submitting ? 'Submitting...' : 'Submit Verification for Review'}
          </Button>
        </div>
      </form>
    </div>
  );
}
