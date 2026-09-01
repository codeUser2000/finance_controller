import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  THEME_PREFERENCES,
  applyResolvedTheme,
  getResolvedTheme,
  getThemePreference,
  initTheme,
  setThemePreference,
} from '../utils/applySystemTheme.js';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => getThemePreference());
  const [resolvedTheme, setResolvedTheme] = useState(() => getResolvedTheme());

  useEffect(() => {
    const cleanup = initTheme();
    const onThemeChange = () => {
      setPreferenceState(getThemePreference());
      setResolvedTheme(getResolvedTheme());
    };
    window.addEventListener('themechange', onThemeChange);
    return () => {
      cleanup?.();
      window.removeEventListener('themechange', onThemeChange);
    };
  }, []);

  const setPreference = useCallback((next) => {
    setThemePreference(next);
    setPreferenceState(next);
    const resolved = getResolvedTheme(next);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme,
      setPreference,
      options: THEME_PREFERENCES,
    }),
    [preference, resolvedTheme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
