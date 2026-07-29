import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DisputasHeader({ filterStatus, setFilterStatus }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div>
        <h2 className="text-xl font-black text-[#1A535C] flex items-center gap-2">
          <ShieldAlert className="text-red-500" size={24} />
          Gestión de Disputas y Fraudes en Pagos QR
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Audita reclamos de clientes por no entrega y aplica sanciones de visibilidad o reseñas de 1 estrella.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          data-testid="filter-disputes-pending"
          onClick={() => setFilterStatus('pendientes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterStatus === 'pendientes'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pendientes
        </button>
        <button
          data-testid="filter-disputes-resolved"
          onClick={() => setFilterStatus('resueltas')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterStatus === 'resueltas'
              ? 'bg-[#1A535C] text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Historial Resueltas
        </button>
      </div>
    </div>
  );
}
