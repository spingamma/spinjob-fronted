import { useState } from 'react';
import fetchAuth from '../../utils/fetchAuth';
import { API_URL } from '../../config/api';

export default function useProfileSubmit({
  profesional,
  isCreateMode,
  editFormData,
  setEditFormData,
  localProducts,
  deletedProductsIds,
  hasUnsavedProduct,
  draftStorageKey,
  userObj,
  setMostrarModalVerificacion,
  setIsEditing,
  setImagePreview,
  setDeletedProductsIds,
  onUpdate,
  navigate,
  getServerQr
}) {
  const [saveError, setSaveError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleSaveEdit = async () => {
    setSaveError('');
    if (hasUnsavedProduct) {
      setSaveError("Tienes un producto a medio editar en el catálogo. Por favor completa su nombre y haz clic en 'Añadir' / 'Actualizar', o cancela la edición antes de guardar la tarjeta.");
      return;
    }

    if (!editFormData.name?.trim() || !editFormData.title?.trim() || !editFormData.description?.trim() || !editFormData.category?.trim() || !editFormData.state?.trim() || !editFormData.subcategories || editFormData.subcategories.length === 0) {
      setSaveError("Faltan campos obligatorios. Por favor completa: Nombre, Título, Descripción, Categoría, Subcategoría y Departamento/Estado.");
      return;
    }

    const isPremium = profesional?.premium === true;
    if (isPremium && editFormData.orders_enabled) {
      if (!editFormData.delivery_methods || editFormData.delivery_methods.length === 0) {
        alert("Debes agregar al menos un método de entrega si habilitas los pedidos.");
        return;
      }
      if (!editFormData.payment_qr_image) {
        alert("Requisito Obligatorio: Debes subir la imagen de tu QR de Pago Bancario (QR Simple) para habilitar la recepción de pedidos.");
        return;
      }
    }

    if (isCreateMode) {
      const isVerifiedStrict = userObj?.is_verified === true || userObj?.is_verified === "true" || userObj?.is_verified === 1;
      if (!isVerifiedStrict) {
        setMostrarModalVerificacion(true);
        return;
      }
    }

    setIsSavingEdit(true);
    try {
      const payload = { ...editFormData };
      const formDataObj = new FormData();
      Object.keys(payload).forEach(key => {
        if (key === 'new_image') {
          if (payload[key]) formDataObj.append('image', payload[key]);
        } else if (key === 'carousel_order') {
          formDataObj.append('carousel_order', payload[key] || '');
        } else if (key === 'whatsapp_numbers') {
          const validNumbers = payload.whatsapp_numbers.filter(n => n.trim() !== '');
          formDataObj.append('whatsapp_numbers', JSON.stringify(validNumbers));
          if (validNumbers.length > 0) {
             formDataObj.append('whatsapp', validNumbers[0]);
          } else {
             formDataObj.append('whatsapp', '');
          }
        } else if (key === 'subcategories') {
          if (Array.isArray(payload[key]) && payload[key].length > 0) {
             formDataObj.append('subcategories', JSON.stringify(payload[key]));
          }
        } else if (key === 'delivery_methods') {
          const methods = Array.isArray(payload[key]) ? payload[key] : [];
          formDataObj.append('delivery_methods', JSON.stringify(methods));
        } else if (key === 'payment_qr_image' || key === 'payment_qr_file') {
          // Omitir en bucle, se procesa de forma directa abajo
        } else if (payload[key] !== null && payload[key] !== undefined && payload[key] !== '') {
          formDataObj.append(key, payload[key]);
        }
      });

      if (payload.payment_qr_file instanceof File) {
        formDataObj.append('payment_qr_image', payload.payment_qr_file);
      } else if (typeof payload.payment_qr_image === 'string' && payload.payment_qr_image.startsWith('data:image')) {
        try {
          const arr = payload.payment_qr_image.split(',');
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
        } catch(e) {
          console.error("Error convirtiendo QR base64 a File:", e);
        }
      }

      
      let res;
      if (isCreateMode) {
        res = await fetchAuth(`${API_URL}/businesses/`, {
          method: 'POST',
          body: formDataObj
        });
      } else {
        res = await fetchAuth(`${API_URL}/businesses/${profesional.slug}/editar`, {
          method: 'PUT',
          body: formDataObj
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        let errorMessage = "Error al guardar cambios";
        if (errData.detail) {
          if (Array.isArray(errData.detail)) {
             errorMessage = errData.detail.map(e => `${e.loc ? e.loc[e.loc.length-1] : 'Campo'}: ${e.msg}`).join('\n');
          } else {
             errorMessage = errData.detail;
          }
        }
        throw new Error(errorMessage);
      }
      
      const responseData = await res.json();
      const currentSlug = isCreateMode ? responseData.slug : profesional.slug;

      if (responseData) {
        const savedQr = getServerQr(responseData) || payload.payment_qr_image;
        if (savedQr) {
          if (profesional) {
            profesional.payment_qr_image = savedQr;
            profesional.qr_payment_url = savedQr;
            profesional.payment_qr = savedQr;
            profesional.qr_image = savedQr;
            profesional.qr_image_url = savedQr;
          }
          setEditFormData(prev => ({ ...prev, payment_qr_image: savedQr, payment_qr_file: null }));
        }
        if (responseData.delivery_methods) {
          let savedMethods = responseData.delivery_methods;
          if (typeof savedMethods === 'string') {
            try { savedMethods = JSON.parse(savedMethods); } catch { /* ignore */ }
          }
          if (Array.isArray(savedMethods)) {
            if (profesional) profesional.delivery_methods = savedMethods;
            setEditFormData(prev => ({ ...prev, delivery_methods: savedMethods }));
          }
        }
      }

      for (const prodId of deletedProductsIds) {
        try {
          const delRes = await fetchAuth(`${API_URL}/businesses/${currentSlug}/products/${prodId}`, {
            method: 'DELETE'
          });
          if (!delRes.ok) {
            const errData = await delRes.json().catch(() => ({}));
            throw new Error(errData.detail || `Error al eliminar producto`);
          }
        } catch (e) {
          if (e.message !== 'SESSION_EXPIRED') {
            console.error("Error eliminando producto:", e);
            throw e;
          }
        }
      }

      for (const prod of localProducts) {
        if (!prod.id || prod.isModified) {
          const pForm = new FormData();
          pForm.append('name', prod.name.trim());
          if (prod.description) pForm.append('description', prod.description.trim());
          if (prod.price) pForm.append('price', prod.price.trim());
          if (prod.carousel_name) pForm.append('carousel_name', prod.carousel_name.trim());
          pForm.append('is_visible', prod.is_visible !== false ? 'true' : 'false');
          if (prod.stock !== undefined && prod.stock !== '' && prod.stock !== null) pForm.append('stock', prod.stock);
          if (prod.imageFile) pForm.append('image', prod.imageFile);

          const url = prod.id 
            ? `${API_URL}/businesses/${currentSlug}/products/${prod.id}`
            : `${API_URL}/businesses/${currentSlug}/products`;

          try {
            const prodRes = await fetchAuth(url, {
              method: prod.id ? 'PUT' : 'POST',
              body: pForm
            });
            if (!prodRes.ok) {
              const errData = await prodRes.json().catch(() => ({}));
              let errMsg = `Error al guardar el producto "${prod.name}"`;
              if (errData.detail) {
                if (Array.isArray(errData.detail)) {
                  errMsg = errData.detail.map(e => `${e.loc ? e.loc[e.loc.length-1] : 'Campo'}: ${e.msg}`).join('\n');
                } else {
                  errMsg = errData.detail;
                }
              }
              throw new Error(errMsg);
            }
          } catch (e) {
            if (e.message !== 'SESSION_EXPIRED') {
              console.error("Error guardando producto:", e);
              throw e;
            }
          }
        }
      }

      if (draftStorageKey) {
        localStorage.removeItem(draftStorageKey);
      }

      setIsEditing(false);
      setImagePreview(null);
      setDeletedProductsIds([]);
      if (onUpdate) onUpdate();

      if (isCreateMode && currentSlug) {
        navigate(`/perfil/${currentSlug}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Hubo un error al guardar los cambios.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  return { saveError, isSavingEdit, handleSaveEdit };
}
