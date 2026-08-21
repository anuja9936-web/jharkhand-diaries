import { useEffect, useState } from 'react';
import {
  Leaf,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  HeartHandshake,
} from 'lucide-react';
import { Badge, Card } from '../../components/ui';
import { LoadingState, ErrorState } from '../../components/common/StateBlocks';
import { getTouristEcoSummary, type EcoPointsSummary, ECO_TIERS } from '../../services/tourist/ecoPointsService';

export function TouristEcoPassportPage() {
  const [summary, setSummary] = useState<EcoPointsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function loadEcoData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getTouristEcoSummary();
        if (alive) {
          setSummary(data);
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Unable to load eco passport.');
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadEcoData();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return <LoadingState label="Loading your Jharkhand Eco Passport..." />;
  }

  if (error || !summary) {
    return <ErrorState title="Eco Passport Unavailable" message={error || 'Unable to load eco metrics.'} />;
  }

  const { totalPoints, currentTier, nextTier, progressPercent, pointsToNextTier, activities, badges } = summary;

  return (
    <div className="space-y-10 pb-16 font-sans">
      {/* Hero Badge Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-ink-950 to-emerald-950 p-6 sm:p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-forest-400/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-forest-300 border border-forest-400/30">
              <Leaf className="h-3.5 w-3.5" />
              <span>SUSTAINABLE TOURISM REWARDS</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Your Jharkhand Eco-Passport
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Earn Eco-Points by respecting nature, staying in solar-powered tribal homestays, and empowering local artisan guilds across Jharkhand’s 24 districts.
            </p>
          </div>

          {/* Current Tier Highlight Box */}
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white/10 p-6 backdrop-blur-md border border-white/20 text-center min-w-[240px] shadow-lg">
            <span className="text-4xl">{currentTier.badge}</span>
            <div className="mt-2 text-2xl font-black text-white">{totalPoints}</div>
            <p className="text-xs font-bold uppercase tracking-wider text-forest-300">Total Eco Points</p>
            <Badge variant="accent" className="mt-3 bg-white text-ink-900 font-bold text-xs">
              {currentTier.name}
            </Badge>
            <p className="mt-1 text-[11px] text-white/70">{currentTier.hindiName}</p>
          </div>
        </div>

        {/* Tier Progress Bar */}
        {nextTier && (
          <div className="relative z-10 mt-8 pt-6 border-t border-white/15 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-white/90">
              <span>Current: <strong>{currentTier.name}</strong></span>
              <span>Next: <strong>{nextTier.name}</strong> ({pointsToNextTier} pts remaining)</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-forest-300 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tier Roadmap Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">Eco-Tier Progression</h2>
          <p className="text-xs text-ink-600">Unlock greater community privileges and cultural perks as you explore</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ECO_TIERS.map((tier) => {
            const isAchieved = totalPoints >= tier.minPoints;
            const isCurrent = currentTier.name === tier.name;

            return (
              <Card
                key={tier.name}
                className={[
                  'p-5 space-y-3 relative transition-all duration-300',
                  isCurrent
                    ? 'border-2 border-forest-600 bg-forest-50/50 shadow-md'
                    : isAchieved
                    ? 'border-ink-200 bg-white'
                    : 'border-ink-100 bg-sand/30 opacity-75',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{tier.badge}</span>
                  {isCurrent ? (
                    <Badge variant="success" className="text-[10px] uppercase font-bold">Active</Badge>
                  ) : isAchieved ? (
                    <CheckCircle2 className="h-4 w-4 text-forest-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-ink-400" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-ink-900">{tier.name}</h3>
                  <p className="text-[11px] text-ink-600 font-medium">{tier.minPoints} - {tier.maxPoints} pts</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-ink-100">
                  {tier.perks.map((perk) => (
                    <div key={perk} className="flex items-start gap-1.5 text-[11px] text-ink-700">
                      <Sparkles className="mt-0.5 h-3 w-3 text-clay-600 shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Badges Collection */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">Sustainability Badges &amp; Achievements</h2>
          <p className="text-xs text-ink-600">Collectible badges for eco-conscious adventures and cultural stewardship</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => (
            <Card
              key={badge.id}
              className={[
                'p-5 flex items-start gap-4 transition-all',
                badge.unlocked
                  ? 'border-forest-200 bg-white shadow-xs hover:border-forest-400'
                  : 'border-ink-200/80 bg-sand/20 opacity-70',
              ].join(' ')}
            >
              <div
                className={[
                  'h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs',
                  badge.unlocked ? 'bg-forest-100 border border-forest-300' : 'bg-ink-100 text-ink-400',
                ].join(' ')}
              >
                {badge.icon}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-ink-900">{badge.title}</h3>
                  {badge.unlocked ? (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">Unlocked</Badge>
                  ) : (
                    <span className="text-[10px] font-bold text-ink-500">{badge.pointsRequirement} pts req.</span>
                  )}
                </div>
                <p className="text-xs text-ink-600 leading-relaxed">{badge.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Activity Timeline */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">Eco-Points Activity History</h2>
          <p className="text-xs text-ink-600">Verified actions that contributed to your sustainability score</p>
        </div>

        <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-xs divide-y divide-ink-100">
          {activities.map((act) => (
            <div key={act.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-ink-900">{act.title}</h4>
                  <p className="text-xs text-ink-600">{act.description}</p>
                  <span className="text-[10px] text-ink-500">{act.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Badge variant="success" className="font-bold text-xs">
                  +{act.points} pts
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sustainable Travel Principles Banner */}
      <div className="rounded-3xl bg-sand/60 border border-clay-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-clay-700">
          <HeartHandshake className="h-4 w-4" />
          <span>Sustainable Tourism Pledge</span>
        </div>
        <h3 className="font-display text-xl font-bold text-ink-900">
          How to Maximize Your Eco-Points in Jharkhand
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2 text-xs text-ink-700 leading-relaxed">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-forest-600 shrink-0" />
            <span>Stay in certified solar-powered rural homestays in Latehar, Netarhat &amp; Patratu.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-forest-600 shrink-0" />
            <span>Support GI-tagged Sohrai &amp; Dokra artisan clusters directly without middleman markups.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-forest-600 shrink-0" />
            <span>Follow Leave-No-Trace principles around Dassam, Hundru, and Lodh waterfall basins.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-forest-600 shrink-0" />
            <span>Hire certified local tribal guides who share oral folk histories and nature wisdom.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
