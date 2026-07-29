// Archivo: src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Search, LogOut, ChevronDown, Download, ShoppingCart, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavMenu from './NavMenu';
import CountryModal from './CountryModal';
import { API_URL } from '../config/api';

const Header = ({
  searchTerm,
  setSearchTerm,
  isLoggedIn,
  isAdmin,
  userName,
  isUserMenuOpen,
  setIsUserMenuOpen,
  handleLogout,
  setAuthModalOpen,
  onHomeClick,
  isMobile,
  onLocationChange
}) => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(window.deferredPromptEvent || null);
  const isIOS = typeof window !== 'undefined' && /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  const [localSearch, setLocalSearch] = useState(searchTerm || '');

  const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm);

  if (searchTerm !== prevSearchTerm) {
    setPrevSearchTerm(searchTerm);
    setLocalSearch(searchTerm || '');
  }

  const handleSaveCountry = async (selectedCountry) => {
    localStorage.setItem('spingamma_selected_country', selectedCountry);

    if (isLoggedIn) {
      try {
        const token = localStorage.getItem('spingamma_token');
        const res = await fetch(`${API_URL}/usuarios/actualizar-localizacion`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ country: selectedCountry })
        });
        if (res.ok) {
          const userStr = localStorage.getItem('spingamma_user');
          if (userStr) {
            const user = JSON.parse(userStr);
            user.country = selectedCountry;
            localStorage.setItem('spingamma_user', JSON.stringify(user));
          }
        }
      } catch (err) {
        console.error("Error saving country to profile:", err);
      }
    }

    if (onLocationChange) {
      onLocationChange(selectedCountry);
    }
  };

  useEffect(() => {
    if (isStandalone) {
      return;
    }


    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPromptEvent = e;
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert("Para instalar en iPhone/iPad: Toca el ícono 'Compartir' en Safari y selecciona 'Agregar a inicio'.");
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      window.deferredPromptEvent = null;
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm h-16 md:h-20 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex items-center justify-between gap-2">

        {/* LOGO E INSTALAR */}
        <div className="flex-shrink-0 flex items-center">
          <div className="flex items-center cursor-pointer" data-testid="header-logo-link" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-[#1D565D] rounded-xl flex items-center justify-center shadow-md overflow-hidden p-1.5 border border-[#1D565D]">
              <img src="/icon-192.webp" alt="Tarjetoso Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-xl lg:text-2xl tracking-tight text-[#1A535C] uppercase hidden md:block ml-3">TARJETOSO</span>
          </div>

          {(!isStandalone && (deferredPrompt || isIOS)) && (
            <button
              onClick={handleInstallClick}
              data-testid="header-install-btn"
              className="flex items-center justify-center bg-[#F9842C] hover:bg-[#e06516] text-white rounded-xl shadow-sm transition-all w-10 h-10 shrink-0 ml-2"
              title="Descargar App"
            >
              <Download size={18} />
            </button>
          )}
        </div>

        {/* BUSCADOR Y NAV */}
        <div className="flex-1 max-w-5xl px-1 sm:px-0 flex items-center justify-end md:justify-center gap-3 md:gap-8">
          <div className="flex-1 max-w-3xl flex items-center bg-gray-50 border border-gray-200 rounded-full shadow-inner py-1.5 pl-4 pr-1.5 focus-within:ring-2 focus-within:ring-[#F9842C] transition-all gap-1 sm:gap-2">
            <input
              data-testid="search-input"
              type="text"
              aria-label="Productos y negocios"
              placeholder="Productos y negocios..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchTerm(localSearch);
                }
              }}
              className="w-full bg-transparent text-[#1A535C] placeholder-gray-400 outline-none text-sm sm:text-base mr-1"
            />
            <button
              onClick={() => setSearchTerm(localSearch)}
              data-testid="search-button"
              className={`w-8 h-8 rounded-full transition-all duration-200 focus:outline-none shrink-0 shadow-sm flex items-center justify-center ${
                localSearch.trim()
                  ? 'bg-[#F9842C] hover:bg-[#e06516] text-white'
                  : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
              }`}
              title="Buscar"
            >
              <Search size={16} />
            </button>
          </div>

          {!isMobile && (
            <div className="flex-shrink-0">
              <NavMenu
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                onHomeClick={onHomeClick}
              />
            </div>
          )}
        </div>

        {/* USUARIO */}
        <div className="flex items-center flex-shrink-0 relative">
          {isLoggedIn ? (
            <>
              {isUserMenuOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
              )}

              <div className="flex items-center gap-1 relative z-50">
                <button
                  onClick={() => navigate('/mis-compras')}
                  className="flex flex-col items-center justify-center p-1.5 hover:bg-gray-100 rounded-xl transition-all duration-200 group min-w-[60px]"
                  title="Mis Pedidos"
                >
                  <div className="group-hover:scale-110 transition-transform mb-1 flex items-center justify-center h-[22px] w-[22px]">
                    <ShoppingCart size={22} className="text-[#1A535C] group-hover:text-[#F9842C] transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1A535C] uppercase tracking-tighter group-hover:text-[#F9842C] leading-none relative z-10">PEDIDOS</span>
                </button>

                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-gray-50 border border-gray-200 py-1 sm:py-1.5 px-1.5 sm:px-3 rounded-full shadow-sm transition-all"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1D565D] flex items-center justify-center shadow-inner flex-shrink-0">
                    <span className="text-white font-bold text-xs sm:text-sm">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <span className="text-sm text-[#757778] hidden lg:block mr-1 truncate max-w-[100px]">
                    Hola, <strong className="text-[#1A535C] font-semibold">{userName.split(' ')[0]}</strong>
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => { setIsCountryModalOpen(true); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-[#1A535C] hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <Globe size={18} /> País
                      </button>
                      <button
                        onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-[#757778] hover:bg-gray-50 hover:text-red-600 rounded-xl transition-colors"
                      >
                        <LogOut size={18} /> Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center justify-center bg-[#1D565D] hover:bg-[#154045] text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-full transition-colors shadow-sm"
            >
              <span className="text-xs sm:text-sm font-semibold tracking-wide">Ingresar</span>
            </button>
          )}
        </div>
      </div>

      <CountryModal
        isOpen={isCountryModalOpen}
        isDismissable={true}
        onClose={() => setIsCountryModalOpen(false)}
        onSave={handleSaveCountry}
        initialCountry={localStorage.getItem('spingamma_selected_country') || 'Bolivia'}
      />
    </header>
  );
};

export default Header;
