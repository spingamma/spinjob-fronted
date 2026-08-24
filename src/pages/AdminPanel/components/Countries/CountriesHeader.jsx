import React from 'react';
import { Globe, RefreshCw, Plus } from 'lucide-react';

export default function CountriesHeader({ fetchCountries, setIsAddingCountry }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur border border-gray-100 rounded-3xl p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <Globe size={22} className="text-secondary" />
          Gestión de Localizaciones
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Administra los países de operación y sus departamentos correspondientes.
        </p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={fetchCountries}
          className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl transition-all"
          title="Refrescar datos"
        >
          <RefreshCw size={18} />
        </button>
        <button
          onClick={() => setIsAddingCountry(true)}
          className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>Agregar País</span>
        </button>
      </div>
    </div>
  );
}
