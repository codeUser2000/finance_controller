export function authErrorMessage(message, t, fallbackKey) {
  const text = String(message || '');

  if (text.includes('already registered')) return t('auth.emailTaken');
  if (text.includes('invalid email or password')) return t('auth.invalidCredentials');
  if (text.includes('at least 6')) return t('auth.passwordHint');
  if (text.includes('valid email')) return t('auth.invalidEmail');
  if (text.includes('name is required')) return t('auth.nameRequired');
  if (text.includes('current password is incorrect')) return t('profile.wrongPassword');
  if (text.includes('current password is required')) return t('profile.currentPasswordRequired');
  if (text.includes('invalid verification code')) return t('profile.twoFactorInvalidCode');
  if (text.includes('invalid verification token')) return t('profile.twoFactorInvalidCode');
  if (text.includes('start two-step verification setup first')) {
    return t('profile.twoFactorSetupFirst');
  }
  if (text.includes('two-step verification is already enabled')) {
    return t('profile.twoFactorAlreadyOn');
  }
  if (text.includes('two-step verification is not enabled')) {
    return t('profile.twoFactorNotOn');
  }

  return t(fallbackKey);
}
