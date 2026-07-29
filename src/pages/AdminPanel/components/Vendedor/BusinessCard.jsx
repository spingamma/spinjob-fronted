import React from 'react';
import { Store, CheckCircle, XCircle, AlertCircle, ArrowRightLeft, Loader2, Search } from 'lucide-react';

export default function BusinessCard({
  b,
  transfering,
  handleTransfer,
  setSelectedBusiness,
  setManualModalOpen
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
          <img 
            src={b.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=F8F9FA&color=1E3D51`} 
            alt={b.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1A535C] truncate" title={b.name}>{b.name}</h3>
          <p className="text-xs text-[#757778] truncate">{b.title || 'Sin título'}</p>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-50">
        <div className="p-4 bg-gray-50 flex flex-col gap-3">
          {b.owner_id && !b.is_held_by_seller ? (
            <div className="flex items-center gap-2 text-[#1A535C] bg-[#1A535C]/10 p-3 rounded-xl border border-[#1A535C]/20">
              <CheckCircle size={18} className="shrink-0" />
              <div>
                <p className="text-xs font-bold">Dueño Asignado</p>
                <p className="text-[10px] text-[#1A535C]/80">Transferido exitosamente.</p>
              </div>
            </div>
          ) : b.is_held_by_seller ? (
            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-xl border border-orange-100">
              <Store size={18} className="shrink-0" />
              <div>
                <p className="text-xs font-bold">Pendiente de Vender</p>
                <p className="text-[10px] text-orange-600/80">Vendedor actual: {b.owner_name}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#757778] bg-gray-50 p-3 rounded-xl border border-gray-100">
              <XCircle size={18} className="shrink-0" />
              <div>
                <p className="text-xs font-bold">Sin usuario registrado</p>
                <p className="text-[10px] text-[#757778]/80">Nadie se registró con este WhatsApp.</p>
              </div>
            </div>
          )}

          {b.is_held_by_seller && b.possible_owners && b.possible_owners.length > 0 && (
            <div className="flex flex-col gap-3 mt-1">
              {b.possible_owners.map((po, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl border border-[#F9842C]/20 bg-[#F9842C]/5 relative">
                  <div className="flex items-start gap-2 text-[#F9842C]">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">Posible Dueño: {po.name}</p>
                      <p className="text-[10px] text-[#F9842C]/80">{po.phone}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleTransfer(b, po)}
                    disabled={transfering === b.slug}
                    className="w-full bg-[#1A535C] hover:bg-[#152b39] text-white py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {transfering === b.slug ? <Loader2 size={12} className="animate-spin" /> : <ArrowRightLeft size={12} />}
                    Transferir a {po.name.split(' ')[0]}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>                
        {/* Botón de asignación manual siempre disponible si está retenido por un vendedor o no tiene dueño */}
        {(!b.owner_id || b.is_held_by_seller) && (
          <button
            onClick={() => { setSelectedBusiness(b); setManualModalOpen(true); }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-[#757778] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-2"
          >
            <Search size={14} /> Transferir Manualmente
          </button>
        )}
      </div>
    </div>
  );
}
