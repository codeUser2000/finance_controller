import LanguageToggle from '../layout/LanguageToggle.jsx';
import AuthBrand from './AuthBrand.jsx';

export default function AuthShell({ subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <AuthBrand subtitle={subtitle} />
        <LanguageToggle compact />
        {children}
        {footer}
      </div>
    </div>
  );
}
