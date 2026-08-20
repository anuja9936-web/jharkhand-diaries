import { useState, useEffect, type FormEvent } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertTriangle, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import { Button, Card, Input } from '../../components/ui';
import { LoadingState } from '../../components/common/StateBlocks';
import { useAuth } from '../../hooks/useAuth';
import { getProfileByUserId } from '../../services/users/profileService';
import { normalizePersistedRole } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export function GovernmentLoginPage() {
  const navigate = useNavigate();
  const { user, role, loading, signIn, signOut, refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deniedNonAdmin, setDeniedNonAdmin] = useState(false);

  useEffect(() => {
    setError(null);
    setDeniedNonAdmin(false);
  }, [email, password]);

  if (loading) {
    return (
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-4xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
        <LoadingState label="Verifying government credentials..." />
      </div>
    );
  }

  // If already logged in as admin, redirect to admin dashboard
  if (user && role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setDeniedNonAdmin(false);

    if (!isValidEmail(email)) {
      setError('Please enter a valid official email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await signIn(email.trim(), password);

      if (result.error) {
        setSubmitting(false);
        setError(result.error);
        return;
      }

      // Check the newly signed-in user's role directly from database
      if (supabase) {
        const {
          data: { user: authedUser },
        } = await supabase.auth.getUser();

        if (authedUser) {
          const profile = await getProfileByUserId(authedUser.id);
          const resolvedRole = normalizePersistedRole(profile?.role);

          if (resolvedRole === 'admin') {
            await refreshProfile();
            setSubmitting(false);
            navigate('/admin/dashboard', { replace: true });
            return;
          } else {
            // Not an admin: sign out immediately and deny entry
            await signOut();
            setSubmitting(false);
            setDeniedNonAdmin(true);
            setError(
              'Access Denied: The account provided does not have Government Administrator privileges. This portal is strictly restricted to authorized tourism administration personnel.'
            );
            return;
          }
        }
      }

      setSubmitting(false);
    } catch (err: unknown) {
      console.error('[GOV_AUTH] Login error', err);
      setSubmitting(false);
      setError('An unexpected error occurred while verifying credentials. Please try again.');
    }
  };

  const handleSignOutCurrentAndRetry = async () => {
    await signOut();
    setDeniedNonAdmin(false);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-gradient-to-b from-[#0F1B14] via-[#15231B] to-[#0A120D] text-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-8">
        {/* Top Official Banner Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-forest-500/40 bg-forest-900/60 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-forest-300 shadow-inner">
            <Shield className="h-4 w-4 text-forest-400" />
            <span>GOVERNMENT OF JHARKHAND • OFFICIAL PORTAL</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-amber-400/50 bg-white/10 p-1 shadow-lg">
              <img
                src="/images/jharkhand-logo.png"
                alt="Government of Jharkhand Emblem"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Tourism Administration Portal
              </h1>
              <p className="text-xs sm:text-sm text-sand/80 font-medium">
                Department of Tourism, Arts, Culture, Sports &amp; Youth Affairs
              </p>
            </div>
          </div>
        </div>

        {/* If user is logged in as a non-admin (e.g. tourist/provider) */}
        {user && role !== 'admin' ? (
          <Card className="border border-red-500/30 bg-red-950/40 backdrop-blur-xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-red-500/20 p-3 text-red-400 border border-red-500/30 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-red-200">Unauthorized Session Detected</h3>
                <p className="text-sm text-sand/90 leading-relaxed">
                  You are currently signed in as <strong className="text-white">{user.email}</strong> with role{' '}
                  <span className="inline-block rounded-md bg-white/10 px-2 py-0.5 text-xs font-mono uppercase tracking-wider text-amber-300">
                    {role}
                  </span>
                  . This session does not have Government Administrator clearance.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleSignOutCurrentAndRetry}
                className="bg-red-700 hover:bg-red-800 text-white font-bold"
              >
                Sign Out &amp; Use Government Account
              </Button>
              <Button asChild variant="ghost" className="text-sand/80 hover:text-white hover:bg-white/10">
                <Link to="/">Return to Public Website</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="grid gap-8 border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-10 shadow-2xl lg:grid-cols-[1fr_1.1fr]">
            {/* Left Column: Official Notice & Protocol */}
            <div className="space-y-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/20">
                  <Lock className="h-3.5 w-3.5" />
                  <span>RESTRICTED ACCESS</span>
                </div>

                <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                  Departmental Access Verification
                </h2>

                <p className="text-xs sm:text-sm text-sand/80 leading-relaxed">
                  This console is dedicated to authorized officers for managing destination data, eco-tourism
                  regulations, safety advisories, district analytics, and service provider verifications.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs text-forest-200">
                    <CheckCircle2 className="h-4 w-4 text-forest-400 shrink-0" />
                    <span>State Tourism CMS &amp; Moderation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-forest-200">
                    <CheckCircle2 className="h-4 w-4 text-forest-400 shrink-0" />
                    <span>24 Districts Footfall &amp; Revenue Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-forest-200">
                    <CheckCircle2 className="h-4 w-4 text-forest-400 shrink-0" />
                    <span>Emergency Alerts &amp; Visitor Grievance Desk</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-sand/70 space-y-1">
                <p className="font-semibold text-white">Notice for Non-Government Users:</p>
                <p>
                  Tourists and Service Providers should sign in through the{' '}
                  <Link to="/login" className="text-amber-400 underline hover:text-amber-300">
                    Standard User Portal
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Right Column: Government Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Government Sign In</h3>
                <p className="text-xs text-sand/70">
                  Enter your assigned official departmental credentials to proceed.
                </p>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/40 bg-red-950/60 p-4 text-xs text-red-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-red-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{deniedNonAdmin ? 'Authorization Failed' : 'Authentication Error'}</span>
                  </div>
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-sand/90">Official Email ID</span>
                  <Input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="official@jharkhandtourism.gov.in"
                    required
                    className="bg-black/40 border-white/20 text-white placeholder:text-sand/40 focus:border-amber-400 focus:ring-amber-400"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-sand/90">Password</span>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter official password"
                    required
                    className="bg-black/40 border-white/20 text-white placeholder:text-sand/40 focus:border-amber-400 focus:ring-amber-400"
                  />
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-forest-600 hover:bg-forest-500 text-white font-bold py-3 text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-forest-500/25 transition-all"
                >
                  {submitting ? (
                    'Verifying Credentials...'
                  ) : (
                    <>
                      <Building2 className="h-4 w-4" />
                      <span>Verify &amp; Enter Administration Portal</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-[11px] text-sand/60">
                Authorized government personnel only. All access sessions are logged for security auditing.
              </p>
            </form>
          </Card>
        )}

        {/* Public Return Link */}
        <div className="text-center text-xs text-sand/60">
          <Link to="/" className="hover:text-white transition-colors underline">
            ← Return to Jharkhand Diaries Public Home
          </Link>
        </div>
      </div>
    </div>
  );
}
