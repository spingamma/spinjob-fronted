import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, Eye, BarChart2, Loader2, Trash2 } from 'lucide-react';

export default function BusinessListItem({
  negocio,
  isAdmin,
  isDeleting,
  togglingSlug,
  onToggleOpen,
  onDelete,
  onOpenPremiumModal
}) {
  const neg = negocio;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-xl text-primary">{neg.name}</h3>
          <p className="text-gray-500 text-sm">{neg.title} • {neg.category}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {neg.status === 'aprobado' && (
            <>
              <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full font-bold text-sm">
                <CheckCircle2 size={16} /> Aprobado
              </div>
              {neg.premium ? (
                <div className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-xs">
                  <span>⭐ Plan Premium</span>
                  {neg.expiration_date && (
                    <span className="text-amber-600/90 font-normal">
                      (hasta {new Date(neg.expiration_date.replace(' ', 'T')).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })})
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                  <span>Plan Gratuito</span>
                </div>
              )}
              {/* Switch Abierto/Cerrado */}
              <button
                onClick={() => onToggleOpen(neg.slug)}
                disabled={togglingSlug === neg.slug}
                data-testid={`toggle-open-${neg.slug}`}
                title={neg.is_open !== false ? "Abierto (Click para cerrar)" : "Cerrado (Click para abrir)"}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs border cursor-pointer ${
                  neg.is_open !== false
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <span>{neg.is_open !== false ? 'Abierto' : 'Cerrado'}</span>
                <div className={`w-6 h-3.5 rounded-full p-0.5 transition-colors relative flex items-center ${
                  neg.is_open !== false ? 'bg-green-600' : 'bg-gray-400'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full bg-white shadow-xs transform transition-transform ${
                    neg.is_open !== false ? 'translate-x-2.5' : 'translate-x-0'
                  }`} />
                </div>
              </button>
            </>
          )}
          {neg.status === 'pendiente' && (
            <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1 rounded-full font-bold text-sm">
              <Clock size={16} /> En Revisión
            </div>
          )}
          {neg.status === 'rechazado' && (
            <>
              <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full font-bold text-sm mb-2">
                <XCircle size={16} /> Rechazado
              </div>
              <p className="text-xs text-red-500 max-w-xs text-right bg-red-50/50 p-2 rounded-lg border border-red-100">
                <strong>Motivo:</strong> {neg.rejection_reason || "No cumple las políticas."}
              </p>
            </>
          )}
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="pt-4 border-t border-gray-100 flex flex-wrap justify-end gap-4">
        {neg.status === 'aprobado' && (
          <Link
            to={`/perfil/${neg.slug}`}
            className="flex items-center gap-2 text-sm font-bold text-primary/80 hover:text-secondary transition-colors"
          >
            <Eye size={18} /> Ver Tarjeta Pública
          </Link>
        )}

        {/* Botón Ver Métricas - Solo para negocios aprobados */}
        {neg.status === 'aprobado' && (
          neg.premium ? (
            <Link
              to={`/metricas/${neg.slug}`}
              className="flex items-center justify-between w-full sm:w-auto gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100"
            >
              <span className="flex items-center gap-1.5">
                <BarChart2 size={16} /> Métricas
              </span>
            </Link>
          ) : (
            <button
              onClick={() => onOpenPremiumModal('Métricas')}
              className="flex items-center justify-between w-full sm:w-auto gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 text-left cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <BarChart2 size={16} /> Métricas
              </span>
              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-0.5" title="Característica Premium">
                🔒 Premium
              </span>
            </button>
          )
        )}

        {/* Botón de eliminar (para pendientes, rechazados o admin) */}
        {(neg.status === 'pendiente' || neg.status === 'rechazado' || isAdmin) && (
          <button
            onClick={() => onDelete(neg.slug)}
            disabled={isDeleting === neg.slug}
            className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isDeleting === neg.slug ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
            Eliminar Solicitud
          </button>
        )}
      </div>
    </div>
  );
}
