// Archivo: src/components/BottomNavbar.jsx
import React from 'react';
import NavMenu from './NavMenu';

const BottomNavbar = ({ isLoggedIn, isAdmin, onHomeClick }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-[100] pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto px-4 py-2">
        <NavMenu 
          isLoggedIn={isLoggedIn} 
          isAdmin={isAdmin} 
          onHomeClick={onHomeClick} 
          isMobile={true} 
        />
      </div>
    </nav>
  );
};

export default BottomNavbar;
