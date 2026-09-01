const STORAGE_KEY = 'money-theme';

export const THEME_PREFERENCES = ['system', 'light', 'dark'];

const THEMES = {
  light: {
    manifest: '/light/site.webmanifest',
    themeColor: '#F7F9FA',
  },
  dark: {
    manifest: '/dark/site.webmanifest',
    themeColor: '#172B36',
  },
};

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getThemePreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return THEME_PREFERENCES.includes(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

export function getResolvedTheme(preference = getThemePreference()) {
  if (preference === 'light' || preference === 'dark') {
    return preference;
  }
  return getSystemTheme();
}

export function getAppIconSrc(themeName = getResolvedTheme()) {
  return `/${themeName}/android-chrome-192x192.png`;
}

export function applyResolvedTheme(themeName) {
  const theme = THEMES[themeName];
  document.documentElement.dataset.theme = themeName;

  let manifest = document.querySelector('link[rel="manifest"]');
  if (!manifest) {
    manifest = document.createElement('link');
    manifest.rel = 'manifest';
    document.head.appendChild(manifest);
  }
  manifest.href = theme.manifest;

  let themeColor = document.querySelector('meta[name="theme-color"]');
  if (!themeColor) {
    themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    document.head.appendChild(themeColor);
  }
  themeColor.content = theme.themeColor;
}

export function setThemePreference(preference) {
  if (!THEME_PREFERENCES.includes(preference)) return;
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    /* ignore */
  }
  applyResolvedTheme(getResolvedTheme(preference));
  window.dispatchEvent(new CustomEvent('themechange', { detail: { preference } }));
}

export function initTheme() {
  if (typeof window === 'undefined') return () => {};

  applyResolvedTheme(getResolvedTheme());

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = () => {
    if (getThemePreference() === 'system') {
      applyResolvedTheme(getResolvedTheme('system'));
      window.dispatchEvent(new CustomEvent('themechange', { detail: { preference: 'system' } }));
    }
  };

  media.addEventListener('change', onSystemChange);
  return () => media.removeEventListener('change', onSystemChange);
}

// Legacy exports
export function getThemeName() {
  return getResolvedTheme();
}

export function initSystemTheme() {
  return initTheme();
}
