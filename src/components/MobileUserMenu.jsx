import React, { useState } from 'react';
import { User, LogOut, Globe, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CountryModal from './CountryModal';
import PushToggle from './PushToggle';

const MobileUserMenu = ({ onLocationChange }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  const token = localStorage.getItem('spingamma_token');
  const userStr = localStorage.getItem('spingamma_user');
  const isLoggedIn = !!token && !!userStr;
  
  let user = null;
  let isAdmin = false;
  let isVendedor = false;
  
  if (isLoggedIn) {
    try {
      user = JSON.parse(userStr);
      isAdmin = user.is_admin;
      isVendedor = user.is_vendedor;
    } catch (e) {
      console.error(e);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('spingamma_token');
    localStorage.removeItem('spingamma_user');
    window.dispatchEvent(new Event('storage'));
    setIsOpen(false);
    navigate('/');
    window.location.reload();
  };

  const handleSaveCountry = (selectedCountry) => {
    localStorage.setItem('spingamma_selected_country', selectedCountry);
    if (onLocationChange) onLocationChange(selectedCountry);
    window.location.reload(); 
  };

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => {
          const event = new CustomEvent('openAuthModal');
          window.dispatchEvent(event);
        }}
        className="flex flex-col items-center justify-center p-2 flex-1 text-gray-500 hover:text-secondary transition-all"
      >
        <div className="mb-1"><User size={22} /></div>
        <span className="font-bold uppercase tracking-tighter text-center text-[10px] text-gray-400">Perfil</span>
      </button>
    );
  }

  return (
    <>
      <div className="relative flex flex-col flex-1 items-center justify-center">
        {isOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex flex-col items-center justify-center p-2 transition-all duration-200 z-50 ${isOpen ? 'text-secondary' : 'text-gray-500'}`}
        >
          <div className={`mb-1 transition-transform ${isOpen ? 'scale-110' : ''}`}>
             <div className="w-[22px] h-[22px] rounded-full bg-primary/90 flex items-center justify-center shadow-inner">
                <span className="text-white font-bold text-[10px]">
                   {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                </span>
             </div>
          </div>
          <span className={`font-bold uppercase tracking-tighter text-center text-[10px] ${isOpen ? 'text-secondary' : 'text-gray-400'}`}>Perfil</span>
        </button>

        {isOpen && (
          <div className="absolute bottom-full right-4 mb-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
            <div className="p-2 space-y-1">
              {(isAdmin || isVendedor) && (
                <button
                  onClick={() => { setIsOpen(false); navigate('/admin'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-primary hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Shield size={18} /> {isAdmin ? 'Panel Admin' : 'Panel Ventas'}
                </button>
              )}
              <button
                onClick={() => { setIsCountryModalOpen(true); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-primary hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Globe size={18} /> País
              </button>
              
              <PushToggle />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-red-600 rounded-xl transition-colors"
              >
                <LogOut size={18} /> Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      <CountryModal
        isOpen={isCountryModalOpen}
        isDismissable={true}
        onClose={() => setIsCountryModalOpen(false)}
        onSave={handleSaveCountry}
        initialCountry={localStorage.getItem('spingamma_selected_country') || 'Bolivia'}
      />
    </>
  );
};

export default MobileUserMenu;
