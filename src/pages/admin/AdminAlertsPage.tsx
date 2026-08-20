import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Edit2,
  Eye,
  EyeOff,
  MapPin,
  Plus,
  Radio,
  Trash2,
  X,
} from 'lucide-react';
import { Badge, Button, Card, Input, Select, Textarea } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/StateBlocks';
import { ALERT_SEVERITY_CONFIG, ALERT_TYPE_LABELS } from '../../constants/admin';
import { JHARKHAND_DISTRICTS } from '../../constants/destinations';
import {
  createAdminAlert,
  deleteAdminAlert,
  getAdminAlerts,
  updateAdminAlert,
} from '../../services/admin/adminGovernanceService';
import type { AlertSeverity, AlertStatus, AlertType, TourismAlert } from '../../types/admin';

interface AlertFormData {
  title: string;
  description: string;
  type: AlertType;
  severity: AlertSeverity;
  district: string;
  destination_name: string;
  start_date: string;
  end_date: string;
  status: AlertStatus;
}

const INITIAL_ALERT_FORM: AlertFormData = {
  title: '',
  description: '',
  type: 'safety',
  severity: 'advisory',
  district: '',
  destination_name: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: '',
  status: 'published',
};

export function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<TourismAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AlertFormData>(INITIAL_ALERT_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAlerts();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(INITIAL_ALERT_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (alert: TourismAlert) => {
    setEditingId(alert.id);
    setFormData({
      title: alert.title,
      description: alert.description,
      type: alert.type,
      severity: alert.severity,
      district: alert.district || '',
      destination_name: alert.destination_name || '',
      start_date: alert.start_date,
      end_date: alert.end_date || '',
      status: alert.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setFormError('Alert title is required.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Alert description is required.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        severity: formData.severity,
        district: formData.district || null,
        destination_name: formData.destination_name?.trim() || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        status: formData.status,
      };

      if (editingId) {
        await updateAdminAlert(editingId, payload);
      } else {
        await createAdminAlert(payload);
      }

      setIsModalOpen(false);
      void loadAlerts();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save alert.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (alert: TourismAlert) => {
    const nextStatus: AlertStatus = alert.status === 'published' ? 'draft' : 'published';
    try {
      await updateAdminAlert(alert.id, { status: nextStatus });
      void loadAlerts();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not change alert status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this alert?')) return;
    try {
      await deleteAdminAlert(id);
      void loadAlerts();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to remove alert.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          eyebrow="Emergency & Operations"
          title="Tourism Alerts & Advisories"
          description="Broadcast official travel advisories, weather warnings, road closures, and festival notices across tourist discovery pages."
        />
        <Button onClick={handleOpenCreate} size="sm" className="font-bold">
          <Plus className="mr-1.5 h-4 w-4" />
          Create Alert
        </Button>
      </div>

      {/* Alerts Broadcast Information Callout */}
      <Card className="p-5 border-amber-200 bg-amber-50/60">
        <div className="flex items-start gap-3 text-xs text-amber-900">
          <Radio className="h-4 w-4 text-amber-700 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <p className="font-bold">Real-time Tourist Broadcast Active</p>
            <p className="text-amber-800 leading-relaxed">
              Published alerts automatically appear as advisory banners on relevant destination and explore pages to ensure traveler safety across Jharkhand.
            </p>
          </div>
        </div>
      </Card>

      {/* Alerts List */}
      {loading ? (
        <LoadingState label="Loading tourism alerts..." />
      ) : error ? (
        <ErrorState title="Error loading alerts" message={error} />
      ) : alerts.length === 0 ? (
        <EmptyState
          title="No alerts created"
          message="There are currently no active alerts or advisories recorded."
          actionLabel="Manage Alerts"
          actionHref="/admin/alerts"
        />
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => {
            const sevConfig = ALERT_SEVERITY_CONFIG[alert.severity] || ALERT_SEVERITY_CONFIG.advisory;
            const typeConfig = ALERT_TYPE_LABELS[alert.type] || ALERT_TYPE_LABELS.general;
            const isPublished = alert.status === 'published';

            return (
              <Card
                key={alert.id}
                className={`p-5 transition-all border ${
                  isPublished ? 'border-ink-200 bg-white' : 'border-dashed border-ink-300 bg-sand/20 opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${sevConfig.colorClasses}`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {sevConfig.label}
                      </span>

                      <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-ink-800">
                        {typeConfig.label}
                      </span>

                      <Badge variant={isPublished ? 'success' : 'neutral'} className="text-[10px]">
                        {isPublished ? 'Live Broadcast' : 'Draft'}
                      </Badge>

                      {alert.district ? (
                        <span className="inline-flex items-center gap-1 text-xs text-ink-600 font-medium">
                          <MapPin className="h-3 w-3 text-clay-700" />
                          {alert.district}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-500 font-medium">Statewide Advisory</span>
                      )}

                      {alert.destination_name && (
                        <span className="text-xs text-clay-800 font-semibold bg-clay-100 px-2 py-0.5 rounded-md">
                          Destination: {alert.destination_name}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display text-base font-bold text-ink-900">{alert.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-ink-700">{alert.description}</p>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-ink-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Start: {alert.start_date}
                      </span>
                      {alert.end_date && <span>• Valid until: {alert.end_date}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenEdit(alert)}
                      className="text-xs"
                    >
                      <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTogglePublish(alert)}
                      className="text-xs text-ink-700 hover:bg-sand"
                    >
                      {isPublished ? (
                        <>
                          <EyeOff className="mr-1 h-3.5 w-3.5 text-amber-600" /> Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1 h-3.5 w-3.5 text-emerald-600" /> Publish Live
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(alert.id)}
                      className="text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Alert Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink-100 pb-4">
              <h2 className="font-display text-xl font-bold text-ink-900">
                {editingId ? 'Edit Tourism Advisory' : 'Create New Tourism Advisory'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-2 text-ink-400 hover:bg-sand hover:text-ink-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveAlert} className="space-y-4 text-xs">
              <label className="space-y-1 block">
                <span className="font-bold text-ink-900">Advisory Title *</span>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Heavy Rainfall Advisory for Netarhat & Hundru"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">Alert Category</span>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    {Object.entries(ALERT_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">Severity Level</span>
                  <Select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  >
                    {Object.entries(ALERT_SEVERITY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">Affected District (Optional)</span>
                  <Select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  >
                    <option value="">Statewide (All Districts)</option>
                    {JHARKHAND_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">Affected Destination Name (Optional)</span>
                  <Input
                    value={formData.destination_name}
                    onChange={(e) => setFormData({ ...formData, destination_name: e.target.value })}
                    placeholder="e.g. Hundru Falls"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">Start Date</span>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="font-bold text-ink-900">End Date (Optional)</span>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="font-bold text-ink-900">Publication Status</span>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="published">Published (Broadcast live)</option>
                  <option value="draft">Draft (Saved for review)</option>
                  <option value="archived">Archived</option>
                </Select>
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-ink-900">Advisory Message & Guidance *</span>
                <Textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide precise safety information, alternate routes, contact numbers, or travel restrictions..."
                />
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="font-bold">
                  {saving ? 'Saving...' : editingId ? 'Update Advisory' : 'Broadcast Advisory'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
