import { useLanguage } from '../../context/useLanguage.js';
import { LANGUAGES } from '../../i18n/translations.js';

export default function LanguageToggle({ compact = false, small = false }) {
  const { lang, setLang, t } = useLanguage();

  const wrapClass = [
    'lang-select-wrap',
    compact ? 'is-compact' : '',
    small ? 'is-small' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={wrapClass}>
      <span className="sr-only">{t('language')}</span>
      <select
        className="lang-select"
        value={lang}
        onChange={(event) => setLang(event.target.value)}
        aria-label={t('language')}
      >
        {LANGUAGES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
