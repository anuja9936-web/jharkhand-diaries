import { useEffect, useState } from 'react';
import { CheckCheck, ShieldCheck, Star, CalendarCheck, Info } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { EmptyState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import {
  getMyProviderNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/provider/providerMarketplaceService';
import type { ProviderNotification } from '../../types/provider';

export function ProviderNotificationsPage() {
  const [notifications, setNotifications] = useState<ProviderNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getMyProviderNotifications();
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemClick = async (notif: ProviderNotification) => {
    if (!notif.read) {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
  };

  if (loading) {
    return <LoadingState label="Loading provider alerts..." />;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          eyebrow="Activity & Updates"
          title="Provider Notifications"
          description="Real-time alerts for booking requests, tourist enquiries, verification updates, and traveller reviews."
        />
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          message="You're all caught up! Booking requests, reviews, and status alerts will notify you here."
          actionLabel="Go to Dashboard"
          actionHref="/provider/dashboard"
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`p-4 transition-all border ${
                n.read
                  ? 'bg-white border-ink-200 opacity-80'
                  : 'bg-[#FFFDF9] border-clay-700/30 shadow-sm ring-1 ring-clay-700/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                    n.type === 'request'
                      ? 'bg-clay-700 text-white'
                      : n.type === 'verification'
                      ? 'bg-emerald-600 text-white'
                      : n.type === 'review'
                      ? 'bg-amber-500 text-white'
                      : 'bg-sand text-ink-800'
                  }`}
                >
                  {n.type === 'request' ? (
                    <CalendarCheck className="h-4 w-4" />
                  ) : n.type === 'verification' ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : n.type === 'review' ? (
                    <Star className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-bold text-ink-900">{n.title}</h3>
                    <span className="text-[11px] text-ink-400">
                      {new Date(n.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-ink-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
