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
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  async function handleAccountSave(event) {
    event.preventDefault();
    setAccountError('');
    setAccountSuccess('');
    setSavingAccount(true);

    try {
      await updateProfile({ name, email, currentPassword: '', newPassword: '' });
      setAccountSuccess(t('profile.accountSaved'));
    } catch (saveError) {
      setAccountError(authErrorMessage(saveError.message, t, 'profile.saveFailed'));
    } finally {
      setSavingAccount(false);
    }
  }

  async function handleSecuritySave(event) {
    event.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (!newPassword) {
      setSecurityError(t('profile.enterNewPassword'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError(t('profile.passwordMismatch'));
      return;
    }

    setSavingSecurity(true);
    try {
      await updateProfile({
        name: user?.name || name,
        email: user?.email || email,
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSecuritySuccess(t('profile.passwordSaved'));
    } catch (saveError) {
      setSecurityError(authErrorMessage(saveError.message, t, 'profile.saveFailed'));
    } finally {
      setSavingSecurity(false);
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

      <section className="card profile-panel">
        <div className="profile-hero">
          <span className="profile-avatar" aria-hidden="true">
            {getInitials(user?.name || '')}
          </span>
          <div className="profile-hero-body">
            <div className="profile-hero-head">
              <p className="profile-name">{user?.name}</p>
              <LanguageToggle compact small />
            </div>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>
      </section>

      <section className="card profile-panel">
        <h2 className="profile-panel-title">{t('profile.sectionAccount')}</h2>
        <p className="form-hint">{t('profile.sectionAccountHint')}</p>
        <form className="profile-form" onSubmit={handleAccountSave}>
          <label className="form-field">
            <span className="form-label">{t('auth.name')}</span>
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setAccountError('');
                setAccountSuccess('');
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
                setAccountError('');
                setAccountSuccess('');
              }}
            />
          </label>
          {accountError ? <p className="form-error">{accountError}</p> : null}
          {accountSuccess ? <p className="form-success">{accountSuccess}</p> : null}
          <div className="profile-actions">
            <button type="submit" className="btn btn-primary btn-small" disabled={savingAccount}>
              {savingAccount ? t('modal.saving') : t('profile.save')}
            </button>
          </div>
        </form>
      </section>

      <section className="card profile-panel">
        <h2 className="profile-panel-title">{t('profile.sectionSecurity')}</h2>
        <p className="form-hint">{t('profile.sectionSecurityHint')}</p>

        <form className="profile-form" onSubmit={handleSecuritySave}>
          <h3 className="profile-subsection-title">{t('profile.changePassword')}</h3>
          <label className="form-field">
            <span className="form-label">{t('profile.currentPassword')}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setSecurityError('');
                setSecuritySuccess('');
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
                setSecurityError('');
                setSecuritySuccess('');
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
                setSecurityError('');
                setSecuritySuccess('');
              }}
            />
          </label>
          {securityError ? <p className="form-error">{securityError}</p> : null}
          {securitySuccess ? <p className="form-success">{securitySuccess}</p> : null}
          <div className="profile-actions">
            <button type="submit" className="btn btn-primary btn-small" disabled={savingSecurity}>
              {savingSecurity ? t('modal.saving') : t('profile.updatePassword')}
            </button>
          </div>
        </form>

        <TwoFactorSettings />
      </section>

      <section className="card profile-panel">
        <h2 className="profile-panel-title">{t('profile.sectionPreferences')}</h2>
        <p className="form-hint">{t('profile.sectionPreferencesHint')}</p>
        <div className="profile-preferences">
          <label className="form-field is-compact">
            <span className="form-label">{t('profile.appearance')}</span>
            <ThemeToggle />
          </label>
        </div>
      </section>

      <section className="card profile-panel">
        <h2 className="profile-panel-title">{t('profile.sectionSession')}</h2>
        <p className="form-hint">{t('profile.sectionSessionHint')}</p>
        <div className="profile-actions">
          <button type="button" className="btn btn-ghost btn-small" onClick={handleLogout}>
            {t('auth.logout')}
          </button>
        </div>
      </section>
    </>
  );
}
