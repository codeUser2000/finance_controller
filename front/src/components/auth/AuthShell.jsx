import LanguageToggle from '../layout/LanguageToggle.jsx';
import AuthBrand from './AuthBrand.jsx';

export default function AuthShell({ subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <AuthBrand />
        <div className="auth-lang">
          <LanguageToggle variant="pills" compact />
        </div>
        {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
        {children}
        {footer}
      </div>
    </div>
  );
}
