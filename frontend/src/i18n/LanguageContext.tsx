import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import tr from './tr';
import en from './en';

type Language = 'tr' | 'en';
type Translations = typeof tr;

const translations: Record<Language, Translations> = { tr, en };

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
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return (typeof value === 'string' ? value : key);
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
