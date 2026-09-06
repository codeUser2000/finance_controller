import { useState } from 'react';
import { useAuth } from '../../context/useAuth.js';
import { useLanguage } from '../../context/useLanguage.js';
import { useToast } from '../../context/ToastProvider.jsx';
import { authErrorMessage } from '../../utils/authErrors.js';

export default function TwoFactorSettings() {
  const { user, setup2fa, enable2fa, disable2fa } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [setup, setSetup] = useState(null);
  const [enableCode, setEnableCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleStartSetup() {
    setLoading(true);
    setError('');
    try {
      const data = await setup2fa();
      setSetup(data);
      setEnableCode('');
    } catch (setupError) {
      const message = authErrorMessage(setupError.message, t, 'profile.twoFactorSetupFailed');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await enable2fa(enableCode);
      setSetup(null);
      setEnableCode('');
      toast.success(t('profile.twoFactorEnabled'));
    } catch (enableError) {
      const message = authErrorMessage(enableError.message, t, 'profile.twoFactorInvalidCode');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await disable2fa({ code: disableCode, password: disablePassword });
      setDisableCode('');
      setDisablePassword('');
      toast.success(t('profile.twoFactorDisabled'));
    } catch (disableError) {
      const message = authErrorMessage(disableError.message, t, 'profile.twoFactorDisableFailed');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile-subsection">
      <h3 className="profile-subsection-title">{t('profile.twoFactor')}</h3>
      <p className="form-hint">{t('profile.twoFactorHint')}</p>

      {user?.totpEnabled ? (
        <form className="profile-inline-form" onSubmit={handleDisable}>
          <p className="profile-status is-enabled">{t('profile.twoFactorOn')}</p>
          <label className="form-field">
            <span className="form-label">{t('profile.verificationCode')}</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={disableCode}
              onChange={(event) => {
                setDisableCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
            />
          </label>
          <label className="form-field">
            <span className="form-label">{t('profile.currentPassword')}</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={disablePassword}
              onChange={(event) => {
                setDisablePassword(event.target.value);
                setError('');
              }}
            />
          </label>
          <div className="profile-actions">
            <button type="submit" className="btn btn-ghost btn-small" disabled={loading}>
              {loading ? t('modal.saving') : t('profile.disableTwoFactor')}
            </button>
          </div>
        </form>
      ) : setup ? (
        <form className="profile-inline-form" onSubmit={handleEnable}>
          <p className="form-hint">{t('profile.twoFactorScan')}</p>
          <img src={setup.qrCode} alt="" className="two-factor-qr" />
          <p className="two-factor-secret">
            <span className="form-label">{t('profile.manualKey')}</span>
            <code>{setup.secret}</code>
          </p>
          <label className="form-field">
            <span className="form-label">{t('profile.verificationCode')}</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={enableCode}
              onChange={(event) => {
                setEnableCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
            />
          </label>
          <div className="profile-actions">
            <button type="submit" className="btn btn-primary btn-small" disabled={loading}>
              {loading ? t('modal.saving') : t('profile.confirmTwoFactor')}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => {
                setSetup(null);
                setEnableCode('');
                setError('');
              }}
            >
              {t('profile.cancelSetup')}
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="profile-status">{t('profile.twoFactorOff')}</p>
          <div className="profile-actions">
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={handleStartSetup}
              disabled={loading}
            >
              {loading ? t('modal.saving') : t('profile.enableTwoFactor')}
            </button>
          </div>
        </>
      )}

      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
