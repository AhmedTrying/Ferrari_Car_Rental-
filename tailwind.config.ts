import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--y)',
        'accent-deep': 'var(--y-deep)',
        'accent-soft': 'var(--y-soft)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        line: 'var(--line)',
        'line-2': 'var(--line-2)',
        muted: 'var(--muted)',
        'muted-2': 'var(--muted-2)',
        bg: 'var(--bg)',
        'bg-2': 'var(--bg-2)',
        card: 'var(--card)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        wa: 'var(--green-wa)',
      },
      fontFamily: {
        cairo: ['var(--font-cairo)', 'sans-serif'],
        tajawal: ['var(--font-tajawal)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        sm: '0 2px 8px rgba(0,0,0,.05)',
        md: '0 6px 24px rgba(0,0,0,.06)',
        lg: '0 16px 40px rgba(0,0,0,.10)',
      },
    },
  },
  plugins: [],
};
export default config;
