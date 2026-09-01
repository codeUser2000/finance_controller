import { useCallback, useMemo, useState } from 'react';
import { AuthContext } from './authContext.js';
import { api } from '../api/client.js';

const TOKEN_KEY = 'money-token';
const USER_KEY = 'money-user';

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(readUser);

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken && nextUser) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setToken(nextToken || '');
    setUser(nextUser || null);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.requires2fa) {
      return { requires2fa: true, tempToken: data.tempToken };
    }
    persist(data.token, data.user);
    return { requires2fa: false, user: data.user };
  }, [persist]);

  const verifyLogin2fa = useCallback(
    async (tempToken, code) => {
      const data = await api.post('/auth/2fa/verify-login', {
        temp_token: tempToken,
        code,
      });
      persist(data.token, data.user);
      return data.user;
    },
    [persist],
  );

  const register = useCallback(async (name, email, password) => {
    const data = await api.post('/auth/register', { name, email, password });
    persist(data.token, data.user);
    return data.user;
  }, [persist]);

  const logout = useCallback(() => {
    persist('', null);
  }, [persist]);

  const updateProfile = useCallback(
    async ({ name, email, currentPassword, newPassword }) => {
      const payload = { name, email };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }
      const nextUser = await api.put('/auth/me', payload);
      persist(token, nextUser);
      return nextUser;
    },
    [persist, token],
  );

  const setup2fa = useCallback(async () => api.post('/auth/2fa/setup'), []);

  const enable2fa = useCallback(
    async (code) => {
      const nextUser = await api.post('/auth/2fa/enable', { code });
      persist(token, nextUser);
      return nextUser;
    },
    [persist, token],
  );

  const disable2fa = useCallback(
    async ({ code, password }) => {
      const nextUser = await api.post('/auth/2fa/disable', { code, password });
      persist(token, nextUser);
      return nextUser;
    },
    [persist, token],
  );

  const value = useMemo(
    () => ({
      token,
      user,
      isLoggedIn: Boolean(token),
      login,
      verifyLogin2fa,
      register,
      logout,
      updateProfile,
      setup2fa,
      enable2fa,
      disable2fa,
    }),
    [
      token,
      user,
      login,
      verifyLogin2fa,
      register,
      logout,
      updateProfile,
      setup2fa,
      enable2fa,
      disable2fa,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
