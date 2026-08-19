import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Badge, Button, Card, Input, Select } from '../../components/ui';
import { LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPathForRole } from '../../lib/auth';
import { siteConfig } from '../../config/site';
import type { UserRole } from '../../types/common';

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

const registrationRoles = [
  { label: 'Tourist', value: 'tourist' as const, description: 'Explore Jharkhand as a visitor.' },
  { label: 'Service Provider', value: 'provider' as const, description: 'Homestay, guide, transport, or local service.' },
];

export function RegisterPage() {
  const { user, role, loading, signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Extract<UserRole, 'tourist' | 'provider'>>('tourist');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const passwordStrengthHint = useMemo(() => 'Use at least 8 characters with a mix of letters and numbers.', []);

  useEffect(() => {
    setError(null);
  }, [fullName, email, password, confirmPassword, selectedRole]);

  if (loading) {
    return (
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-4xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
        <LoadingState label="Preparing account setup..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Please choose a password with at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await signUp({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      role: selectedRole,
    });
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setNotice(
      'Account created. If email confirmation is enabled on this Supabase project, please check your inbox before signing in.'
    );
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-6rem)] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Card className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <Badge variant="accent">Create account</Badge>
            <PageHeader
              eyebrow="Register"
              title={`Join ${siteConfig.platformName}`}
              description="Create a tourist or service provider account. Admin access is created manually later."
            />
          </div>
          <div className="grid gap-3 rounded-3xl bg-white p-5 text-sm leading-6 text-ink-700">
            {registrationRoles.map((item) => (
              <div key={item.value} className="rounded-2xl border border-ink-200 bg-sand/60 p-4">
                <div className="font-semibold text-ink-900">{item.label}</div>
                <div className="mt-1 text-ink-600">{item.description}</div>
              </div>
            ))}
          </div>
          <div className="text-sm text-ink-600">
            Already have an account?{' '}
            <Link className="font-semibold text-clay-700 hover:text-clay-800" to="/login">
              Sign in
            </Link>
          </div>
        </div>

        <form className="space-y-5 rounded-3xl border border-ink-200 bg-white p-5 sm:p-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-ink-900">Register</h2>
            <p className="text-sm text-ink-600">Choose the role that matches how you plan to use the platform.</p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
          ) : null}
          {notice ? (
            <div className="rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
              {notice}
            </div>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink-700">Full name</span>
            <Input
              autoComplete="name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your full name"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink-700">Email</span>
            <Input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink-700">Role</span>
            <Select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as typeof selectedRole)}>
              {registrationRoles.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink-700">Password</span>
            <Input
              autoComplete="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              required
            />
            <p className="text-xs text-ink-500">{passwordStrengthHint}</p>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink-700">Confirm password</span>
            <Input
              autoComplete="new-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              required
            />
          </label>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Register'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
