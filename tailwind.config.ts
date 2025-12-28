import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Bodega Design System Colors - Copenhagen Tavern
        bodega: {
          primary: 'rgb(var(--bodega-primary) / <alpha-value>)',
          secondary: 'rgb(var(--bodega-secondary) / <alpha-value>)',
          accent: 'rgb(var(--bodega-accent) / <alpha-value>)',
          surface: 'rgb(var(--bodega-surface) / <alpha-value>)',
          'surface-elevated': 'rgb(var(--bodega-surface-elevated) / <alpha-value>)',
          gold: 'rgb(var(--bodega-gold) / <alpha-value>)',
          burgundy: 'rgb(var(--bodega-burgundy) / <alpha-value>)',
          cream: 'rgb(var(--bodega-cream) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Bodega radius tokens
        'bodega-xs': '4px',
        'bodega-sm': '8px',
        'bodega-md': '12px',
        'bodega-lg': '16px',
        'bodega-xl': '20px',
        'bodega-2xl': '28px',
      },
      spacing: {
        // Bodega spacing tokens
        'bodega-xxxs': '2px',
        'bodega-xxs': '4px',
        'bodega-xs': '8px',
        'bodega-sm': '12px',
        'bodega-md': '16px',
        'bodega-lg': '24px',
        'bodega-xl': '32px',
        'bodega-2xl': '48px',
        'bodega-3xl': '64px',
      },
      fontFamily: {
        'bodega-rounded': ['ui-rounded', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'display': ['Fraunces', 'Georgia', 'serif'],
        'body': ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'bodega-large-title': ['34px', { lineHeight: '1.2', fontWeight: '700' }],
        'bodega-title': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'bodega-title2': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'bodega-title3': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'bodega-headline': ['17px', { lineHeight: '1.4', fontWeight: '600' }],
        'bodega-body': ['17px', { lineHeight: '1.5', fontWeight: '400' }],
        'bodega-callout': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'bodega-subheadline': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'bodega-footnote': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
        'bodega-caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        'bodega-caption2': ['11px', { lineHeight: '1.3', fontWeight: '400' }],
      },
      boxShadow: {
        'bodega': '0 4px 12px rgba(0, 0, 0, 0.25)',
        'bodega-card': '0 8px 16px rgba(0, 0, 0, 0.3)',
        'bodega-glow': '0 0 20px rgba(102, 204, 128, 0.3)',
      },
      animation: {
        'bodega-spin': 'spin 1s linear infinite',
        'bodega-bounce': 'bodegaBounce 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        bodegaBounce: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
