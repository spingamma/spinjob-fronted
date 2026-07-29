import { useCallback } from 'react';

export default function useProfileAuth() {
  const userObj = (() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  })();

  const isLoggedIn = userObj !== null;
  const userName = userObj?.nombre || '';
  const isVerified = userObj?.is_verified === true || userObj?.is_verified === "true" || userObj?.is_verified === 1;
  const isAdmin = userObj?.is_admin === true;

  const handleLogout = useCallback(() => {
    localStorage.removeItem('spingamma_user');
    window.location.reload();
  }, []);

  return { userObj, isLoggedIn, userName, isVerified, isAdmin, handleLogout };
}
