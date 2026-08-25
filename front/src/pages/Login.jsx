import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { WalletCards } from 'lucide-react';
import { useAuth } from '../context/useAuth.js';
import { useLanguage } from '../context/useLanguage.js';
import LanguageToggle from '../components/layout/LanguageToggle.jsx';
import { authErrorMessage } from '../utils/authErrors.js';

export default function Login() {
  const { isLoggedIn, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (loginError) {
      setError(authErrorMessage(loginError.message, t, 'auth.invalidCredentials'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-top">
          <span className="brand-mark">
            <WalletCards size={18} />
          </span>
          <div>
            <h1 className="auth-title">{t('appName')}</h1>
            <p className="auth-subtitle">{t('auth.loginSubtitle')}</p>
          </div>
        </div>
        <LanguageToggle />
        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">{t('auth.email')}</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span className="form-label">{t('auth.password')}</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? t('auth.pleaseWait') : t('auth.login')}
          </button>
        </form>
        <p className="auth-switch">
          {t('auth.noAccount')}{' '}
          <Link to="/register">{t('auth.register')}</Link>
        </p>
      </div>
    </div>
  );
}
