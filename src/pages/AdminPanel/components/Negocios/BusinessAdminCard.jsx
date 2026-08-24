import React from 'react';
import { CheckCircle, XCircle, Clock, ShieldCheck, Eye, Loader2 } from 'lucide-react';

export default function BusinessAdminCard({
  neg,
  handleAccion,
  setNegocioSeleccionado,
  setEditPremium,
  setEditExpirationDate,
  startEditingPlan,
  editingPlanSlug,
  setEditingPlanSlug,
  editPremium,
  editExpirationDate,
  savePlanChanges,
  isSavingPlan
}) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between gap-4 lg:gap-8 transition-all hover:shadow-md">
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-2.5">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
            <img 
              src={neg.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(neg.name)}&background=F8F9FA&color=1A535C`} 
              alt={neg.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-extrabold text-2xl text-primary">{neg.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="bg-secondary/10 text-secondary text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-secondary/20">
                {neg.status}
              </span>
              {neg.status === 'aprobado' && (
                <a
                  href={`/perfil/${neg.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gray-50 hover:bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-full font-bold border border-gray-200 flex items-center gap-1 transition-all"
                >
                  <Eye size={12} className="text-gray-500" /> Ver Tarjeta
                </a>
              )}
              {neg.referred_by_name && (
                <span className="bg-purple-100 text-purple-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-purple-200">
                  🎟️ Vendedor: {neg.referred_by_name} · 3 meses prueba
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
            <ShieldCheck size={16} className="text-primary" />
            {neg.title} • {neg.category}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
            <Clock size={16} className="text-primary" />
            {[neg.neighborhood, neg.state].filter(Boolean).join(', ')}
          </div>
        </div>

        {/* Sección de Gestión de Plan para Negocios */}
        {neg.status === 'aprobado' && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-100">
            {editingPlanSlug === neg.slug ? (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                <h4 className="font-bold text-sm text-primary">Editar Plan del Negocio</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Plan</label>
                    <select 
                      value={editPremium ? 'premium' : 'basico'}
                      onChange={(e) => setEditPremium(e.target.value === 'premium')}
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm font-semibold outline-none focus:border-secondary text-primary"
                    >
                      <option value="basico">Plan Básico</option>
                      <option value="premium">Plan Premium</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha de Vencimiento</label>
                    <input 
                      type="date"
                      value={editExpirationDate}
                      onChange={(e) => setEditExpirationDate(e.target.value)}
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm font-semibold outline-none focus:border-secondary text-primary"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingPlanSlug(null)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    disabled={isSavingPlan}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => savePlanChanges(neg.slug)}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    disabled={isSavingPlan}
                  >
                    {isSavingPlan && <Loader2 size={12} className="animate-spin" />}
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-500">Plan:</span>
                    {neg.premium ? (
                      <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase border border-amber-200/50 flex items-center gap-1">
                        ⭐ Premium
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase border border-blue-200/50">
                        Plan Básico
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-500">Vencimiento:</span>
                    <span className="text-xs font-bold text-primary">
                      {neg.expiration_date ? neg.expiration_date : 'Sin vencimiento registrado'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto lg:min-w-[160px] justify-center lg:mt-0">
        {neg.status === 'pendiente' && (
          <>
            <button 
              onClick={() => handleAccion(neg.slug, 'aprobar')}
              className="flex-1 bg-primary hover:bg-primary/90 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
            >
              <CheckCircle size={20} /> Aprobar
            </button>
            <button 
              onClick={() => {
                setNegocioSeleccionado(neg);
                setEditPremium(neg.premium);
                const rawDate = neg.expiration_date || '';
                const dateOnly = rawDate.split(' ')[0] || '';
                setEditExpirationDate(dateOnly);
              }}
              className="bg-gray-50 hover:bg-gray-100 text-gray-500 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer self-center lg:self-stretch"
            >
              <Eye size={16} /> Ver Datos
            </button>
            <button 
              onClick={() => handleAccion(neg.slug, 'rechazar')}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <XCircle size={20} /> Rechazar
            </button>
          </>
        )}

        {neg.status === 'aprobado' && (
          <button
            onClick={() => startEditingPlan(neg)}
            className="bg-gray-50 hover:bg-gray-100 text-secondary py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer self-center lg:self-stretch"
          >
            Gestionar Plan
          </button>
        )}
      </div>
    </div>
  );
}
