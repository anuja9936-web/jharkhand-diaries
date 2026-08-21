import { supabase } from '../../lib/supabase';
import { getMyTouristBookings } from './touristBookingService';
import { getUserTrips } from '../trips/tripService';

export interface TouristNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'trip' | 'eco' | 'ai' | 'alert';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

const READ_STORAGE_KEY = 'jharkhand_tourist_read_notifs';

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch (err) {
    console.warn('Failed to persist read notifications:', err);
  }
}

export async function getTouristNotifications(): Promise<TouristNotification[]> {
  const readIds = getReadIds();
  const notifs: TouristNotification[] = [];

  // 1. Try fetching from Supabase tourist_notifications if exists
  if (supabase) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data, error } = await supabase
          .from('tourist_notifications')
          .select('*')
          .eq('user_id', authData.user.id)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            title: item.title,
            message: item.message,
            type: item.type || 'alert',
            read: item.is_read || readIds.has(item.id),
            createdAt: item.created_at,
            actionUrl: item.action_url,
            actionLabel: item.action_label,
          }));
        }
      }
    } catch {
      // Fallback to dynamic notifications
    }
  }

  // 2. Dynamic generation from live user bookings
  try {
    const bookings = await getMyTouristBookings();
    bookings.forEach((b) => {
      if (b.status === 'accepted') {
        notifs.push({
          id: `notif-booking-acc-${b.id}`,
          title: `Booking Request Accepted! 🎉`,
          message: `Your request for "${b.offering?.name || 'stay'}" has been approved by the local host. Check details and prepare for your trip.`,
          type: 'booking',
          read: readIds.has(`notif-booking-acc-${b.id}`),
          createdAt: b.updated_at || b.created_at || new Date().toISOString(),
          actionUrl: '/tourist/requests',
          actionLabel: 'View Booking',
        });
      } else if (b.status === 'pending') {
        notifs.push({
          id: `notif-booking-pen-${b.id}`,
          title: `Request Submitted to Provider`,
          message: `Your enquiry for "${b.offering?.name || 'service'}" is currently under review by the host.`,
          type: 'booking',
          read: readIds.has(`notif-booking-pen-${b.id}`),
          createdAt: b.created_at || new Date().toISOString(),
          actionUrl: '/tourist/requests',
          actionLabel: 'Check Status',
        });
      }
    });
  } catch (err) {
    console.warn('[touristNotificationService] Bookings notif err:', err);
  }

  // 3. Dynamic generation from live user trips
  try {
    const trips = await getUserTrips();
    if (trips && trips.length > 0) {
      const latestTrip = trips[0];
      notifs.push({
        id: `notif-trip-${latestTrip.id}`,
        title: `Trip Ready: ${latestTrip.title}`,
        message: `You have ${latestTrip.trip_destinations?.length || 1} saved stops in your itinerary. Johar AI can optimize your travel route anytime.`,
        type: 'trip',
        read: readIds.has(`notif-trip-${latestTrip.id}`),
        createdAt: latestTrip.created_at || new Date().toISOString(),
        actionUrl: `/tourist/itinerary/${latestTrip.id}`,
        actionLabel: 'Open Itinerary',
      });
    }
  } catch (err) {
    console.warn('[touristNotificationService] Trips notif err:', err);
  }

  // 4. Default cultural eco onboarding notification
  notifs.push({
    id: 'notif-eco-welcome',
    title: 'Welcome to Jharkhand Eco-Passport! 🌱',
    message: 'You unlocked the "Eco Pioneer" badge. Earn more points by exploring verified eco-homestays and cultural craft clusters.',
    type: 'eco',
    read: readIds.has('notif-eco-welcome'),
    createdAt: '2026-08-01T10:00:00.000Z',
    actionUrl: '/tourist/eco-passport',
    actionLabel: 'View Eco Passport',
  });

  return notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markTouristNotificationAsRead(id: string): Promise<void> {
  const readIds = getReadIds();
  readIds.add(id);
  saveReadIds(readIds);

  if (supabase) {
    try {
      await supabase.from('tourist_notifications').update({ is_read: true }).eq('id', id);
    } catch {
      // Ignored
    }
  }
}

export async function markAllTouristNotificationsAsRead(notifications: TouristNotification[]): Promise<void> {
  const readIds = getReadIds();
  notifications.forEach((n) => readIds.add(n.id));
  saveReadIds(readIds);

  if (supabase) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        await supabase.from('tourist_notifications').update({ is_read: true }).eq('user_id', authData.user.id);
      }
    } catch {
      // Ignored
    }
  }
}
