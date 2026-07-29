import React from 'react';
import { Loader2, Store } from 'lucide-react';
import { useAdminVendedorTab } from '../hooks/Vendedor/useAdminVendedorTab';
import VendedorHeader from './Vendedor/VendedorHeader';
import VendedorFilters from './Vendedor/VendedorFilters';
import BusinessCard from './Vendedor/BusinessCard';
import ManualTransferModal from './Vendedor/ManualTransferModal';

export default function AdminVendedorTab({ API_URL }) {
  const {
    searchTerm,
    setSearchTerm,
    isLoading,
    filter,
    setFilter,
    transfering,
    isAdmin,
    internalTab,
    setInternalTab,
    sellerCode,
    codeCopied,
    handleCopyCode,
    manualModalOpen,
    setManualModalOpen,
    selectedBusiness,
    setSelectedBusiness,
    manualSearch,
    setManualSearch,
    manualUsers,
    isSearchingManual,
    handleTransfer,
    handleManualTransfer,
    filteredBusinesses
  } = useAdminVendedorTab(API_URL);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* HEADER DE CONTROLES */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <VendedorHeader 
            sellerCode={sellerCode}
            handleCopyCode={handleCopyCode}
            codeCopied={codeCopied}
            isAdmin={isAdmin}
            internalTab={internalTab}
            setInternalTab={setInternalTab}
          />
          <VendedorFilters 
            filter={filter}
            setFilter={setFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </div>

      {/* LISTADO DE NEGOCIOS */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={40} className="animate-spin text-[#F9842C]" />
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <Store size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400 font-bold text-lg">No hay negocios que coincidan con los filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map(b => (
            <BusinessCard 
              key={b.slug}
              b={b}
              transfering={transfering}
              handleTransfer={handleTransfer}
              setSelectedBusiness={setSelectedBusiness}
              setManualModalOpen={setManualModalOpen}
            />
          ))}
        </div>
      )}

      {/* MODAL ASIGNACIÓN MANUAL */}
      {manualModalOpen && (
        <ManualTransferModal 
          selectedBusiness={selectedBusiness}
          setManualModalOpen={setManualModalOpen}
          manualSearch={manualSearch}
          setManualSearch={setManualSearch}
          isSearchingManual={isSearchingManual}
          manualUsers={manualUsers}
          handleManualTransfer={handleManualTransfer}
          transfering={transfering}
        />
      )}
    </div>
  );
}
