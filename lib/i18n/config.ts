export type Locale = 'da' | 'en';

export const i18nConfig = {
  defaultLocale: 'da' as Locale,
  locales: ['da', 'en'] as const,
  localeNames: {
    da: 'Dansk',
    en: 'English',
  } as const,
};

export function isValidLocale(locale: string): locale is Locale {
  return i18nConfig.locales.includes(locale as Locale);
}
