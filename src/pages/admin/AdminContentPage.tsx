import { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Check,
  Palette,
  Save,
} from 'lucide-react';
import { Badge, Button, Card, Input } from '../../components/ui';
import { PageHeader } from '../../components/common/StateBlocks';

export function AdminContentPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cultural Editorial"
        title="Content Management & Heritage Oversight"
        description="Oversee cultural narratives, festival calendars, tribal art guidelines, and featured stories across Jharkhand Diaries."
      />

      {saved && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 font-medium">
          <Check className="h-4 w-4 text-emerald-700" />
          Editorial guidelines saved successfully.
        </div>
      )}

      {/* Main Content Modules */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay-100 text-clay-800">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-bold text-ink-900">
              Festival Calendar & Events
            </h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              Curate Sarhul, Karma, Tusu Parab, Sohrai, and tribal cultural gathering schedules across districts.
            </p>
          </div>
          <div className="pt-3 border-t border-ink-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-800">5 Curated Events</span>
            <Badge variant="neutral">Live</Badge>
          </div>
        </Card>

        <Card className="p-6 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay-100 text-clay-800">
              <Palette className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-bold text-ink-900">
              Artisan & GI Tag Guidelines
            </h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              Maintain authenticity benchmarks for Sohrai-Khovar GI Tagged murals, Dokra brass casting, and Santhal bamboo craft.
            </p>
          </div>
          <div className="pt-3 border-t border-ink-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-800">6 GI Standards</span>
            <Badge variant="neutral">Verified</Badge>
          </div>
        </Card>

        <Card className="p-6 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay-100 text-clay-800">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-bold text-ink-900">
              Tourist Audio & Language Guides
            </h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              Manage multilingual voice scripts and tribal dialect glossaries (Santhali, Mundari, Ho, Kurukh, Nagpuri).
            </p>
          </div>
          <div className="pt-3 border-t border-ink-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-800">10 Languages</span>
            <Badge variant="neutral">Active</Badge>
          </div>
        </Card>
      </div>

      {/* Editorial Standards Form */}
      <Card className="p-6 space-y-4">
        <h3 className="font-display text-base font-bold text-ink-900">
          Editorial & Media Publishing Standards
        </h3>
        <p className="text-xs text-ink-600">
          Set global content moderation requirements for newly submitted provider offerings and public reviews.
        </p>

        <form onSubmit={handleSave} className="space-y-4 pt-2 text-xs">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 block">
              <span className="font-bold text-ink-900">Maximum Image Upload Size (MB)</span>
              <Input defaultValue="10" />
            </label>

            <label className="space-y-1 block">
              <span className="font-bold text-ink-900">Review Auto-Moderation Filter</span>
              <Input defaultValue="Profanity and unverified contact details filtered" />
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" className="font-bold">
              <Save className="mr-1.5 h-4 w-4" /> Save Editorial Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
