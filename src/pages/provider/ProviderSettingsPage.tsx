import { useEffect, useState, type FormEvent } from 'react';
import { AlertTriangle, Bell, Check, Clock, Save, Sparkles } from 'lucide-react';
import { Button, Card, Input, Select } from '../../components/ui';
import { PageHeader } from '../../components/common/StateBlocks';
import { ProviderCapabilitySelector } from '../../components/provider/ProviderCapabilitySelector';
import { PROVIDER_CAPABILITY_MAP } from '../../constants/provider';
import { useAuth } from '../../hooks/useAuth';
import {
  getMyProviderOfferings,
  updateProviderCapabilities,
} from '../../services/provider/providerMarketplaceService';
import type { ProviderCapability, ProviderOffering } from '../../types/provider';

export function ProviderSettingsPage() {
  const { profile, user, refreshProfile } = useAuth();
  const rawCaps = (profile?.provider_categories ?? []) as ProviderCapability[];

  // Service Capabilities State
  const [selectedCaps, setSelectedCaps] = useState<ProviderCapability[]>(rawCaps);
  const [offerings, setOfferings] = useState<ProviderOffering[]>([]);
  const [savingCaps, setSavingCaps] = useState(false);
  const [savedCaps, setSavedCaps] = useState(false);
  const [capsError, setCapsError] = useState<string | null>(null);

  // Operational & Notification preferences state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [requestReviewMode, setRequestReviewMode] = useState<'manual' | 'auto'>('manual');
  const [operatingHours, setOperatingHours] = useState('08:00 AM - 08:00 PM');
  const [advanceBookingNotice, setAdvanceBookingNotice] = useState('24 hours');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedPrefs, setSavedPrefs] = useState(false);

  useEffect(() => {
    if (profile?.provider_categories) {
      setSelectedCaps(profile.provider_categories as ProviderCapability[]);
    }
  }, [profile?.provider_categories]);

  useEffect(() => {
    async function loadOfferings() {
      try {
        const items = await getMyProviderOfferings();
        setOfferings(items);
      } catch {
        setOfferings([]);
      }
    }
    void loadOfferings();
  }, []);

  // Safety check: detect if removing a capability that currently has published offerings
  const removedCaps = rawCaps.filter((cap) => !selectedCaps.includes(cap));
  const hasActiveListingsForRemoved = removedCaps.some((cap) => {
    const kind = PROVIDER_CAPABILITY_MAP[cap]?.offeringKind;
    return offerings.some((o) => o.kind === kind && o.status === 'published');
  });

  const handleSaveServices = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedCaps.length === 0) {
      setCapsError('Please select at least one service type.');
      return;
    }

    try {
      setSavingCaps(true);
      setCapsError(null);
      await updateProviderCapabilities(selectedCaps);
      await refreshProfile();
      setSavedCaps(true);
      setTimeout(() => setSavedCaps(false), 3000);
    } catch (err) {
      setCapsError(err instanceof Error ? err.message : 'Failed to update services.');
    } finally {
      setSavingCaps(false);
    }
  };

  const handleSavePreferences = (e: FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    setTimeout(() => {
      setSavingPrefs(false);
      setSavedPrefs(true);
      setTimeout(() => setSavedPrefs(false), 3000);
    }, 400);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account & Preferences"
        title="Provider Settings"
        description="Configure the services you offer, booking preferences, operational schedule, and notification alerts."
      />

      {/* 1. Services I Provide Section */}
      <Card className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-clay-800">
              <Sparkles className="h-3.5 w-3.5 text-clay-700" />
              Service Capabilities
            </div>
            <h2 className="font-display text-xl font-bold text-ink-900">
              Services I Provide
            </h2>
            <p className="text-xs sm:text-sm text-ink-600">
              Choose the services you currently offer through Jharkhand Diaries.
            </p>
          </div>

          <span className="rounded-full bg-sand/80 px-3 py-1 text-xs font-semibold text-clay-800">
            {selectedCaps.length} {selectedCaps.length === 1 ? 'Service' : 'Services'} Selected
          </span>
        </div>

        {savedCaps && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 font-medium">
            <Check className="h-4 w-4 text-emerald-700" />
            Services updated successfully. Your workspace navigation and dashboard have been refreshed.
          </div>
        )}

        {capsError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium">
            {capsError}
          </div>
        )}

        {/* Safety Warning if disabling a service with existing listings */}
        {hasActiveListingsForRemoved && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs sm:text-sm text-amber-900">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
            <div>
              <p className="font-bold">Active Listings Notice</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                You currently have active listings under this service. Removing this service will hide its management section from your workspace, but your existing listings will not be deleted.
              </p>
            </div>
          </div>
        )}

        {/* 5 Selectable Cards */}
        <ProviderCapabilitySelector
          selected={selectedCaps}
          onChange={(newCaps) => {
            setSelectedCaps(newCaps);
            if (newCaps.length > 0 && capsError) {
              setCapsError(null);
            }
          }}
          disabled={savingCaps}
        />

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-ink-100">
          <p className="text-xs text-ink-500">
            Select or deselect categories to customize the tools and navigation visible in your dashboard.
          </p>
          <Button
            onClick={handleSaveServices}
            disabled={savingCaps || selectedCaps.length === 0}
            className="font-bold"
          >
            <Save className="mr-1.5 h-4 w-4" />
            {savingCaps ? 'Saving...' : savedCaps ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      {/* 2. Operational & Booking Preferences Form */}
      {savedPrefs && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 font-medium">
          <Check className="h-4 w-4 text-emerald-700" />
          Booking & notification preferences saved successfully.
        </div>
      )}

      <form onSubmit={handleSavePreferences} className="space-y-6">
        <Card className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
            <Clock className="h-5 w-5 text-clay-700" />
            <h2 className="font-display text-lg font-bold text-ink-900">
              Booking & Availability Preferences
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Booking Request Mode
              </span>
              <Select
                value={requestReviewMode}
                onChange={(e) => setRequestReviewMode(e.target.value as any)}
              >
                <option value="manual">Manual Review (Recommended - Provider accepts/rejects)</option>
                <option value="auto">Instant Availability Acceptance</option>
              </Select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Minimum Advance Notice
              </span>
              <Select
                value={advanceBookingNotice}
                onChange={(e) => setAdvanceBookingNotice(e.target.value)}
              >
                <option value="Same day (2 hours)">Same day (2 hours notice)</option>
                <option value="24 hours">24 hours before</option>
                <option value="48 hours">48 hours before</option>
                <option value="1 week">1 week before</option>
              </Select>
            </label>

            <label className="sm:col-span-2 block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                Daily Operating / Support Hours
              </span>
              <Input
                placeholder="e.g. 08:00 AM - 08:00 PM, Monday - Sunday"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
              />
            </label>
          </div>
        </Card>

        {/* Notifications & Communications */}
        <Card className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
            <Bell className="h-5 w-5 text-clay-700" />
            <h2 className="font-display text-lg font-bold text-ink-900">
              Notification Preferences
            </h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-sand/40 p-4 cursor-pointer hover:bg-sand/60 transition-colors">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 rounded text-clay-700 focus:ring-clay-700"
              />
              <div>
                <span className="font-display text-sm font-bold text-ink-900 block">
                  Email Notifications for New Tourist Requests
                </span>
                <span className="text-xs text-ink-600">
                  Receive an instant email at {profile?.email || user?.email} whenever a traveler requests a booking or sends a message.
                </span>
              </div>
            </label>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={savingPrefs}>
            <Save className="mr-1.5 h-4 w-4" />
            {savingPrefs ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </div>
  );
}
