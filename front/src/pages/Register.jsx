import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import { useLanguage } from '../context/useLanguage.js';
import AuthShell from '../components/auth/AuthShell.jsx';
import { authErrorMessage } from '../utils/authErrors.js';

export default function Register() {
  const { isLoggedIn, register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
      await register(name, email, password);
      navigate('/', { replace: true });
    } catch (registerError) {
      setError(authErrorMessage(registerError.message, t, 'auth.registerFailed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell
      subtitle={t('auth.registerSubtitle')}
      footer={
        <p className="auth-switch">
          {t('auth.hasAccount')}{' '}
          <Link to="/login">{t('auth.login')}</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit}>
        <label className="form-field">
          <span className="form-label">{t('auth.name')}</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
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
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <span className="form-hint">{t('auth.passwordHint')}</span>
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
          {saving ? t('auth.pleaseWait') : t('auth.register')}
        </button>
      </form>
    </AuthShell>
  );
}
