'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
interface ThemeCtx {
  theme: Theme;
  accent: string;
  setTheme: (t: Theme) => void;
  setAccent: (c: string) => void;
}
const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [accent, setAccentState] = useState<string>('#FFD400');

  // Hydrate from localStorage (the inline script in layout.tsx already paints)
  useEffect(() => {
    const t = (localStorage.getItem('fcr-theme') as Theme) || 'light';
    const a = localStorage.getItem('fcr-accent') || '#FFD400';
    setThemeState(t);
    setAccentState(a);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('fcr-theme', t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const setAccent = useCallback((c: string) => {
    setAccentState(c);
    localStorage.setItem('fcr-accent', c);
    document.documentElement.style.setProperty('--y', c);
    document.documentElement.style.setProperty('--y-deep', c);
  }, []);

  return <Ctx.Provider value={{ theme, accent, setTheme, setAccent }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme outside ThemeProvider');
  return v;
}
