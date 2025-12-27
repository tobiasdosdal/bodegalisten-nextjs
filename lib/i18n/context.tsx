'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { i18nConfig, type Locale, isValidLocale } from './config';
import { getDictionary, getNestedValue, type Dictionary } from './dictionaries';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dictionary: Dictionary;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getLocaleFromCookie(): Locale | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === LOCALE_COOKIE_NAME && isValidLocale(value)) {
      return value;
    }
  }
  return null;
}

function getLocaleFromBrowser(): Locale | null {
  if (typeof window === 'undefined') return null;
  
  const browserLang = navigator.language.split('-')[0];
  return isValidLocale(browserLang) ? browserLang : null;
}

function getStoredLocale(): Locale {
  const stored = getLocaleFromCookie() ?? getLocaleFromBrowser();
  return stored ?? i18nConfig.defaultLocale as Locale;
}

function persistLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  
  const expires = new Date(Date.now() + ONE_YEAR_MS);
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale};expires=${expires.toUTCString()};path=/`;
}

function updateDocumentLang(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}

function interpolateParams(text: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(new RegExp(`{{${key}}}`, 'g'), String(value)),
    text
  );
}

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? i18nConfig.defaultLocale);
  const [dictionary, setDictionary] = useState<Dictionary>(getDictionary(locale));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!initialLocale) {
      const storedLocale = getStoredLocale();
      setLocaleState(storedLocale);
      setDictionary(getDictionary(storedLocale));
    }
    setMounted(true);
  }, [initialLocale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setDictionary(getDictionary(newLocale));
    persistLocale(newLocale);
    updateDocumentLang(newLocale);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedValue(dictionary as unknown as Record<string, unknown>, key);
    return params ? interpolateParams(translation, params) : translation;
  }, [dictionary]);

  const value = { locale, setLocale, t, dictionary };

  if (!mounted) {
    return (
      <I18nContext.Provider value={{ ...value, locale: i18nConfig.defaultLocale }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  
  return context;
}

export function useLocale() {
  const { locale, setLocale } = useTranslation();
  return { locale, setLocale };
}
