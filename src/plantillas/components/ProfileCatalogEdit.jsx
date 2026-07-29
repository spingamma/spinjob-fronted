import React from 'react';
import { Layers, X, Archive } from 'lucide-react';
import ProductFormModal from './ProductFormModal';
import PremiumModal from '../../components/PremiumModal';
import CatalogSettings from './CatalogSettings';
import CatalogProductsList from './CatalogProductsList';
import { useCatalogEdit } from '../hooks/useCatalogEdit';

export default function ProfileCatalogEdit({
  localProducts,
  setLocalProducts,
  // eslint-disable-next-line no-unused-vars
  deletedProductsIds,
  setDeletedProductsIds,
  isPremium,
  onHasUnsavedProduct,
  ordersEnabled = true,
  setOrdersEnabled,
  carouselOrder,
  setCarouselOrder,
  deliveryMethods = [],
  setDeliveryMethods,
  paymentQrImage = '',
  setPaymentQrImage,
  onModalOpenChange
}) {
  const {
    isInventoryOpen,
    setIsInventoryOpen,
    isModalOpen,
    selectedProduct,
    premiumModalData,
    setPremiumModalData,
    expandedCatalogs,
    limitRegistered,
    limitVisible,
    orderedCarousels,
    availableCarousels,
    toggleCatalog,
    moveCarousel,
    handleAddSection,
    handleRemoveSection,
    handleOpenEdit,
    handleOpenCreate,
    handleCloseModal,
    handleSubmitProduct,
    handleDelete,
    toggleVisibility,
    handleStockChange,
    handleCloseInventory
  } = useCatalogEdit({
    localProducts,
    setLocalProducts,
    setDeletedProductsIds,
    isPremium,
    onHasUnsavedProduct,
    ordersEnabled,
    carouselOrder,
    setCarouselOrder,
    deliveryMethods,
    paymentQrImage,
    onModalOpenChange
  });

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-[#1A535C] mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#6A431F] rounded-full"></span> Catálogo de Productos
      </h3>

      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center py-10">
        <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
          Gestiona todos tus productos, opciones de inventario y categorías desde un solo lugar.
        </p>
        <button
          data-testid="open-inventory-btn"
          onClick={() => setIsInventoryOpen(true)}
          className="bg-[#F9842C] hover:bg-[#e06516] text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
        >
          <Layers size={20} />
          Catálogo e Inventario
        </button>
      </div>

      {isInventoryOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#1A535C]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onMouseDown={handleCloseInventory}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-[#1A535C] to-[#32698F] p-5 relative shrink-0 flex items-center justify-between rounded-t-3xl">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay rounded-t-3xl"></div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Archive size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-extrabold text-white">Catálogo e Inventario</h3>
                  <p className="text-white/70 text-xs">Gestiona tus productos y secciones</p>
                </div>
              </div>
              <button
                data-testid="close-inventory-btn"
                onClick={handleCloseInventory}
                className="relative z-10 text-white/80 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-left flex-1 bg-gray-50/50">

              <CatalogSettings 
                isPremium={isPremium}
                ordersEnabled={ordersEnabled}
                setOrdersEnabled={setOrdersEnabled}
                paymentQrImage={paymentQrImage}
                setPaymentQrImage={setPaymentQrImage}
                deliveryMethods={deliveryMethods}
                setDeliveryMethods={setDeliveryMethods}
              />

              <CatalogProductsList 
                isPremium={isPremium}
                localProducts={localProducts}
                orderedCarousels={orderedCarousels}
                expandedCatalogs={expandedCatalogs}
                toggleCatalog={toggleCatalog}
                moveCarousel={moveCarousel}
                handleRemoveSection={handleRemoveSection}
                handleStockChange={handleStockChange}
                toggleVisibility={toggleVisibility}
                handleDelete={handleDelete}
                handleOpenEdit={handleOpenEdit}
                handleOpenCreate={handleOpenCreate}
                limitRegistered={limitRegistered}
                limitVisible={limitVisible}
                setPremiumModalData={setPremiumModalData}
                onAddSection={handleAddSection}
              />

            </div>
          </div>
        </div>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        onSubmit={handleSubmitProduct}
        isPremium={isPremium}
        availableCarousels={availableCarousels}
        onHasUnsavedProduct={onHasUnsavedProduct}
      />

      <PremiumModal 
        isOpen={premiumModalData.isOpen} 
        onClose={() => setPremiumModalData({ isOpen: false, featureName: '' })} 
        featureName={premiumModalData.featureName} 
      />
    </div>
  );
}
