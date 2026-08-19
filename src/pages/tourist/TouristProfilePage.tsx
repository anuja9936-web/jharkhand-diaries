import { useEffect, useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input } from '../../components/ui';
import { ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { useAuth } from '../../hooks/useAuth';
import { formatIndianCurrency } from '../../lib/utils';
import { updateProfile } from '../../services/users/profileService';

export function TouristProfilePage() {
  const { profile, loading, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
  }, [profile?.full_name]);

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
      setSuccess('Profile updated successfully.');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tourist profile"
        title="My profile"
        description="Manage the identity that appears across your tourist dashboard and saved activity."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink-900">Account details</h2>
              <p className="mt-1 text-sm text-ink-600">Only your display name can be edited for now.</p>
            </div>
            <Badge variant="accent">{profile.role}</Badge>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
            {success ? (
              <div className="rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
                {success}
              </div>
            ) : null}

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Full name</span>
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700">Email</span>
              <Input value={profile.email ?? ''} disabled />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="bg-sand">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-700">Role</p>
                <p className="mt-2 text-lg font-semibold text-ink-900">{profile.role}</p>
              </Card>
              <Card className="bg-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-700">Joined</p>
                <p className="mt-2 text-lg font-semibold text-ink-900">
                  {new Date(profile.created_at).toLocaleDateString('en-IN')}
                </p>
              </Card>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save profile'}
            </Button>
          </form>
        </Card>

        <Card className="space-y-4 bg-sand/70">
          <h2 className="text-xl font-semibold text-ink-900">What is protected</h2>
          <ul className="space-y-3 text-sm leading-6 text-ink-700">
            <li>Your role stays controlled by the backend and cannot be changed here.</li>
            <li>Your Supabase auth identity stays linked to your account ID.</li>
            <li>Only the personal display fields are editable from this screen.</li>
          </ul>
          <Card className="bg-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-700">Travel budget example</p>
            <p className="mt-2 text-lg font-semibold text-ink-900">{formatIndianCurrency(2500)}</p>
            <p className="mt-1 text-sm text-ink-600">Illustrative formatting used across the dashboard.</p>
          </Card>
        </Card>
      </div>
    </div>
  );
}

