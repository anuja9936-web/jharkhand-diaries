import { useState } from 'react';
import { CheckCircle2, Send, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, Input } from '../../components/ui';
import { submitTouristFeedback } from '../../services/admin/adminGovernanceService';

export function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'destination' | 'platform' | 'culture' | 'other'>('destination');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    try {
      setSubmitting(true);
      await submitTouristFeedback({
        reporter_name: name.trim() || 'Anonymous Tourist',
        reporter_email: email.trim() || undefined,
        category:
          category === 'destination'
            ? 'destination_issue'
            : category === 'platform'
              ? 'service_complaint'
              : 'tourist_feedback',
        subject: `${category.toUpperCase()}: ${feedback.slice(0, 45)}...`,
        message: `${feedback.trim()} (Rating: ${rating}★)`,
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay-700">Community Voice</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Share Your Feedback
        </h1>
        <p className="mt-3 text-base text-ink-600">
          Help us showcase the natural beauty, cultural heritage, and travel experiences of Jharkhand.
        </p>
      </div>

      <Card className="mt-8 border-clay-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-md sm:p-8">
        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-ink-900">Dhanyawaad! Thank you for your feedback</h2>
            <p className="mx-auto max-w-md text-sm text-ink-600">
              Your insights help us continuously elevate the tourism experience for Jharkhand travellers worldwide.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Button asChild>
                <Link to="/">Return to Home</Link>
              </Button>
              <Button variant="secondary" onClick={() => { setSubmitted(false); setFeedback(''); }}>
                Submit Another Response
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
                  Your Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Ananya Roy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/80"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="e.g. ananya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/80"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
                Topic
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { value: 'destination', label: 'Destinations' },
                  { value: 'platform', label: 'Platform Experience' },
                  { value: 'culture', label: 'Culture & Heritage' },
                  { value: 'other', label: 'General / Suggestion' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCategory(item.value as typeof category)}
                    className={[
                      'rounded-xl border px-3 py-2 text-xs font-medium transition-all text-center',
                      category === item.value
                        ? 'border-clay-500 bg-clay-50 text-clay-800 shadow-sm'
                        : 'border-ink-200 bg-white/60 text-ink-600 hover:bg-white',
                    ].join(' ')}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
                Overall Experience Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    className="rounded-lg p-1 transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`Rate ${val} stars`}
                  >
                    <Star
                      className={[
                        'h-7 w-7',
                        val <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-ink-100 text-ink-300',
                      ].join(' ')}
                    />
                  </button>
                ))}
                <span className="ml-3 text-xs font-semibold text-ink-500">
                  {rating === 5 ? 'Exceptional' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : 'Needs improvement'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
                Your Thoughts & Suggestions *
              </label>
              <textarea
                required
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts about tourist spots, recommendations, or how we can improve..."
                className="w-full rounded-2xl border border-ink-300 bg-white/80 px-4 py-3 text-sm text-ink-900 shadow-sm transition placeholder:text-ink-400 focus:border-clay-500 focus:outline-none focus:ring-2 focus:ring-clay-200"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button asChild variant="ghost">
                <Link to="/">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting} className="inline-flex items-center gap-2 font-bold">
                <Send className="h-4 w-4" />
                {submitting ? 'Sending...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
