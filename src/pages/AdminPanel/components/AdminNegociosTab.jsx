import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import BusinessDetailsModal from '../../../components/BusinessDetailsModal';
import { useAdminNegociosTab } from '../hooks/Negocios/useAdminNegociosTab';
import NegociosHeader from './Negocios/NegociosHeader';
import BusinessAdminCard from './Negocios/BusinessAdminCard';

export default function AdminNegociosTab({ API_URL, onUpdatePendingCount }) {
  const {
    negocios,
    searchNegocios,
    setSearchNegocios,
    negocioStatusFilter,
    setNegocioStatusFilter,
    editingPlanSlug,
    setEditingPlanSlug,
    editPremium,
    setEditPremium,
    editExpirationDate,
    setEditExpirationDate,
    isSavingPlan,
    cargando,
    error,
    negocioSeleccionado,
    setNegocioSeleccionado,
    startEditingPlan,
    savePlanChanges,
    handleAccion
  } = useAdminNegociosTab(API_URL, onUpdatePendingCount);

  if (cargando && negocios.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center">
        <Loader2 size={40} className="animate-spin text-[#F9842C] mb-2" />
        <p className="text-gray-400 font-bold">Cargando negocios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-8 rounded-2xl max-w-md mx-auto mt-8 text-center border border-red-200">
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <NegociosHeader 
        negocioStatusFilter={negocioStatusFilter}
        setNegocioStatusFilter={setNegocioStatusFilter}
        searchNegocios={searchNegocios}
        setSearchNegocios={setSearchNegocios}
      />

      {negocios.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-400 opacity-20" />
          <p className="text-gray-400 font-bold text-lg">
            {negocioStatusFilter === 'pendientes' ? '¡Todo al día! No hay negocios pendientes.' : 'No se encontraron negocios.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {negocios.map(neg => (
            <BusinessAdminCard 
              key={neg.slug}
              neg={neg}
              handleAccion={handleAccion}
              setNegocioSeleccionado={setNegocioSeleccionado}
              setEditPremium={setEditPremium}
              setEditExpirationDate={setEditExpirationDate}
              startEditingPlan={startEditingPlan}
              editingPlanSlug={editingPlanSlug}
              setEditingPlanSlug={setEditingPlanSlug}
              editPremium={editPremium}
              editExpirationDate={editExpirationDate}
              savePlanChanges={savePlanChanges}
              isSavingPlan={isSavingPlan}
            />
          ))}
        </div>
      )}

      {/* MODAL DE DETALLES DEL NEGOCIO */}
      {negocioSeleccionado && (
        <BusinessDetailsModal 
          business={negocioSeleccionado}
          onClose={() => setNegocioSeleccionado(null)}
          banner={
            negocioSeleccionado?.status === 'pendiente' ? {
              type: 'info',
              content: 'Modo Revisión: Estos son los datos enviados por el usuario. Revisa cuidadosamente antes de aprobar o rechazar.'
            } : null
          }
          actions={
            negocioSeleccionado?.status === 'pendiente' ? (
              <>
                <button 
                  onClick={async () => {
                    const success = await handleAccion(negocioSeleccionado.slug, 'aprobar');
                    if (success) {
                      setNegocioSeleccionado(null);
                    }
                  }}
                  className="flex-1 bg-[#1A535C] hover:bg-[#133d44] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <CheckCircle size={18} /> Aprobar Ahora
                </button>
                <button 
                  onClick={async () => {
                    const success = await handleAccion(negocioSeleccionado.slug, 'rechazar');
                    if (success) {
                      setNegocioSeleccionado(null);
                    }
                  }}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <XCircle size={18} /> Rechazar
                </button>
              </>
            ) : null
          }
        />
      )}
    </div>
  );
}
