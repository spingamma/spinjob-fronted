import React from 'react';
import { ShieldAlert, AlertTriangle, EyeOff, Star, Loader2 } from 'lucide-react';

export default function DisputaResolutionModal({
  selectedDisputa,
  setSelectedDisputa,
  decision,
  setDecision,
  hideVisibility,
  setHideVisibility,
  addOneStar,
  setAddOneStar,
  adminNotes,
  setAdminNotes,
  isResolving,
  handleResolverDisputa
}) {
  if (!selectedDisputa) return null;

  return (
    <div data-testid="dispute-resolution-modal" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <h3 className="font-extrabold text-lg text-[#1A535C] flex items-center gap-2">
            <ShieldAlert className="text-red-500" size={20} />
            Resolución de Orden {selectedDisputa.order_id}
          </h3>
          <button
            data-testid="close-dispute-modal-btn"
            onClick={() => setSelectedDisputa(null)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleResolverDisputa} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              1. Dictamen de la Resolución *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                data-testid="btn-decision-customer"
                onClick={() => setDecision('a_favor_del_cliente')}
                className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  decision === 'a_favor_del_cliente'
                    ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                Favor del Cliente (Infracción Negocio)
              </button>
              <button
                type="button"
                data-testid="btn-decision-business"
                onClick={() => setDecision('a_favor_del_negocio')}
                className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  decision === 'a_favor_del_negocio'
                    ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                Favor del Negocio (Pago Valido / Entrega OK)
              </button>
            </div>
          </div>

          {decision === 'a_favor_del_cliente' && (
            <div className="bg-red-50/50 border border-red-200/80 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-extrabold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} /> 2. Opciones Independientes de Sanción (Checkboxes)
              </p>

              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-red-100/50 transition-all">
                <input
                  type="checkbox"
                  data-testid="chk-hide-visibility"
                  checked={hideVisibility}
                  onChange={(e) => setHideVisibility(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <EyeOff size={14} className="text-red-500" /> Quitar visibilidad al negocio
                  </span>
                  <p className="text-[10px] text-gray-500">
                    Oculta la tarjeta del directorio público (estado = suspendido).
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-red-100/50 transition-all">
                <input
                  type="checkbox"
                  data-testid="chk-one-star-review"
                  checked={addOneStar}
                  onChange={(e) => setAddOneStar(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <Star size={14} className="text-amber-500 fill-amber-500" /> Asignar 1 estrella y 1 reseña de advertencia
                  </span>
                  <p className="text-[10px] text-gray-500">
                    Publica o habilita una reseña penalizadora de 1 estrella en su perfil.
                  </p>
                </div>
              </label>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Notas de Administración (Opcional)
            </label>
            <textarea
              data-testid="dispute-admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Detalles internos sobre la solución de la disputa..."
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-[#1A535C] outline-none focus:border-[#F9842C]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedDisputa(null)}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="submit-dispute-resolution-btn"
              disabled={isResolving}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isResolving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Aplicar Resolución y Sanciones"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
