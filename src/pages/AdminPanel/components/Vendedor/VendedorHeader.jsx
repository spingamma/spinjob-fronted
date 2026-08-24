import React from 'react';
import { Store, Copy, Check } from 'lucide-react';

export default function VendedorHeader({
  sellerCode,
  handleCopyCode,
  codeCopied,
  isAdmin,
  internalTab,
  setInternalTab
}) {
  return (
    <div>
      <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
        <Store size={24} className="text-secondary" />
        Gestión de Ventas
      </h2>
      
      {/* Código de Vendedor */}
      {sellerCode && (
        <div className="mt-3 flex items-center gap-3 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/15 rounded-2xl px-4 py-2.5 w-fit">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tu Código de Vendedor</span>
            <span data-testid="seller-code-display" className="text-lg font-black text-primary tracking-widest font-mono">{sellerCode}</span>
          </div>
          <button
            data-testid="copy-seller-code-btn"
            onClick={handleCopyCode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              codeCopied 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-white hover:bg-secondary hover:text-white text-secondary border border-secondary/30 hover:border-transparent shadow-sm'
            }`}
            title="Copiar código"
          >
            {codeCopied ? <Check size={14} /> : <Copy size={14} />}
            {codeCopied ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      )}

      {/* Tabs Internas para Admin */}
      {isAdmin && (
        <div className="flex bg-gray-100 rounded-xl p-1 mt-3 w-fit">
          <button
            onClick={() => setInternalTab('mis_ventas')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${internalTab === 'mis_ventas' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-gray-500'}`}
          >
            Mis Ventas (Pendientes)
          </button>
          <button
            onClick={() => setInternalTab('general')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${internalTab === 'general' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-gray-500'}`}
          >
            General (Todos los Vendedores)
          </button>
        </div>
      )}
    </div>
  );
}
