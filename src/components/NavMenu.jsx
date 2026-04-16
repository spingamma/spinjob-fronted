// Archivo: src/components/NavMenu.jsx
import React from 'react';
import { Home, Building, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// Icono personalizado: Billetera/Tarjetero (según última imagen de usuario)
const TarjeteroIcon = ({ size = 22 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Cuerpo de la billetera */}
    <rect x="3" y="6" width="18" height="14" rx="2" />
    {/* Tarjeta asomando arriba */}
    <path d="M8 6l4-4 4 4" />
    {/* Cierre/Clasp de la billetera */}
    <path d="M17 10h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a2 2 0 0 1 0-4z" />
    <circle cx="19.5" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const NavMenu = ({ isLoggedIn, isAdmin, onHomeClick, isMobile = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    if (onHomeClick) onHomeClick();
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const menuItems = [
    {
      id: 'home',
      icon: <Home size={22} />,
      label: 'Home',
      onClick: handleHomeClick,
      show: true,
      active: location.pathname === '/'
    },
    {
      id: 'tarjetero',
      icon: <TarjeteroIcon size={22} />,
      label: 'Tarjetero',
      onClick: () => navigate('/tarjetero'),
      show: isLoggedIn,
      active: location.pathname === '/tarjetero'
    },
    {
      id: 'negocios',
      icon: <Building size={22} />,
      label: 'Mis negocios',
      onClick: () => navigate('/mis-negocios'),
      show: isLoggedIn,
      active: location.pathname === '/mis-negocios'
    },
    {
      id: 'admin',
      icon: <Shield size={22} />,
      label: 'Admin',
      onClick: () => navigate('/admin'),
      show: isAdmin,
      active: location.pathname === '/admin'
    }
  ];

  return (
    <div className={`flex ${isMobile ? 'justify-around w-full' : 'items-center gap-1 md:gap-4 lg:ml-6'}`}>
      {menuItems.filter(item => item.show).map(item => (
        <button
          key={item.id}
          onClick={item.onClick}
          className={`
            flex flex-col items-center justify-center transition-all duration-200
            ${isMobile 
              ? 'p-2 flex-1' 
              : 'p-2 rounded-xl hover:bg-orange-50/50 group relative min-w-[72px]'}
            ${item.active ? 'text-[#B95221]' : 'text-gray-500 hover:text-[#B95221]'}
          `}
        >
          <div className={`${item.active ? 'scale-110' : 'group-hover:scale-110'} transition-transform mb-1`}>
            {item.icon}
          </div>
          <span className={`
            font-bold uppercase tracking-tighter text-center
            ${isMobile ? 'text-[9px]' : 'text-[10px]'}
            ${item.active ? 'text-[#B95221]' : 'text-gray-400 group-hover:text-[#B95221]'}
          `}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default NavMenu;
