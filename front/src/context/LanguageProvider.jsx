import { useCallback, useEffect, useState } from 'react';
import { LanguageContext } from './languageContext.js';
import { LANGUAGES, LOCALES, translations } from '../i18n/translations.js';

const STORAGE_KEY = 'money-lang';
const DEFAULT_LANG = 'hy';

function getPath(object, path) {
  return path.split('.').reduce((current, key) => current?.[key], object);
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return LANGUAGES.some((item) => item.id === saved) ? saved : DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  });

  const locale = LOCALES[lang] || LOCALES.hy;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = translations[lang]?.appName || 'Budgeting';
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      const table = translations[lang] || translations.hy;
      let value = getPath(table, key) ?? getPath(translations.en, key) ?? key;
      if (vars && typeof value === 'string') {
        value = value.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
      }
      return value;
    },
    [lang],
  );

  function setLang(next) {
    if (LANGUAGES.some((item) => item.id === next)) {
      setLangState(next);
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, locale, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
