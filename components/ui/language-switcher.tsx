'use client';

import { useLocale } from '@/lib/i18n';
import { i18nConfig, type Locale } from '@/lib/i18n/config';
import { Button } from './button';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const handleChange = (newLocale: Locale) => {
    if (newLocale !== locale) {
      setLocale(newLocale);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {i18nConfig.locales.map((loc) => (
        <Button
          key={loc}
          variant={locale === loc ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleChange(loc)}
          className="px-2 py-1 text-xs uppercase"
        >
          {loc}
        </Button>
      ))}
    </div>
  );
}

export function LanguageSelect() {
  const { locale, setLocale } = useLocale();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="rounded-md border border-input bg-background px-3 py-1 text-sm"
    >
      {i18nConfig.locales.map((loc) => (
        <option key={loc} value={loc}>
          {i18nConfig.localeNames[loc]}
        </option>
      ))}
    </select>
  );
}
