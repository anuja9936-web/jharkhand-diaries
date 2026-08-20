import type { AlertSeverity, AlertStatus, AlertType, FeedbackCategory, FeedbackStatus } from '../types/admin';

export const ALERT_TYPE_LABELS: Record<AlertType, { label: string; icon: string }> = {
  weather: { label: 'Weather Alert', icon: 'CloudRain' },
  safety: { label: 'Safety Advisory', icon: 'ShieldAlert' },
  road: { label: 'Road / Travel Advisory', icon: 'Car' },
  closure: { label: 'Destination Closure', icon: 'Ban' },
  festival: { label: 'Festival / Event Notice', icon: 'PartyPopper' },
  emergency: { label: 'Emergency Notification', icon: 'AlertTriangle' },
  general: { label: 'General Announcement', icon: 'Bell' },
};

export const ALERT_SEVERITY_CONFIG: Record<
  AlertSeverity,
  { label: string; badgeVariant: 'neutral' | 'accent' | 'warning' | 'error'; colorClasses: string }
> = {
  info: {
    label: 'Information',
    badgeVariant: 'neutral',
    colorClasses: 'border-blue-200 bg-blue-50 text-blue-800',
  },
  advisory: {
    label: 'Advisory',
    badgeVariant: 'accent',
    colorClasses: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  warning: {
    label: 'Warning',
    badgeVariant: 'warning',
    colorClasses: 'border-orange-300 bg-orange-50 text-orange-900',
  },
  critical: {
    label: 'Critical Alert',
    badgeVariant: 'error',
    colorClasses: 'border-red-300 bg-red-50 text-red-900',
  },
};

export const ALERT_STATUS_LABELS: Record<AlertStatus, { label: string; badgeVariant: 'neutral' | 'success' | 'warning' }> = {
  draft: { label: 'Draft', badgeVariant: 'neutral' },
  published: { label: 'Active / Published', badgeVariant: 'success' },
  archived: { label: 'Archived', badgeVariant: 'neutral' },
};

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  tourist_feedback: 'Tourist Experience & Feedback',
  provider_complaint: 'Service Provider Issue',
  destination_issue: 'Destination Maintenance / Infrastructure',
  safety_concern: 'Safety & Emergency Concern',
  service_complaint: 'Tour / Booking Service Complaint',
  other: 'General Inquiry / Other',
};

export const FEEDBACK_STATUS_CONFIG: Record<
  FeedbackStatus,
  { label: string; badgeVariant: 'warning' | 'accent' | 'success' | 'neutral' }
> = {
  new: { label: 'New Submission', badgeVariant: 'warning' },
  under_review: { label: 'Under Review', badgeVariant: 'accent' },
  resolved: { label: 'Resolved', badgeVariant: 'success' },
  closed: { label: 'Closed / Rejected', badgeVariant: 'neutral' },
};

export const ADMIN_NAV_SECTIONS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Destinations', href: '/admin/destinations', icon: 'MapPin' },
  { label: 'Provider Verification', href: '/admin/vendors', icon: 'ShieldCheck' },
  { label: 'Districts', href: '/admin/districts', icon: 'Map' },
  { label: 'Tourism Alerts', href: '/admin/alerts', icon: 'AlertTriangle' },
  { label: 'Feedback & Complaints', href: '/admin/feedback', icon: 'MessageSquare' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
  { label: 'Content Management', href: '/admin/content', icon: 'FileText' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
] as const;
