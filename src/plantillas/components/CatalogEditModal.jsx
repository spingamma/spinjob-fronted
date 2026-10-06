import React, { useState, useEffect, useCallback } from 'react';
import { Archive, X, Save, Loader2, AlertCircle } from 'lucide-react';
import ProductFormModal from './ProductFormModal';
import PremiumModal from '../../components/PremiumModal';
import CatalogSettings from './CatalogSettings';
import CatalogProductsList from './CatalogProductsList';
import { useCatalogEdit } from '../hooks/useCatalogEdit';
import fetchAuth from '../../utils/fetchAuth';
import { API_URL } from '../../config/api';

export default function CatalogEditModal({
  isOpen,
  onClose,
  profesional,
  isPremium = false,
  onCatalogSaved,
  getServerQr
}) {
  const [localProducts, setLocalProducts] = useState([]);
  const [deletedProductsIds, setDeletedProductsIds] = useState([]);
  const [hasUnsavedProduct, setHasUnsavedProduct] = useState(false);
  const [ordersEnabled, setOrdersEnabled] = useState(true);
  const [carouselOrder, setCarouselOrder] = useState('');
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [paymentQrImage, setPaymentQrImage] = useState('');
  const [paymentQrFile, setPaymentQrFile] = useState(null);

  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Cargar datos al abrir el modal
  const loadInitialData = useCallback(() => {
    if (!profesional) return;

    setOrdersEnabled(profesional.orders_enabled !== false);
    setCarouselOrder(profesional.carousel_order || '');

    let methods = [];
    try {
      methods = typeof profesional.delivery_methods === 'string'
        ? JSON.parse(profesional.delivery_methods)
        : (profesional.delivery_methods || []);
    } catch {
      methods = [];
    }
    setDeliveryMethods(Array.isArray(methods) ? methods : []);

    const qr = getServerQr ? getServerQr(profesional) : (profesional.payment_qr_image || profesional.qr_payment_url || '');
    setPaymentQrImage(qr);
    setPaymentQrFile(null);
    setDeletedProductsIds([]);
    setHasUnsavedProduct(false);
    setSaveError('');

    if (profesional.slug) {
      setIsLoadingProducts(true);
      fetchAuth(`${API_URL}/businesses/${profesional.slug}/products`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setLocalProducts(data);
        })
        .catch(err => {
          console.error("Error cargando productos para editar:", err);
          setLocalProducts([]);
        })
        .finally(() => setIsLoadingProducts(false));
    }
  }, [profesional, getServerQr]);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, loadInitialData]);

  const {
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
    handleStockChange
  } = useCatalogEdit({
    localProducts,
    setLocalProducts,
    setDeletedProductsIds,
    isPremium,
    onHasUnsavedProduct: setHasUnsavedProduct,
    ordersEnabled,
    carouselOrder,
    setCarouselOrder,
    deliveryMethods,
    paymentQrImage
  });

  const handleSaveCatalog = async () => {
    setSaveError('');

    if (hasUnsavedProduct) {
      setSaveError("Tienes un producto a medio editar en el catálogo. Por favor completa su nombre y haz clic en 'Añadir' / 'Actualizar', o cancela la edición antes de guardar.");
      return;
    }

    if (isPremium && ordersEnabled) {
      if (!deliveryMethods || deliveryMethods.length === 0) {
        setSaveError("Debes agregar al menos un método de entrega si habilitas los pedidos.");
        return;
      }
      if (!paymentQrImage) {
        setSaveError("Requisito Obligatorio: Debes subir la imagen de tu QR de Pago Bancario (QR Simple) para habilitar la recepción de pedidos.");
        return;
      }
    }

    setIsSaving(true);
    try {
      // 1. Guardar configuración del catálogo en el negocio preservando datos base
      const formDataObj = new FormData();
      formDataObj.append('name', profesional.name || '');
      formDataObj.append('category', profesional.category || '');
      formDataObj.append('description', profesional.description || '');
      formDataObj.append('state', profesional.state || '');
      formDataObj.append('country', profesional.country || 'Bolivia');

      if (profesional.phone) formDataObj.append('phone', profesional.phone);
      if (profesional.whatsapp_numbers) formDataObj.append('whatsapp_numbers', profesional.whatsapp_numbers);
      if (profesional.ubicacion_url) formDataObj.append('ubicacion_url', profesional.ubicacion_url);
      if (profesional.catalog_url) formDataObj.append('catalog_url', profesional.catalog_url);
      if (profesional.home_delivery !== undefined) formDataObj.append('home_delivery', profesional.home_delivery);
      if (profesional.national_delivery !== undefined) formDataObj.append('national_delivery', profesional.national_delivery);
      if (profesional.experience_years) formDataObj.append('experience_years', profesional.experience_years);
      if (profesional.credentials) formDataObj.append('credentials', profesional.credentials);
      if (profesional.pickup_fee !== undefined && profesional.pickup_fee !== null) formDataObj.append('pickup_fee', profesional.pickup_fee);

      if (profesional.subcategories) {
        const subs = typeof profesional.subcategories === 'string' ? profesional.subcategories : JSON.stringify(profesional.subcategories);
        formDataObj.append('subcategories', subs);
      }

      const social = profesional.social_links || {};
      if (social.facebook || profesional.facebook) formDataObj.append('facebook', social.facebook || profesional.facebook);
      if (social.instagram || profesional.instagram) formDataObj.append('instagram', social.instagram || profesional.instagram);
      if (social.linkedin || profesional.linkedin) formDataObj.append('linkedin', social.linkedin || profesional.linkedin);
      if (social.website || profesional.website) formDataObj.append('website', social.website || profesional.website);
      if (social.tiktok || profesional.tiktok) formDataObj.append('tiktok', social.tiktok || profesional.tiktok);
      if (social.github || profesional.github) formDataObj.append('github', social.github || profesional.github);

      // Campos específicos del catálogo
      formDataObj.append('orders_enabled', ordersEnabled ? 'true' : 'false');
      formDataObj.append('carousel_order', carouselOrder || '');
      formDataObj.append('delivery_methods', JSON.stringify(deliveryMethods || []));

      // QR de pago
      if (paymentQrFile instanceof File) {
        formDataObj.append('payment_qr_image', paymentQrFile);
      } else if (typeof paymentQrImage === 'string' && paymentQrImage.startsWith('data:image')) {
        try {
          const arr = paymentQrImage.split(',');
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const qrBlob = new Blob([u8arr], { type: mime });
          const qrFile = new File([qrBlob], "payment_qr.png", { type: mime });
          formDataObj.append('payment_qr_image', qrFile);
        } catch (e) {
          console.error("Error convirtiendo QR base64 a File:", e);
        }
      }

      const bizRes = await fetchAuth(`${API_URL}/businesses/${profesional.slug}/editar`, {
        method: 'PUT',
        body: formDataObj
      });

      if (!bizRes.ok) {
        const errData = await bizRes.json().catch(() => ({}));
        let errMsg = "Error al actualizar la configuración del catálogo";
        if (errData.detail) {
          errMsg = Array.isArray(errData.detail)
            ? errData.detail.map(e => `${e.loc ? e.loc[e.loc.length - 1] : 'Campo'}: ${e.msg}`).join('\n')
            : errData.detail;
        }
        throw new Error(errMsg);
      }

      // 2. Eliminar productos marcados
      for (const prodId of deletedProductsIds) {
        const delRes = await fetchAuth(`${API_URL}/businesses/${profesional.slug}/products/${prodId}`, {
          method: 'DELETE'
        });
        if (!delRes.ok) {
          const errData = await delRes.json().catch(() => ({}));
          throw new Error(errData.detail || "Error al eliminar producto");
        }
      }

      // 3. Crear / Actualizar productos
      for (const prod of localProducts) {
        if (!prod.id || prod.isModified) {
          const pForm = new FormData();
          pForm.append('name', prod.name.trim());
          if (prod.description) pForm.append('description', prod.description.trim());
          if (prod.price) pForm.append('price', prod.price.trim());
          if (prod.carousel_name) pForm.append('carousel_name', prod.carousel_name.trim());
          pForm.append('is_visible', prod.is_visible !== false ? 'true' : 'false');
          if (prod.stock !== undefined && prod.stock !== '' && prod.stock !== null) pForm.append('stock', prod.stock);
          if (prod.choices !== undefined && prod.choices !== null) {
            pForm.append('choices', prod.choices);
          } else {
            pForm.append('choices', '');
          }
          if (prod.imageFile) pForm.append('image', prod.imageFile);

          const url = prod.id
            ? `${API_URL}/businesses/${profesional.slug}/products/${prod.id}`
            : `${API_URL}/businesses/${profesional.slug}/products`;

          const prodRes = await fetchAuth(url, {
            method: prod.id ? 'PUT' : 'POST',
            body: pForm
          });

          if (!prodRes.ok) {
            const errData = await prodRes.json().catch(() => ({}));
            let errMsg = `Error al guardar producto "${prod.name}"`;
            if (errData.detail) {
              errMsg = Array.isArray(errData.detail)
                ? errData.detail.map(e => `${e.loc ? e.loc[e.loc.length - 1] : 'Campo'}: ${e.msg}`).join('\n')
                : errData.detail;
            }
            throw new Error(errMsg);
          }
        }
      }

      if (onCatalogSaved) {
        onCatalogSaved();
      }
      onClose();
    } catch (err) {
      console.error("Error al guardar catálogo:", err);
      setSaveError(err.message || "Error al guardar los cambios del catálogo.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-primary/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
      <div
        data-testid="catalog-edit-modal"
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-5 relative shrink-0 flex items-center justify-between rounded-t-3xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay rounded-t-3xl"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Archive size={20} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-extrabold text-white">Catálogo e Inventario</h3>
              <p className="text-white/70 text-xs">Gestiona tus productos y opciones de venta</p>
            </div>
          </div>
          <button
            data-testid="close-inventory-btn"
            onClick={onClose}
            className="relative z-10 text-white/80 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm cursor-pointer"
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alerta de Error */}
        {saveError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-700 text-xs font-medium animate-in fade-in duration-150">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
            <div className="whitespace-pre-line">{saveError}</div>
          </div>
        )}

        {/* Contenido con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 text-left flex-1 bg-gray-50/50">
          {isLoadingProducts ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 size={32} className="animate-spin text-secondary mb-3" />
              <p className="text-sm font-bold text-primary">Cargando productos del catálogo...</p>
            </div>
          ) : (
            <>
              <CatalogSettings
                isPremium={isPremium}
                ordersEnabled={ordersEnabled}
                setOrdersEnabled={setOrdersEnabled}
                paymentQrImage={paymentQrImage}
                setPaymentQrImage={(val, fileObj) => {
                  setPaymentQrImage(val);
                  if (fileObj) setPaymentQrFile(fileObj);
                }}
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
            </>
          )}
        </div>

        {/* Footer con Botones Propios */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs sm:text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            data-testid="save-catalog-btn"
            onClick={handleSaveCatalog}
            disabled={isSaving || isLoadingProducts}
            className="px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Guardar catálogo</span>
              </>
            )}
          </button>
        </div>
      </div>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        onSubmit={handleSubmitProduct}
        isPremium={isPremium}
        availableCarousels={availableCarousels}
        onHasUnsavedProduct={setHasUnsavedProduct}
      />

      <PremiumModal
        isOpen={premiumModalData.isOpen}
        onClose={() => setPremiumModalData({ isOpen: false, featureName: '' })}
        featureName={premiumModalData.featureName}
      />
    </>
  );
}
