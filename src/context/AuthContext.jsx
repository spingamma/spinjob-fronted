// Archivo: src/context/AuthContext.jsx
// Única fuente de verdad para el estado de autenticación.
// AuthProvider es el único export — el contexto vive en hooks/useAuth.js

import { useState, useCallback } from 'react';
import { _AuthContext } from '../hooks/useAuth';

function readUserFromStorage() {
  try {
    const raw = localStorage.getItem('spingamma_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUserFromStorage);

  const login = useCallback((userData, token) => {
    if (token) localStorage.setItem('spingamma_token', token);
    localStorage.setItem('spingamma_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('spingamma_user');
    localStorage.removeItem('spingamma_token');
    setUser(null);
  }, []);

  const updateUser = useCallback((partial) => {
    setUser(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem('spingamma_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = {
    user,
    isLoggedIn: !!user,
    isAdmin: !!(user?.is_admin || user?.is_vendedor),
    isPremium: !!user?.is_premium,
    login,
    logout,
    updateUser,
  };

  return <_AuthContext.Provider value={value}>{children}</_AuthContext.Provider>;
}
