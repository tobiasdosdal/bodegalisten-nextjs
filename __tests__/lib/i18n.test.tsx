import { render, screen, fireEvent, act } from '@testing-library/react';
import { I18nProvider, useTranslation } from '@/lib/i18n';

function TestComponent() {
  const { t, locale, setLocale } = useTranslation();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="translation">{t('nav.home')}</span>
      <button onClick={() => setLocale('en')}>Switch to EN</button>
      <button onClick={() => setLocale('da')}>Switch to DA</button>
    </div>
  );
}

describe('i18n', () => {
  beforeEach(() => {
    document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('provides default locale', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('da');
  });

  it('provides translation function', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    expect(screen.getByTestId('translation')).toHaveTextContent('Hjem');
  });

  it('switches locale', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Switch to EN'));
    });

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('translation')).toHaveTextContent('Home');
  });

  it('respects initialLocale prop', () => {
    render(
      <I18nProvider initialLocale="en">
        <TestComponent />
      </I18nProvider>
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });
});
