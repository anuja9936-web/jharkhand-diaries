import {
  Building2,
  Car,
  Check,
  Compass,
  Palette,
  Sparkles,
} from 'lucide-react';
import { PROVIDER_CAPABILITIES } from '../../constants/provider';
import type { ProviderCapability } from '../../types/provider';

interface ProviderCapabilitySelectorProps {
  selected: ProviderCapability[];
  onChange: (selected: ProviderCapability[]) => void;
  disabled?: boolean;
}

const ICON_MAP: Record<ProviderCapability, { icon: typeof Building2; emoji: string }> = {
  accommodation: { icon: Building2, emoji: '🏡' },
  artisan: { icon: Palette, emoji: '🎨' },
  guide: { icon: Compass, emoji: '🧭' },
  adventure: { icon: Sparkles, emoji: '🧗' },
  transport: { icon: Car, emoji: '🚐' },
};

export function ProviderCapabilitySelector({
  selected,
  onChange,
  disabled = false,
}: ProviderCapabilitySelectorProps) {
  const isSelected = (id: ProviderCapability) => selected.includes(id);

  const toggleCapability = (id: ProviderCapability) => {
    if (disabled) return;
    if (isSelected(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* 5 Large Selectable Cards: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROVIDER_CAPABILITIES.map((capability) => {
          const active = isSelected(capability.id);
          const { icon: Icon, emoji } = ICON_MAP[capability.id] ?? { icon: Compass, emoji: '✨' };

          return (
            <div
              key={capability.id}
              role="checkbox"
              aria-checked={active}
              tabIndex={disabled ? -1 : 0}
              onClick={() => toggleCapability(capability.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  toggleCapability(capability.id);
                }
              }}
              className={`group relative flex flex-col justify-between rounded-2xl border p-5 sm:p-6 text-left transition-all duration-200 select-none ${
                active
                  ? 'border-clay-700 bg-[#FAF4ED] shadow-sm ring-2 ring-clay-700/80'
                  : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-[#FAF8F5]'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
            >
              <div className="space-y-3.5">
                {/* Header: Icon & Checkbox Indicator */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                        active
                          ? 'bg-clay-700 text-white shadow-sm'
                          : 'bg-[#FAF8F5] text-ink-700 border border-ink-100 group-hover:bg-sand/60'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xl" aria-hidden="true">{emoji}</span>
                  </div>

                  {/* Multi-select check box */}
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-all ${
                      active
                        ? 'border-clay-700 bg-clay-700 text-white shadow-xs'
                        : 'border-ink-300 bg-white group-hover:border-ink-400'
                    }`}
                  >
                    {active ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      <div className="h-2 w-2 rounded-xs bg-transparent" />
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-display text-base font-bold text-ink-900 leading-snug">
                    {capability.label}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-600 sm:text-[13px]">
                    {capability.description}
                  </p>
                </div>
              </div>

              {/* Bottom Badge / Category Label */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-ink-100/80 text-[11px] font-medium">
                <span className={active ? 'text-clay-800 font-semibold' : 'text-ink-500'}>
                  {capability.shortLabel}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    active
                      ? 'bg-clay-100 text-clay-800'
                      : 'bg-sand/60 text-ink-500'
                  }`}
                >
                  {active ? 'Selected' : 'Tap to select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
