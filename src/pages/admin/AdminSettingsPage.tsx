import { useState } from 'react';
import { Check, Landmark, Save } from 'lucide-react';
import { Button, Card, Input, Select } from '../../components/ui';
import { PageHeader } from '../../components/common/StateBlocks';

export function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="System Configuration"
        title="Administration Desk Settings"
        description="Configure government contact endpoints, verification SLA thresholds, and emergency notice broadcast modes."
      />

      {saved && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 font-medium">
          <Check className="h-4 w-4 text-emerald-700" />
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
            <Landmark className="h-5 w-5 text-clay-700" />
            <h2 className="font-display text-base font-bold text-ink-900">
              Departmental Contact Endpoints
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <label className="space-y-1 block">
              <span className="font-bold text-ink-900">Official Directorate Helpline</span>
              <Input defaultValue="+91 (0651) 2400-981" />
            </label>

            <label className="space-y-1 block">
              <span className="font-bold text-ink-900">Official Department Email</span>
              <Input defaultValue="tourism@jharkhand.gov.in" />
            </label>

            <label className="space-y-1 block">
              <span className="font-bold text-ink-900">Verification Review SLA (Hours)</span>
              <Select defaultValue="48">
                <option value="24">24 Hours</option>
                <option value="48">48 Hours (Standard)</option>
                <option value="72">72 Hours</option>
              </Select>
            </label>

            <label className="space-y-1 block">
              <span className="font-bold text-ink-900">Emergency Alert Mode</span>
              <Select defaultValue="immediate">
                <option value="immediate">Immediate Live Broadcast</option>
                <option value="dual_review">Requires Dual Officer Approval</option>
              </Select>
            </label>
          </div>

          <div className="flex justify-end pt-3">
            <Button type="submit" size="sm" className="font-bold">
              <Save className="mr-1.5 h-4 w-4" /> Save System Settings
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
