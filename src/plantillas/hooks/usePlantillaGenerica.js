import { useState, useEffect, useRef } from 'react';
import useAccionesPerfil from '../../hooks/useAccionesPerfil';
import useProfileForm from '../../hooks/useProfileForm';
import useFetchProfileData from './useFetchProfileData';
import useProfileDraft from './useProfileDraft';
import useProfileSubmit from './useProfileSubmit';

// UTIL: Decodificar JWT para obtener el user ID
function getUserIdFromToken() {
  const token = localStorage.getItem('spingamma_token');
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const payload = JSON.parse(window.atob(padded));
    return payload.sub;
  } catch (e) {
    console.error("Token decode error:", e);
    return null;
  }
}

const getServerQr = (prof) => {
  if (!prof) return '';
  return prof.payment_qr_image || prof.qr_payment_url || prof.payment_qr || prof.qr_image || prof.qr_image_url || prof.qr_code || prof.qr || '';
};

export function usePlantillaGenerica(profesional, onProtectedAction, onUpdate, isCreateMode, initialIsEditing, navigate) {
  const accionesPerfil = useAccionesPerfil(profesional, onProtectedAction);
  const { setMostrarModalVerificacion } = accionesPerfil;

  const userId = getUserIdFromToken();
  const userObj = JSON.parse(localStorage.getItem('spingamma_user') || '{}');
  const isAdmin = userObj.is_admin === true;
  const isOwner = accionesPerfil.isLoggedIn && (isAdmin || profesional?.owner_id === userId);

  const draftStorageKey = isCreateMode 
    ? 'spingamma_draft_business_create' 
    : (profesional?.slug ? `spingamma_draft_business_${profesional.slug}` : null);

  const [isEditing, setIsEditing] = useState(initialIsEditing !== null ? initialIsEditing : isCreateMode);
  // eslint-disable-next-line no-unused-vars
  const [isRestoredFromDraft, setIsRestoredFromDraft] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [deletedProductsIds, setDeletedProductsIds] = useState([]);
  const [hasUnsavedProduct, setHasUnsavedProduct] = useState(false);

  const isEditingRef = useRef(isEditing);
  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  const profileForm = useProfileForm({
    profesional,
    isCreateMode,
    isEditing,
    draftStorageKey,
    getServerQr,
    setImagePreview,
  });

  const { editFormData, setEditFormData } = profileForm;

  const { specialtiesData, localProducts, setLocalProducts } = useFetchProfileData({
    isEditing,
    isCreateMode,
    slug: profesional?.slug
  });

  useProfileDraft({
    isEditing,
    draftStorageKey,
    editFormData,
    localProducts,
    imagePreview,
    setLocalProducts,
    setImagePreview
  });

  const { saveError, isSavingEdit, handleSaveEdit } = useProfileSubmit({
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
  });

  useEffect(() => {
    if (profesional) {
      let initialWaNumbers = [];
      try { initialWaNumbers = JSON.parse(profesional.whatsapp_numbers || '[]'); } catch { initialWaNumbers = []; }
      if (initialWaNumbers.length === 0 && profesional.whatsapp) initialWaNumbers = [profesional.whatsapp];
      if (initialWaNumbers.length === 0) initialWaNumbers = [''];

      const currentQr = getServerQr(profesional);

      setEditFormData(prev => {
        if (isEditingRef.current && prev.payment_qr_image && prev.payment_qr_image.startsWith('data:image')) {
          return { ...prev, payment_qr_image: prev.payment_qr_image };
        }
        return {
          name: profesional.name || '',
          title: profesional.title || '',
          description: profesional.description || '',
          experience_years: profesional.experience_years || '',
          credentials: profesional.credentials || '',
          phone: profesional.phone || '',
          whatsapp_numbers: initialWaNumbers,
          facebook: profesional.facebook || '',
          instagram: profesional.instagram || '',
          linkedin: profesional.linkedin || '',
          tiktok: profesional.tiktok || '',
          github: profesional.github || '',
          website: profesional.website || '',
          country: profesional.country || 'Bolivia',
          state: profesional.state || '',
          home_delivery: profesional.home_delivery || false,
          national_delivery: profesional.national_delivery || false,
          ubicacion_url: profesional.ubicacion_url || '',
          category: profesional.category || '',
          subcategories: (() => {
            try { return typeof profesional.subcategories === 'string' ? JSON.parse(profesional.subcategories) : (profesional.subcategories || []); } catch { return (profesional.subcategories && profesional.subcategories.length > 0) ? profesional.subcategories.split(',') : []; }
          })(),
          seller_code: '',
          orders_enabled: profesional.orders_enabled !== false,
          payment_qr_image: currentQr || prev.payment_qr_image || '',
          carousel_order: profesional.carousel_order || '',
          delivery_methods: (() => {
            try { return typeof profesional.delivery_methods === 'string' ? JSON.parse(profesional.delivery_methods) : (profesional.delivery_methods || []); } catch { return []; }
          })()
        };
      });
    }
  }, [profesional, setEditFormData]);

  let waNumbers = [];
  try { waNumbers = JSON.parse(profesional?.whatsapp_numbers || '[]'); } catch { waNumbers = []; }
  if (waNumbers.length === 0 && profesional?.whatsapp) waNumbers = [profesional.whatsapp];
  const cleanPhone = profesional?.phone?.replace(/[^0-9]/g, '');
  
  const links = {
    phone: cleanPhone ? `tel:${cleanPhone}` : null,
    facebook: profesional?.facebook,
    instagram: profesional?.instagram,
    linkedin: profesional?.linkedin,
    website: profesional?.website,
    github: profesional?.github,
    tiktok: profesional?.tiktok,
    ubicacion: profesional?.ubicacion_url
  };

  return {
    isOwner,
    isEditing,
    setIsEditing,
    imagePreview,
    setImagePreview,
    isSubModalOpen,
    setIsSubModalOpen,
    deletedProductsIds,
    setDeletedProductsIds,
    hasUnsavedProduct,
    setHasUnsavedProduct,
    draftStorageKey,
    profileForm,
    specialtiesData,
    localProducts,
    setLocalProducts,
    saveError,
    isSavingEdit,
    handleSaveEdit,
    getServerQr,
    waNumbers,
    links,
    accionesPerfil
  };
}
