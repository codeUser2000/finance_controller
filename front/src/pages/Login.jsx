import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import { useLanguage } from '../context/useLanguage.js';
import AuthShell from '../components/auth/AuthShell.jsx';
import { authErrorMessage } from '../utils/authErrors.js';

export default function Login() {
  const { isLoggedIn, login, verifyLogin2fa } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  async function handleCredentialsSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await login(email, password);
      if (result.requires2fa) {
        setTempToken(result.tempToken);
        setStep('2fa');
        setCode('');
        return;
      }
      navigate('/', { replace: true });
    } catch (loginError) {
      setError(authErrorMessage(loginError.message, t, 'auth.invalidCredentials'));
    } finally {
      setSaving(false);
    }
  }

  async function handle2faSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await verifyLogin2fa(tempToken, code);
      navigate('/', { replace: true });
    } catch (verifyError) {
      setError(authErrorMessage(verifyError.message, t, 'profile.twoFactorInvalidCode'));
    } finally {
      setSaving(false);
    }
  }

  const subtitle =
    step === '2fa' ? t('profile.twoFactorLogin') : t('auth.loginSubtitle');

  return (
    <AuthShell
      subtitle={subtitle}
      footer={
        <p className="auth-switch">
          {t('auth.noAccount')}{' '}
          <Link to="/register">{t('auth.register')}</Link>
        </p>
      }
    >
      {step === 'credentials' ? (
        <form onSubmit={handleCredentialsSubmit}>
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
      ) : (
        <form onSubmit={handle2faSubmit}>
          <label className="form-field">
            <span className="form-label">{t('profile.verificationCode')}</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? t('auth.pleaseWait') : t('profile.verifyAndLogin')}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => {
              setStep('credentials');
              setTempToken('');
              setCode('');
              setError('');
            }}
          >
            {t('profile.backToLogin')}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
