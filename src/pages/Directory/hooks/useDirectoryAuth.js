import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

export function useDirectoryAuth({ onLocationChange }) {
  const navigate = useNavigate();
  const { isLoggedIn, user, login, logout, isAdmin } = useAuth();
  
  const userName = user?.nombre || '';

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingSlug, setPendingSlug] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleOpenAuth = () => setAuthModalOpen(true);
    window.addEventListener('openAuthModal', handleOpenAuth);
    return () => window.removeEventListener('openAuthModal', handleOpenAuth);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleRegisterSuccess = (formData) => {
    // AuthModal already set the token in localStorage, so we just read it
    login(formData, localStorage.getItem('spingamma_token'));
    
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
