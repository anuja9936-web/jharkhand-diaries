import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Sparkles, Calendar, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/ui';
import { LoadingState, EmptyState } from '../../components/common/StateBlocks';
import {
  getTouristNotifications,
  markTouristNotificationAsRead,
  markAllTouristNotificationsAsRead,
  type TouristNotification,
} from '../../services/tourist/touristNotificationService';

export function TouristNotificationsPage() {
  const [notifications, setNotifications] = useState<TouristNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const loadNotifs = async () => {
    try {
      setLoading(true);
      const data = await getTouristNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    await markTouristNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await markAllTouristNotificationsAsRead(notifications);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedNotifs =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-ink-950 via-forest-950 to-clay-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest-300 border border-forest-500/30">
            <Bell className="h-3.5 w-3.5" />
            <span>NOTIFICATIONS CENTER</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Travel Alerts &amp; Updates
          </h1>
          <p className="text-xs sm:text-sm text-white/80">
            Real-time updates on your booking requests, trip plans, and eco-passport achievements.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-ink-200 pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={[
              'rounded-full px-4 py-1.5 text-xs font-bold transition',
              filter === 'all'
                ? 'bg-forest-900 text-white'
                : 'bg-[#FFFDF9] text-ink-700 border border-ink-200 hover:bg-sand',
            ].join(' ')}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={[
              'rounded-full px-4 py-1.5 text-xs font-bold transition',
              filter === 'unread'
                ? 'bg-forest-900 text-white'
                : 'bg-[#FFFDF9] text-ink-700 border border-ink-200 hover:bg-sand',
            ].join(' ')}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notification List */}
      {loading ? (
        <LoadingState label="Checking for updates..." />
      ) : displayedNotifs.length === 0 ? (
        <EmptyState
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          message={
            filter === 'unread'
              ? 'You have caught up with all your booking updates and trip alerts.'
              : 'As you request homestays, curate trips, and earn eco badges, updates will appear here.'
          }
          actionLabel="Explore Destinations"
          actionHref="/tourist/explore"
        />
      ) : (
        <div className="space-y-3">
          {displayedNotifs.map((notif) => {
            const Icon =
              notif.type === 'booking'
                ? Calendar
                : notif.type === 'eco'
                ? ShieldCheck
                : Sparkles;

            return (
              <Card
                key={notif.id}
                className={[
                  'p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                  notif.read
                    ? 'bg-white border-ink-200/80 opacity-80'
                    : 'bg-[#FFFDF9] border-2 border-forest-500/40 shadow-sm',
                ].join(' ')}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={[
                      'h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs',
                      notif.type === 'booking'
                        ? 'bg-clay-100 text-clay-800'
                        : notif.type === 'eco'
                        ? 'bg-forest-100 text-forest-800'
                        : 'bg-amber-100 text-amber-800',
                    ].join(' ')}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-ink-900">{notif.title}</h3>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-forest-600 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-ink-700 leading-relaxed max-w-2xl">{notif.message}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-500 pt-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(notif.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {notif.actionUrl && (
                    <Button asChild variant="secondary" size="sm" className="text-xs">
                      <Link to={notif.actionUrl} className="inline-flex items-center gap-1">
                        <span>{notif.actionLabel || 'View'}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                  {!notif.read && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(notif.id)}
                      className="text-xs text-ink-600 hover:text-ink-900"
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
