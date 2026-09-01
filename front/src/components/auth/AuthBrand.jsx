import AppIcon from '../shared/AppIcon.jsx';
import { useLanguage } from '../../context/useLanguage.js';

export default function AuthBrand({ subtitle }) {
  const { t } = useLanguage();

  return (
    <div className="auth-brand">
      <AppIcon size={56} className="auth-brand-icon" />
      <div className="auth-brand-copy">
        <h1 className="auth-brand-title">{t('appName')}</h1>
        <p
          className="auth-tagline"
          aria-label={`${t('brand.plan')} ${t('brand.save')} ${t('brand.achieve')}`}
        >
          <span className="auth-tagline-plan">{t('brand.plan')}</span>
          <span className="auth-tagline-sep auth-tagline-sep--teal" aria-hidden="true">
            {' • '}
          </span>
          <span className="auth-tagline-save">{t('brand.save')}</span>
          <span className="auth-tagline-sep auth-tagline-sep--accent" aria-hidden="true">
            {' • '}
          </span>
          <span className="auth-tagline-achieve">{t('brand.achieve')}</span>
        </p>
        {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
      </div>
    </div>
  );
}
