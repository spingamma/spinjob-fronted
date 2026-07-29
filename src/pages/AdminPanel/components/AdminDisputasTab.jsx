import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAdminDisputas } from '../hooks/Disputas/useAdminDisputas';
import DisputasHeader from './Disputas/DisputasHeader';
import DisputaCard from './Disputas/DisputaCard';
import DisputaResolutionModal from './Disputas/DisputaResolutionModal';
import { API_URL } from '../../../config/api';

export default function AdminDisputasTab() {
  
  const {
    disputas,
    loading,
    filterStatus,
    setFilterStatus,
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
    handleOpenModal,
    handleResolverDisputa
  } = useAdminDisputas(API_URL);

  return (
    <div data-testid="admin-disputas-tab-container" className="space-y-6">
      <DisputasHeader 
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* Lista de Disputas */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader2 size={32} className="animate-spin text-[#F9842C] mb-2" />
          <p className="text-sm font-medium">Cargando disputas de pedidos...</p>
        </div>
      ) : disputas.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100 shadow-sm">
          <CheckCircle size={40} className="mx-auto text-green-500 mb-3" />
          <p className="font-bold text-gray-700">No hay disputas activas por resolver</p>
          <p className="text-xs text-gray-400 mt-1">Todos los pedidos se están procesando normalmente sin reclamos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disputas.map((disp) => (
            <DisputaCard 
              key={disp.id}
              disp={disp}
              handleOpenModal={handleOpenModal}
            />
          ))}
        </div>
      )}

      {/* Modal de Resolución Granular */}
      <DisputaResolutionModal 
        selectedDisputa={selectedDisputa}
        setSelectedDisputa={setSelectedDisputa}
        decision={decision}
        setDecision={setDecision}
        hideVisibility={hideVisibility}
        setHideVisibility={setHideVisibility}
        addOneStar={addOneStar}
        setAddOneStar={setAddOneStar}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        isResolving={isResolving}
        handleResolverDisputa={handleResolverDisputa}
      />
    </div>
  );
}
