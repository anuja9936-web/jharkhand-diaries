import { useEffect, useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input } from '../../components/ui';
import { ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../i18n';
import { updateProfile } from '../../services/users/profileService';
import { Sparkles, Check } from 'lucide-react';

const INTEREST_OPTIONS = [
  { id: 'Nature', label: 'Nature & Waterfalls', emoji: '🌿' },
  { id: 'Culture', label: 'Tribal Culture & Arts', emoji: '🥁' },
  { id: 'Adventure', label: 'Adventure & Treks', emoji: '⛺' },
  { id: 'Heritage', label: 'Heritage & Forts', emoji: '🏛️' },
  { id: 'Wildlife', label: 'Wildlife & Sanctuaries', emoji: '🐅' },
  { id: 'Spiritual', label: 'Spiritual & Sacred', emoji: '🛕' },
  { id: 'Crafts', label: 'Sohrai & Handicrafts', emoji: '🎨' },
  { id: 'Food', label: 'Local Food & Cuisine', emoji: '🍲' },
];

export function TouristProfilePage() {
  const { profile, loading, refreshProfile } = useAuth();
  const { language, t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tourist Preferences State
  const [preferredInterests, setPreferredInterests] = useState<string[]>([]);
  const [preferredBudget, setPreferredBudget] = useState<'budget' | 'moderate' | 'premium'>('moderate');
  const [preferredTravelStyle, setPreferredTravelStyle] = useState<'relaxed' | 'balanced' | 'adventure'>('balanced');
  const [prefSavedMsg, setPrefSavedMsg] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
  }, [profile?.full_name]);

  // Load stored preferences
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tourist_travel_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.preferredInterests)) setPreferredInterests(parsed.preferredInterests);
        if (parsed.preferredBudget) setPreferredBudget(parsed.preferredBudget);
        if (parsed.preferredTravelStyle) setPreferredTravelStyle(parsed.preferredTravelStyle);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleToggleInterest = (intId: string) => {
    setPreferredInterests((prev) =>
      prev.includes(intId) ? prev.filter((i) => i !== intId) : [...prev, intId]
    );
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(
        'tourist_travel_preferences',
        JSON.stringify({
          preferredInterests,
          preferredBudget,
          preferredTravelStyle,
        })
      );
      setPrefSavedMsg(true);
      setTimeout(() => setPrefSavedMsg(false), 3000);
    } catch {
      // Ignore
    }
  };

  if (loading) {
    return <LoadingState label="Loading your profile..." />;
  }

  if (!profile) {
    return <ErrorState title="Profile not available" message="We could not load your profile right now." />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile(profile.id, {
        full_name: fullName.trim() || null,
      });
      await refreshProfile();
      setSuccess(language === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई।' : 'Profile updated successfully.');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        eyebrow={language === 'hi' ? 'पर्यटक प्रोफ़ाइल' : 'Tourist profile'}
        title={language === 'hi' ? 'मेरी प्रोफ़ाइल एवं प्राथमिकताएं' : 'My profile & Travel Preferences'}
        description={
          language === 'hi'
            ? 'अपनी पहचान एवं एआई यात्रा सहायक प्राथमिकताओं को अनुकूलित करें।'
            : 'Manage your personal profile and customize your Johar AI recommendations.'
        }
      />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Account Details Form */}
        <Card className="space-y-5 bg-[#FFFDF9] border border-ink-200 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink-900">
                {language === 'hi' ? 'खाता विवरण' : 'Account Details'}
              </h2>
              <p className="mt-0.5 text-xs text-ink-600">
                {language === 'hi' ? 'केवल आपका नाम बदला जा सकता है।' : 'Your public display name on reviews and bookings.'}
              </p>
            </div>
            <Badge variant="accent">{profile.role}</Badge>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-xl border border-forest-200 bg-forest-50 px-3.5 py-2.5 text-xs text-forest-800 flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                <span>{success}</span>
              </div>
            ) : null}

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-ink-700">{language === 'hi' ? 'पूरा नाम' : 'Full Name'}</span>
              <Input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                className="text-xs"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-ink-700">Email</span>
              <Input value={profile.email ?? ''} disabled className="text-xs bg-ink-50" />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-xl bg-sand/60 p-3 border border-ink-200/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-clay-700">Role</p>
                <p className="mt-1 text-sm font-bold text-ink-900 capitalize">{profile.role}</p>
              </div>
              <div className="rounded-xl bg-sand/60 p-3 border border-ink-200/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-clay-700">Joined</p>
                <p className="mt-1 text-sm font-bold text-ink-900">
                  {new Date(profile.created_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN')}
                </p>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full bg-forest-900 text-white font-bold text-xs">
              {saving ? 'Saving...' : language === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}
            </Button>
          </form>
        </Card>

        {/* AI Travel Preferences Card (Part 10) */}
        <Card className="space-y-5 bg-[#FFFDF9] border border-amber-300 shadow-md">
          <div className="flex items-center justify-between border-b border-ink-200/70 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-forest-900 text-amber-400 flex items-center justify-center shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink-950">
                  {t('tourist.preferencesTitle', 'AI Travel Preferences')}
                </h2>
                <p className="text-[11px] text-ink-500">
                  {t('tourist.preferencesSubtitle', 'Used to personalize your Johar AI recommendations')}
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-200">
              Optional
            </span>
          </div>

          {prefSavedMsg && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-900 font-bold flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-700" />
              <span>{t('tourist.preferencesSaved', 'Preferences updated successfully!')}</span>
            </div>
          )}

          {/* 1. Preferred Interests */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-ink-800 uppercase tracking-wider block">
              {language === 'hi' ? 'पसंदीदा रुचियां' : 'Preferred Interests'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_OPTIONS.map((int) => {
                const selected = preferredInterests.includes(int.id);
                return (
                  <button
                    key={int.id}
                    type="button"
                    onClick={() => handleToggleInterest(int.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                      selected
                        ? 'bg-clay-700 text-white shadow-2xs'
                        : 'bg-sand/60 text-ink-700 hover:bg-sand border border-ink-200/60'
                    }`}
                  >
                    <span>{int.emoji}</span>
                    <span>{int.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Preferred Budget Tier */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-ink-800 uppercase tracking-wider block">
              {language === 'hi' ? 'पसंदीदा बजट स्तर' : 'Preferred Budget Tier'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'budget', label: language === 'hi' ? 'किफायती' : 'Budget' },
                { id: 'moderate', label: language === 'hi' ? 'मध्यम' : 'Moderate' },
                { id: 'premium', label: language === 'hi' ? 'प्रीमियम' : 'Premium' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setPreferredBudget(b.id as any)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    preferredBudget === b.id
                      ? 'bg-forest-900 text-white shadow-xs'
                      : 'bg-sand/60 text-ink-700 hover:bg-sand border border-ink-200/60'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Travel Style */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-ink-800 uppercase tracking-wider block">
              {language === 'hi' ? 'यात्रा की गति / शैली' : 'Travel Style & Pace'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'relaxed', label: language === 'hi' ? 'शांत एवं धीमा' : 'Relaxed' },
                { id: 'balanced', label: language === 'hi' ? 'संतुलित' : 'Balanced' },
                { id: 'adventure', label: language === 'hi' ? 'रोमांचक' : 'Adventure' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setPreferredTravelStyle(s.id as any)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    preferredTravelStyle === s.id
                      ? 'bg-forest-900 text-white shadow-xs'
                      : 'bg-sand/60 text-ink-700 hover:bg-sand border border-ink-200/60'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-ink-200/70">
            <span className="text-[11px] text-ink-500 italic">
              {language === 'hi' ? 'आप इसे कभी भी बदल सकते हैं।' : 'You can update or clear this anytime.'}
            </span>
            <Button
              type="button"
              onClick={handleSavePreferences}
              className="bg-forest-900 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs"
            >
              {t('tourist.savePreferences', 'Save Travel Preferences')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
