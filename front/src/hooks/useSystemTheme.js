import { useEffect, useState } from 'react';
import { getResolvedTheme } from '../utils/applySystemTheme.js';

export function useResolvedTheme() {
  const [theme, setTheme] = useState(() => getResolvedTheme());

  useEffect(() => {
    const update = () => setTheme(getResolvedTheme());
    window.addEventListener('themechange', update);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', update);
    return () => {
      window.removeEventListener('themechange', update);
      media.removeEventListener('change', update);
    };
  }, []);

  return theme;
}
