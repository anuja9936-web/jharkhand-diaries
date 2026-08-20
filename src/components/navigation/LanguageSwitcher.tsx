import { Globe } from 'lucide-react';
import { useTranslation } from '../../i18n';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useTranslation();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-ink-200/90 bg-white/90 p-0.5 shadow-2xs backdrop-blur-xs ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <span className="sr-only">Language</span>
      <div className="flex items-center pl-1.5 pr-0.5 text-ink-400">
        <Globe className="h-3 w-3" />
      </div>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`rounded-full px-2 py-0.5 text-[11px] font-bold transition-all ${
          language === 'en'
            ? 'bg-forest-900 text-white shadow-xs'
            : 'text-ink-600 hover:text-ink-950 hover:bg-sand/60'
        }`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`rounded-full px-2 py-0.5 text-[11px] font-bold transition-all ${
          language === 'hi'
            ? 'bg-forest-900 text-white shadow-xs'
            : 'text-ink-600 hover:text-ink-950 hover:bg-sand/60'
        }`}
        aria-pressed={language === 'hi'}
      >
        हिन्दी
      </button>
    </div>
  );
}
