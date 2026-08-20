import React, { createContext, useContext, useState } from 'react';
import { en, type TranslationKey } from './en';
import { hi } from './hi';

export type SupportedLanguage = 'en' | 'hi';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const STORAGE_KEY = 'jharkhand_language';

const dictionaries: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en,
  hi,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'hi' || stored === 'en') {
        return stored;
      }
    } catch {
      // Ignore localStorage issues
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = dictionaries[language] || dictionaries.en;
    if (dict && key in dict) {
      return dict[key];
    }
    // Fallback to English
    if (dictionaries.en && key in dictionaries.en) {
      return dictionaries.en[key];
    }
    return fallback || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a safe fallback if accessed outside of provider
    return {
      language: 'en' as SupportedLanguage,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key: TranslationKey, fallback?: string) => fallback || (en[key] as string) || (key as string),
    };
  }
  return context;
}
