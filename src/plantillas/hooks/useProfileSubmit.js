import { useState } from 'react';
import fetchAuth from '../../utils/fetchAuth';
import { API_URL } from '../../config/api';

export default function useProfileSubmit({
  profesional,
  isCreateMode,
  editFormData,
  setEditFormData,
  draftStorageKey,
  userObj,
  setMostrarModalVerificacion,
  setIsEditing,
  setImagePreview,
  onUpdate,
  navigate,
  getServerQr
}) {
  const [saveError, setSaveError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleSaveEdit = async () => {
    setSaveError('');

    if (!editFormData.name?.trim() || !editFormData.description?.trim() || !editFormData.category?.trim() || !editFormData.state?.trim() || !editFormData.subcategories || editFormData.subcategories.length === 0) {
      setSaveError("Faltan campos obligatorios. Por favor completa: Nombre, Descripción, Categoría, Subcategoría y Departamento/Estado.");
      return;
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
          if (payload.new_image instanceof File) {
            formDataObj.append('image', payload.new_image);
          }
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

      console.log("[useProfileSubmit] Keys in formDataObj:");
      for (let key of formDataObj.keys()) {
        console.log("  ", key);
      }

      if (payload.payment_qr_file instanceof File) {
        formDataObj.append('payment_qr_image', payload.payment_qr_file);
      } else if (payload.payment_qr_image instanceof File) {
        formDataObj.append('payment_qr_image', payload.payment_qr_image);
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

      if (draftStorageKey) {
        localStorage.removeItem(draftStorageKey);
      }

      setIsEditing(false);
      setImagePreview(null);
      if (onUpdate) onUpdate();

      if (isCreateMode) {
        navigate('/mis-negocios');
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
