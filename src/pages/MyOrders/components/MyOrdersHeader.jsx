import React from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function MyOrdersHeader({ 
  navigate, 
  isBusinessMode, 
  setIsBusinessMode 
}) {
  return (
    <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm border-b border-gray-100 flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} data-testid="my-orders-back-btn" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-primary">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="bg-secondary/10 p-2 rounded-xl">
            <ShoppingBag size={20} className="text-secondary" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight">Mis Pedidos</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-100" data-testid="business-mode-switch-container">
        <span className={`text-xs font-bold transition-colors ${isBusinessMode ? 'text-secondary' : 'text-gray-600'}`}>
          Modo Negocio
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isBusinessMode}
          onClick={() => setIsBusinessMode(!isBusinessMode)}
          data-testid="business-mode-switch"
          className="relative inline-flex items-center h-6 w-12 cursor-pointer focus:outline-none select-none shrink-0"
        >
          <span className={`w-full h-3 rounded-full transition-colors duration-300 ${isBusinessMode ? 'bg-secondary' : 'bg-gray-300'}`} />
          <span className={`absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow-md border border-gray-200/80 transform transition-transform duration-300 flex items-center justify-center ${isBusinessMode ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>
    </div>
  );
}
