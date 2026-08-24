import React from 'react';
import { DoorOpen, LogOut } from 'lucide-react';

export default function HeroTopNav({
  volverAtras,
  isLoggedIn,
  userName,
  handleLogout,
  onProtectedAction
}) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-start z-50 pointer-events-none">
      <button data-testid="back-button"
        onClick={volverAtras}
        aria-label="Salir del negocio"
        className="flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 hover:bg-white text-primary hover:text-accent border border-gray-200 transition-all shadow-md shrink-0 pointer-events-auto font-medium text-sm"
      >
        <DoorOpen size={18} />
        <span>Salir del negocio</span>
      </button>

      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        {isLoggedIn ? (
          <button data-testid="logout-button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-gray-200 p-1 pr-3 rounded-full hover:bg-white transition-all shadow-md group"
            title="Cerrar sesión"
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-sm font-sans">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <LogOut size={16} className="text-gray-500 group-hover:text-red-500 transition-colors" />
          </button>
        ) : (
          <button data-testid="login-button"
            onClick={() => onProtectedAction(null)}
            aria-label="Ingresar para ver más detalles"
            className="h-10 px-4 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full flex items-center justify-center hover:bg-white transition-all text-xs font-bold uppercase text-primary tracking-widest gap-2 shadow-md"
          >
            <DoorOpen size={16} className="text-secondary" /> Ingresar
          </button>
        )}
      </div>
    </div>
  );
}
