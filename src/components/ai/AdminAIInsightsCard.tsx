import { useEffect, useState } from 'react';
import { CheckCircle2, Lightbulb, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { generateGovernmentInsights, type GovernmentAIInsight } from '../../services/ai/aiService';
import { useTranslation } from '../../i18n';
import { Badge, Card } from '../ui';

export function AdminAIInsightsCard({
  totalDestinations = 24,
  totalProviders = 18,
  totalOfferings = 42,
  pendingFeedbackCount = 3,
}: {
  totalDestinations?: number;
  totalProviders?: number;
  totalOfferings?: number;
  pendingFeedbackCount?: number;
}) {
  const { language, t } = useTranslation();
  const [insights, setInsights] = useState<GovernmentAIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function loadInsights() {
      setLoading(true);
      try {
        const res = await generateGovernmentInsights({
          totalDestinations,
          totalProviders,
          totalOfferings,
          pendingFeedbackCount,
          language,
        });
        if (alive) {
          setInsights(res);
        }
      } catch (err) {
        console.error('[Admin AI Insights] Error:', err);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadInsights();
    return () => {
      alive = false;
    };
  }, [totalDestinations, totalProviders, totalOfferings, pendingFeedbackCount, language]);

  return (
    <Card className="bg-[#FFFDF9] border border-amber-300/80 shadow-md p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-forest-900 text-amber-400 flex items-center justify-center shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-ink-950 flex items-center gap-2">
              <span>{t('admin.aiTitle', 'Tourism Intelligence & AI Insights')}</span>
              <Badge variant="accent" className="text-[10px] py-0.5">
                AI Governance
              </Badge>
            </h3>
            <p className="text-xs text-ink-500">
              {t('admin.aiSubtitle', 'Real-time analytics synthesis across 24 districts, provider growth, and visitor safety alerts')}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-forest-800 bg-forest-50 border border-forest-200 rounded-full px-2.5 py-0.5 self-start sm:self-auto">
          {t('admin.updatedToday', 'Updated Today')}
        </span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-ink-500 italic animate-pulse">
          {language === 'hi'
            ? 'जोहार एआई द्वारा वास्तविक समय जिला मेट्रिक्स का विश्लेषण किया जा रहा है...'
            : 'Synthesizing real-time district metrics with Johar AI...'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-4 text-xs space-y-2.5 transition-all ${
                item.urgency === 'high'
                  ? 'border-amber-300 bg-amber-50/70 text-amber-950'
                  : item.category === 'growth'
                    ? 'border-emerald-300 bg-emerald-50/60 text-emerald-950'
                    : 'border-ink-200 bg-white text-ink-900 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs leading-snug flex items-center gap-1.5">
                  {item.category === 'eco_alert' ? (
                    <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
                  ) : item.category === 'growth' ? (
                    <TrendingUp className="h-4 w-4 text-emerald-700 shrink-0" />
                  ) : (
                    <Lightbulb className="h-4 w-4 text-clay-700 shrink-0" />
                  )}
                  <span>{item.title}</span>
                </span>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase shrink-0 ${
                    item.urgency === 'high'
                      ? 'bg-amber-200 text-amber-950'
                      : 'bg-sand text-ink-700'
                  }`}
                >
                  {item.urgency} Priority
                </span>
              </div>

              <p className="text-xs text-ink-700 leading-relaxed">
                {item.insight}
              </p>

              <div className="pt-2 border-t border-black/5 text-[11px] font-medium text-forest-900 bg-forest-100/50 -mx-4 -mb-4 p-3 rounded-b-2xl flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-forest-700 shrink-0 mt-0.5" />
                <span>
                  <strong>{t('admin.recommendation', 'Recommendation:')}</strong> {item.actionRecommendation}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
