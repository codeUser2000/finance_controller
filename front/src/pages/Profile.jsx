import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageToggle from '../components/layout/LanguageToggle.jsx';
import ThemeToggle from '../components/layout/ThemeToggle.jsx';
import TwoFactorSettings from '../components/profile/TwoFactorSettings.jsx';
import { useAuth } from '../context/useAuth.js';
import { useLanguage } from '../context/useLanguage.js';
import { authErrorMessage } from '../utils/authErrors.js';

function getInitials(name) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '?'
  );
}

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError(t('profile.passwordMismatch'));
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name,
        email,
        currentPassword: newPassword ? currentPassword : '',
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(t('profile.saved'));
    } catch (saveError) {
      setError(authErrorMessage(saveError.message, t, 'profile.saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">{t('profile.title')}</h1>
        <p className="page-subtitle">{t('profile.subtitle')}</p>
      </header>

      <section className="card profile-card">
        <div className="profile-hero">
          <span className="profile-avatar" aria-hidden="true">
            {getInitials(user?.name || '')}
          </span>
          <div>
            <p className="profile-name">{user?.name}</p>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">{t('auth.name')}</span>
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError('');
                setSuccess('');
              }}
            />
          </label>

          <label className="form-field">
            <span className="form-label">{t('auth.email')}</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
                setSuccess('');
              }}
            />
          </label>

          <div className="profile-section">
            <h2 className="profile-section-title">{t('profile.changePassword')}</h2>
            <p className="form-hint">{t('profile.passwordHint')}</p>

            <label className="form-field">
              <span className="form-label">{t('profile.currentPassword')}</span>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  setError('');
                  setSuccess('');
                }}
              />
            </label>

            <label className="form-field">
              <span className="form-label">{t('profile.newPassword')}</span>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setError('');
                  setSuccess('');
                }}
              />
            </label>

            <label className="form-field">
              <span className="form-label">{t('profile.confirmPassword')}</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError('');
                  setSuccess('');
                }}
              />
            </label>
          </div>

          <label className="form-field">
            <span className="form-label">{t('language')}</span>
            <LanguageToggle />
          </label>

          <label className="form-field">
            <span className="form-label">{t('profile.appearance')}</span>
            <ThemeToggle />
          </label>

          <TwoFactorSettings />

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? t('modal.saving') : t('profile.save')}
          </button>
        </form>
      </section>

      <button type="button" className="btn btn-ghost btn-block profile-logout" onClick={handleLogout}>
        {t('auth.logout')}
      </button>
    </>
  );
}
