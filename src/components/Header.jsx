// Archivo: src/components/Header.jsx
import React from 'react';
import { Search, LogOut, UserPlus, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavMenu from './NavMenu';

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
  isMobile
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm h-16 md:h-20 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        
        {/* LOGO */}
        <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-[#1D565D] rounded-xl flex items-center justify-center shadow-md overflow-hidden p-1.5 border border-[#1D565D]">
            <img src="/icon-192.png" alt="SpinJob Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-xl lg:text-2xl tracking-tight text-[#1E3D51] uppercase hidden md:block ml-3">SPINJOB</span>
        </div>
        
        {/* BUSCADOR Y NAV */}
        <div className="flex-1 max-w-4xl px-1 sm:px-0 flex items-center justify-end md:justify-center gap-3 md:gap-8">
          <div className="flex-1 max-w-2xl flex items-center bg-gray-50 border border-gray-200 rounded-full shadow-inner py-1.5 px-4 focus-within:ring-2 focus-within:ring-[#B95221] transition-all gap-1 sm:gap-2">
            <Search size={16} className="text-[#32698F] flex-shrink-0" />
            <input 
              type="text" 
              aria-label="Buscar profesional" 
              placeholder="Buscar profesional..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-transparent text-[#1E3D51] placeholder-gray-400 outline-none text-[13px] sm:text-base" 
            />
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

              <div className="relative z-50">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-gray-50 border border-gray-200 py-1 sm:py-1.5 px-1.5 sm:px-3 rounded-full shadow-sm transition-all"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1D565D] flex items-center justify-center shadow-inner flex-shrink-0">
                    <span className="text-white font-bold text-xs sm:text-sm">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 hidden lg:block mr-1 truncate max-w-[100px]">
                    Hola, <strong className="text-[#1E3D51] font-semibold">{userName.split(' ')[0]}</strong>
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      <button 
                        onClick={() => { handleLogout(); setIsUserMenuOpen(false); }} 
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-xl transition-colors"
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
              <UserPlus size={16} className="md:hidden" />
              <span className="text-sm font-semibold hidden md:block">Ingresar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
