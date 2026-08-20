import { useState } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button, Card } from '../ui';
import { ProviderCapabilitySelector } from './ProviderCapabilitySelector';
import { updateProviderCapabilities } from '../../services/provider/providerMarketplaceService';
import { useAuth } from '../../hooks/useAuth';
import type { ProviderCapability } from '../../types/provider';

interface ProviderOnboardingCardProps {
  onComplete?: () => void;
  canDismiss?: boolean;
}

export function ProviderOnboardingCard({
  onComplete,
  canDismiss = false,
}: ProviderOnboardingCardProps) {
  const { profile, refreshProfile } = useAuth();
  const current = (profile?.provider_categories ?? []) as ProviderCapability[];

  const [selected, setSelected] = useState<ProviderCapability[]>(current);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (selected.length === 0) {
      setError('Please select at least one service type.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateProviderCapabilities(selected);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => {
        onComplete?.();
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update capabilities.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center sm:text-left space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-xs font-semibold text-clay-800">
            <Sparkles className="h-3.5 w-3.5 text-clay-700" />
            Provider Onboarding
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
            Tell us what you provide
          </h1>
          <p className="text-sm leading-relaxed text-ink-600 sm:text-base max-w-2xl">
            Select the services you offer on Jharkhand Diaries. You can select more than one and change these later.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:text-sm text-emerald-800 font-medium">
            <Check className="h-4 w-4 text-emerald-700" />
            Your services have been saved! Customizing your workspace...
          </div>
        )}

        {/* 5 Selectable Cards */}
        <ProviderCapabilitySelector
          selected={selected}
          onChange={(newSelected) => {
            setSelected(newSelected);
            if (newSelected.length > 0 && error) {
              setError(null);
            }
          }}
          disabled={saving}
        />

        {/* Bottom validation & Continue CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-ink-100">
          <div className="text-xs text-ink-500">
            {selected.length === 0 ? (
              <span className="text-amber-700 font-medium">
                Please select at least one service type to continue.
              </span>
            ) : (
              <span>
                {selected.length} {selected.length === 1 ? 'service' : 'services'} selected. You can modify this anytime in Settings.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {canDismiss && onComplete && (
              <Button
                type="button"
                variant="ghost"
                onClick={onComplete}
                disabled={saving}
                size="lg"
                className="font-semibold text-ink-600 hover:text-ink-900"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving || selected.length === 0}
              size="lg"
              className="w-full sm:w-auto font-bold px-8 shadow-sm"
            >
              {saving ? 'Saving...' : success ? 'Saved!' : 'Continue'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
