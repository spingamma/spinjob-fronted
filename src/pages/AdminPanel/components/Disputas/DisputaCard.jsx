import React from 'react';
import { ExternalLink, ShieldAlert } from 'lucide-react';

export default function DisputaCard({ disp, handleOpenModal }) {
  return (
    <div
      data-testid={`dispute-card-${disp.id}`}
      className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
          <span className="text-xs font-black uppercase text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
            Orden {disp.order_id}
          </span>
          <span className="text-xs font-extrabold text-[#F9842C]">
            Bs. {disp.total_price?.toFixed(2)}
          </span>
        </div>

        <div className="space-y-2 mb-4 text-xs">
          <p className="text-gray-700">
            <strong className="text-[#1A535C]">Negocio Afectado:</strong> {disp.business_name}
          </p>
          <p className="text-gray-700">
            <strong className="text-[#1A535C]">Cliente Reclamante:</strong> {disp.customer_name} ({disp.customer_phone})
          </p>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60 mt-2">
            <p className="font-bold text-gray-600 mb-1">Motivo de la Disputa:</p>
            <p className="italic text-gray-700">{disp.reason}</p>
          </div>
        </div>

        {disp.receipt_url && (
          <a
            href={disp.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline mb-4"
          >
            <ExternalLink size={14} /> Ver Comprobante de Pago Cargado
          </a>
        )}
      </div>

      <button
        type="button"
        data-testid={`admin-open-dispute-modal-btn-${disp.id}`}
        onClick={() => handleOpenModal(disp)}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
      >
        <ShieldAlert size={16} /> Resolver Disputa y Aplicar Sanciones
      </button>
    </div>
  );
}
