import { useTheme } from '../../context/ThemeProvider.jsx';
import { useLanguage } from '../../context/useLanguage.js';

export default function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const { t } = useLanguage();

  const options = [
    { id: 'system', label: t('profile.themeSystem') },
    { id: 'light', label: t('profile.themeLight') },
    { id: 'dark', label: t('profile.themeDark') },
  ];

  return (
    <div className="segmented segmented-3 is-compact" role="group" aria-label={t('profile.appearance')}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={preference === option.id ? 'is-active' : ''}
          onClick={() => setPreference(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
