import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import tr from './tr';
import en from './en';

type Language = 'tr' | 'en';
type TranslationNode = string | { [key: string]: TranslationNode };
type Translations = Record<string, TranslationNode>;

const translations: Record<Language, Translations> = { tr, en };

function resolveTranslation(source: Translations, key: string): string | null {
  const keys = key.split('.');
  let value: TranslationNode | undefined = source;
  for (const k of keys) {
    if (typeof value !== 'object' || value === null) return null;
    value = (value as Record<string, TranslationNode>)[k];
  }
  return typeof value === 'string' ? value : null;
}

function humanizeFallback(key: string): string {
  const lastSegment = key.split('.').pop() ?? key;
  return lastSegment
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>(
    () => (localStorage.getItem('fmms-lang') as Language) || 'tr'
  );

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    localStorage.setItem('fmms-lang', lang);
  }, []);

  const t = useCallback((key: string): string => {
    const currentLanguageValue = resolveTranslation(translations[language], key);
    if (currentLanguageValue) return currentLanguageValue;

    const fallbackEnglishValue = resolveTranslation(translations.en, key);
    if (fallbackEnglishValue) return fallbackEnglishValue;

    return humanizeFallback(key);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider');
  return ctx;
}

export type { Language };
