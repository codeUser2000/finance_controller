export function authErrorMessage(message, t, fallbackKey) {
  const text = String(message || '');

  if (text.includes('already registered')) return t('auth.emailTaken');
  if (text.includes('invalid email or password')) return t('auth.invalidCredentials');
  if (text.includes('at least 6')) return t('auth.passwordHint');
  if (text.includes('valid email')) return t('auth.invalidEmail');
  if (text.includes('name is required')) return t('auth.nameRequired');

  return t(fallbackKey);
}
