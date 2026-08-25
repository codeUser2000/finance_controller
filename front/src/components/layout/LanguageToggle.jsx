import { useLanguage } from '../../context/useLanguage.js';
import { LANGUAGES } from '../../i18n/translations.js';

export default function LanguageToggle({ compact = false }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className={`lang-toggle ${compact ? 'is-compact' : ''}`} role="group" aria-label={t('language')}>
      {LANGUAGES.map((item) => (
        <button
          key={item.id}
          type="button"
          className={lang === item.id ? 'is-active' : ''}
          onClick={() => setLang(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
