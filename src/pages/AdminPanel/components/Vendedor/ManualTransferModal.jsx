import React from 'react';
import { Search, Loader2, XCircle } from 'lucide-react';

export default function ManualTransferModal({
  selectedBusiness,
  setManualModalOpen,
  manualSearch,
  setManualSearch,
  isSearchingManual,
  manualUsers,
  handleManualTransfer,
  transfering
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-extrabold text-primary text-lg">Asignar Dueño Manual</h3>
            <p className="text-xs text-gray-500">Negocio: {selectedBusiness?.name}</p>
          </div>
          <button onClick={() => setManualModalOpen(false)} className="text-gray-400 hover:text-gray-500 bg-white p-2 rounded-full shadow-sm">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar usuario por nombre o celular..." 
              value={manualSearch}
              onChange={(e) => setManualSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 py-3 pl-11 pr-4 rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/10 text-sm font-medium text-primary"
            />
            {isSearchingManual && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-secondary" />}
          </div>

          <div className="space-y-3">
            {manualUsers.map(u => (
              <div key={u.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 hover:border-secondary/30 transition-all bg-white hover:shadow-sm">
                <div>
                  <p className="font-bold text-sm text-primary">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.phone}</p>
                </div>
                <button 
                  onClick={() => handleManualTransfer(u)}
                  disabled={transfering === selectedBusiness?.slug}
                  className="bg-green-500 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Asignar
                </button>
              </div>
            ))}
            {manualSearch.length >= 2 && manualUsers.length === 0 && !isSearchingManual && (
              <p className="text-center text-sm text-gray-400 py-4">No se encontraron usuarios.</p>
            )}
            {manualSearch.length < 2 && (
              <p className="text-center text-sm text-gray-400 py-4">Escribe al menos 2 caracteres para buscar...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
