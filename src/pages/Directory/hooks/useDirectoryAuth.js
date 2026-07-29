import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useDirectoryAuth({ onLocationChange }) {
  const navigate = useNavigate();

  // Estados de Autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [userName, setUserName] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).nombre; } catch { return ''; }
    }
    return '';
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.is_admin === true || parsed.is_vendedor === true;
      } catch { return false; }
    }
    return false;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingSlug, setPendingSlug] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('spingamma_user');
    setIsLoggedIn(false);
    setUserName('');
    setIsAdmin(false);
  };

  const handleRegisterSuccess = (formData) => {
    localStorage.setItem('spingamma_user', JSON.stringify(formData));
    setIsLoggedIn(true);
    setUserName(formData.nombre);
    setIsAdmin(formData.is_admin === true || formData.is_vendedor === true);
    setAuthModalOpen(false);
    
    if (formData.country) {
      if (onLocationChange) onLocationChange(formData.country);
      localStorage.setItem('spingamma_selected_country', formData.country);
    }
    
    if (pendingSlug) {
      navigate(`/perfil/${pendingSlug}`);
      setPendingSlug(null);
    }
  };

  const handleCardClick = (slug) => {
    setPendingSlug(slug);
    setAuthModalOpen(true);
  };

  return {
    isLoggedIn,
    userName,
    isAdmin,
    authModalOpen,
    setAuthModalOpen,
    pendingSlug,
    setPendingSlug,
    isUserMenuOpen,
    setIsUserMenuOpen,
    handleLogout,
    handleRegisterSuccess,
    handleCardClick
  };
}
