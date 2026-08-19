import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Badge, Button, Card, Input } from '../../components/ui';
import { LoadingState } from '../../components/common/StateBlocks';
import { PageHeader } from '../../components/common/StateBlocks';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPathForRole } from '../../lib/auth';
import { siteConfig } from '../../config/site';

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export function LoginPage() {
  const { user, role, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [email, password]);

  if (loading) {
    return (
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-4xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
        <LoadingState label="Loading your account..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-6rem)] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Card className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <Badge variant="accent">Welcome back</Badge>
            <PageHeader
              eyebrow="Sign in"
              title={`Sign in to ${siteConfig.platformName}`}
              description="Continue with your Supabase account to access your role-specific dashboard and profile."
            />
          </div>
          <div className="grid gap-3 rounded-3xl bg-sand p-5 text-sm leading-6 text-ink-700">
            <div className="font-semibold text-ink-900">Protected access</div>
            <p>Your role is loaded from the Supabase profile that belongs to your account.</p>
          </div>
          <div className="text-sm text-ink-600">
            New here?{' '}
            <Link className="font-semibold text-clay-700 hover:text-clay-800" to="/register">
              Create an account
            </Link>
          </div>
        </div>

        <form className="space-y-5 rounded-3xl border border-ink-200 bg-white p-5 sm:p-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-ink-900">Login</h2>
            <p className="text-sm text-ink-600">Use your email and password to continue.</p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
          ) : null}

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
            <span className="text-sm font-medium text-ink-700">Password</span>
            <Input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
