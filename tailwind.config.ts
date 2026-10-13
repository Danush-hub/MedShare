import type { Config } from 'tailwindcss';

/**
 * MedShare design tokens.
 * Colors are defined as CSS variables (see src/styles/globals.css) so the
 * palette stays centralized and theme-able rather than hardcoded per component.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          navy: 'var(--color-navy)',
          light: 'var(--color-primary-light)',
          50: '#EAF4FF',
          100: '#D3E8FB',
          200: '#A9CFF6',
          300: '#70B0EE',
          400: '#3D8FE0',
          500: '#1769AA',
          600: '#13568B',
          700: '#12304A',
          800: '#0E2740',
          900: '#0A1D30',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          background: 'var(--color-background)',
          muted: 'var(--color-surface-muted)',
        },
        ink: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-secondary)',
          subtle: 'var(--color-text-subtle)',
        },
        line: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          soft: 'var(--color-success-soft)',
          foreground: 'var(--color-success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          soft: 'var(--color-warning-soft)',
          foreground: 'var(--color-warning-foreground)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          soft: 'var(--color-error-soft)',
          foreground: 'var(--color-error-foreground)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          soft: 'var(--color-info-soft)',
          foreground: 'var(--color-info-foreground)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        field: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 48, 74, 0.04), 0 8px 24px rgba(18, 48, 74, 0.06)',
        'card-hover': '0 2px 4px rgba(18, 48, 74, 0.06), 0 12px 32px rgba(18, 48, 74, 0.10)',
        header: '0 1px 0 rgba(220, 230, 240, 0.9)',
        focus: '0 0 0 3px rgba(23, 105, 170, 0.28)',
      },
      spacing: {
        'layout': '1.5rem',
        'section': '4rem',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1.5rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '3rem',
        },
        screens: {
          '2xl': '1200px',
        },
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
