import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import ReviewModal from '../components/ReviewModal';
import ModalVerificacion from '../components/ModalVerificacion';
import InlineCatalogCarousel from '../components/InlineCatalogCarousel';
import ProfileHero from './components/ProfileHero';
import ProfileAbout from './components/ProfileAbout';
import ProfileContact from './components/ProfileContact';
import ProfileQRModal from './components/ProfileQRModal';
import ProfileCatalogEdit from './components/ProfileCatalogEdit';
import FloatingActionBar from './components/FloatingActionBar';
import { usePlantillaGenerica } from './hooks/usePlantillaGenerica';

export default function PlantillaGenerica({ profesional, volverAtras, onProtectedAction, onUpdate, isCreateMode = false, initialIsEditing = null }) {
  const navigate = useNavigate();

  const {
    isOwner,
    isEditing,
    setIsEditing,
    imagePreview,
    setImagePreview,
    isSubModalOpen,
    setIsSubModalOpen,
    deletedProductsIds,
    setDeletedProductsIds,
    setHasUnsavedProduct,
    draftStorageKey,
    profileForm: { editFormData, setEditFormData, handleEditChange },
    specialtiesData,
    localProducts,
    setLocalProducts,
    saveError,
    isSavingEdit,
    handleSaveEdit,
    getServerQr,
    waNumbers,
    links,
    accionesPerfil: {
      mostrarQR, toggleQR, handleDownloadQR, isLoggedIn, userName, handleLogout,
      handleShare, handleLinkClick, handleCalificarClick,
      mostrarModalCalificando, setMostrarModalCalificando, calificacionPrevia, isSubmittingReview, handleSubmitReview,
      mostrarModalVerificacion, setMostrarModalVerificacion,
      isSaved, isSaving, toggleSaveCard
    }
  } = usePlantillaGenerica(profesional, onProtectedAction, onUpdate, isCreateMode, initialIsEditing, navigate);

  if (!profesional) return null;

  return (
    <div className="min-h-screen bg-brand-bg text-primary pb-24 font-sans antialiased selection:bg-secondary selection:text-white relative">
      <ProfileHero 
        profesional={profesional}
        volverAtras={volverAtras}
        isLoggedIn={isLoggedIn}
        userName={userName}
        handleLogout={handleLogout}
        onProtectedAction={onProtectedAction}
        handleShare={handleShare}
        toggleQR={toggleQR}
        isOwner={isOwner}
        isEditing={isEditing}
        setIsEditing={(val) => { setIsEditing(val); if(!val) setImagePreview(null); }}
        toggleSaveCard={toggleSaveCard}
        isSaving={isSaving}
        isSaved={isSaved}
        editFormData={editFormData}
        handleEditChange={handleEditChange}
        handleLinkClick={handleLinkClick}
        links={links}
        imagePreview={imagePreview}
        setEditFormData={setEditFormData}
        isCreateMode={isCreateMode}
        specialtiesData={specialtiesData}
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-6 lg:px-8 relative z-20">
        <div className="-mx-4 sm:mx-0 mb-2">
          {isEditing ? (
            <div className="px-4 sm:px-0">
              <ProfileCatalogEdit 
                localProducts={localProducts}
                setLocalProducts={setLocalProducts}
                deletedProductsIds={deletedProductsIds}
                setDeletedProductsIds={setDeletedProductsIds}
                isPremium={profesional.premium === true}
                onHasUnsavedProduct={setHasUnsavedProduct}
                ordersEnabled={editFormData.orders_enabled}
                setOrdersEnabled={(val) => setEditFormData(prev => ({ ...prev, orders_enabled: val }))}
                carouselOrder={editFormData.carousel_order}
                setCarouselOrder={(val) => setEditFormData(prev => ({ ...prev, carousel_order: val }))}
                deliveryMethods={editFormData.delivery_methods}
                setDeliveryMethods={(val) => setEditFormData(prev => ({ ...prev, delivery_methods: val }))}
                paymentQrImage={editFormData.payment_qr_image}
                setPaymentQrImage={(val, fileObj) => setEditFormData(prev => ({ ...prev, payment_qr_image: val, payment_qr_file: fileObj || prev.payment_qr_file }))}
                onModalOpenChange={setIsSubModalOpen}
              />
            </div>
          ) : (
            <InlineCatalogCarousel 
              slug={profesional.slug} 
              catalogUrl={profesional.catalog_url}
              whatsappNumber={waNumbers[0] || null}
              businessName={profesional.name}
              country={profesional.country || 'Bolivia'}
              theme="light"
              isPremium={profesional.premium === true}
              ordersEnabled={profesional.orders_enabled !== false}
              carouselOrder={profesional.carousel_order}
              deliveryMethods={profesional.delivery_methods}
              paymentQrImage={getServerQr(profesional)}
              ownerId={profesional.owner_id}
            />
          )}
        </div>

        <ProfileAbout 
          profesional={profesional}
          isEditing={isEditing}
          editFormData={editFormData}
          handleEditChange={handleEditChange}
          setEditFormData={setEditFormData}
          specialtiesData={specialtiesData}
        />

        <ProfileContact 
          profesional={profesional}
          waNumbers={waNumbers}
          links={links}
          handleLinkClick={handleLinkClick}
          isEditing={isEditing}
          editFormData={editFormData}
          handleEditChange={handleEditChange}
          setEditFormData={setEditFormData}
        />

        {!isEditing && !isCreateMode && (
          <div className="mt-8 flex justify-center w-full z-10 relative px-4">
            <button
                onClick={handleCalificarClick}
                data-testid="danos-tu-opinion-btn"
                className="px-8 py-4 rounded-xl bg-btn-cta hover:bg-btn-cta/90 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 w-full max-w-sm border border-gray-200 cursor-pointer"
            >
                <Star size={18} className="fill-white text-white" /> Danos tu opinión
            </button>
          </div>
        )}

        <div className="mt-12 mb-8 text-center flex flex-col items-center justify-center">
            <a 
              href="https://spingamma.github.io/spingamma-landing/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Ir a la página de SpinGamma"
              className="group flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <span className="text-xs text-gray-500 font-medium">Tecnología desarrollada por</span>
              <span className="text-sm font-extrabold text-primary tracking-wider group-hover:text-secondary transition-colors">TARJETOSO</span>
            </a>
        </div>
      </div>

      <ProfileQRModal 
        isOpen={mostrarQR}
        onClose={toggleQR}
        url={window.location.href}
        handleDownloadQR={handleDownloadQR}
        handleShare={handleShare}
      />

      <ReviewModal 
        isOpen={mostrarModalCalificando}
        onClose={() => setMostrarModalCalificando(false)}
        onSubmit={handleSubmitReview}
        isSubmitting={isSubmittingReview}
        calificacionPrevia={calificacionPrevia}
        profesionalName={profesional.name}
      />

      <ModalVerificacion 
        isOpen={mostrarModalVerificacion}
        onClose={() => setMostrarModalVerificacion(false)}
        onSuccess={() => {
          setMostrarModalVerificacion(false);
          if (!isCreateMode) {
            setMostrarModalCalificando(true);
          }
        }}
        userName={userName}
      />

      <FloatingActionBar 
        isEditing={isEditing}
        isSubModalOpen={isSubModalOpen}
        saveError={saveError}
        draftStorageKey={draftStorageKey}
        isCreateMode={isCreateMode}
        volverAtras={volverAtras}
        setIsEditing={setIsEditing}
        setImagePreview={setImagePreview}
        isSavingEdit={isSavingEdit}
        handleSaveEdit={handleSaveEdit}
      />
    </div>
  );
}