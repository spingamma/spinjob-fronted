// src/hooks/useProfileForm.js
import { useState, useEffect } from 'react';
import { compressImage } from '../utils/imageUtils';

/**
 * Custom hook to manage the edit form data for PlantillaGenerica.
 * It encapsulates the initialization logic based on the provided `profesional`
 * and handles draft auto‑save / restore functionality.
 *
 * @param {Object} params
 * @param {Object} params.profesional - Business profile data.
 * @param {boolean} params.isCreateMode - Flag indicating creation mode.
 * @param {boolean} params.isEditing - Flag indicating edit mode.
 * @param {string|null} params.draftStorageKey - LocalStorage key for drafts.
 * @param {function} params.getServerQr - Helper to obtain QR image URL from a profile.
 * @returns {{ editFormData: Object, setEditFormData: function, handleEditChange: function }}
 */
export default function useProfileForm({ profesional, isEditing, draftStorageKey, getServerQr, setImagePreview }) {
  // Initialise form data based on the profile, mirroring original logic.
  const [editFormData, setEditFormData] = useState(() => {
    let initialWaNumbers = [];
    try { initialWaNumbers = JSON.parse(profesional?.whatsapp_numbers || '[]'); } catch { initialWaNumbers = []; }
    if (initialWaNumbers.length === 0 && profesional?.whatsapp) initialWaNumbers = [profesional.whatsapp];
    if (initialWaNumbers.length === 0) initialWaNumbers = [''];

    return {
      name: profesional?.name || '',
      title: profesional?.title || '',
      description: profesional?.description || '',
      experience_years: profesional?.experience_years || '',
      credentials: profesional?.credentials || '',
      phone: profesional?.phone || '',
      whatsapp_numbers: initialWaNumbers,
      facebook: profesional?.facebook || '',
      instagram: profesional?.instagram || '',
      linkedin: profesional?.linkedin || '',
      tiktok: profesional?.tiktok || '',
      github: profesional?.github || '',
      website: profesional?.website || '',
      country: profesional?.country || 'Bolivia',
      state: profesional?.state || '',
      home_delivery: profesional?.home_delivery || false,
      national_delivery: profesional?.national_delivery || false,
      ubicacion_url: profesional?.ubicacion_url || '',
      category: profesional?.category || '',
      pickup_fee: profesional?.pickup_fee || '',
      subcategories: (() => {
        try {
          return typeof profesional?.subcategories === 'string'
            ? JSON.parse(profesional.subcategories)
            : (profesional?.subcategories || []);
        } catch {
          return (profesional?.subcategories && profesional.subcategories.length > 0)
            ? profesional.subcategories.split(',')
            : [];
        }
      })(),
      seller_code: '',
      orders_enabled: profesional?.orders_enabled !== false,
      payment_qr_image: getServerQr(profesional),
      carousel_order: profesional?.carousel_order || '',
      delivery_methods: (() => {
        try {
          return typeof profesional?.delivery_methods === 'string'
            ? JSON.parse(profesional.delivery_methods)
            : (profesional?.delivery_methods || []);
        } catch {
          return [];
        }
      })()
    };
  });

  const [prevIsEditing, setPrevIsEditing] = useState(isEditing);
  const [now] = useState(() => Date.now());

  if (isEditing !== prevIsEditing) {
    setPrevIsEditing(isEditing);
    if (isEditing && draftStorageKey) {
      try {
        const savedDraft = localStorage.getItem(draftStorageKey);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          const ONE_DAY_MS = 24 * 60 * 60 * 1000;
          const isExpired = parsed.updatedAt && (now - parsed.updatedAt > ONE_DAY_MS);

          if (isExpired) {
            localStorage.removeItem(draftStorageKey);
          } else if (parsed.editFormData) {
            if (!parsed.editFormData.whatsapp_numbers || parsed.editFormData.whatsapp_numbers.length === 0) {
              parsed.editFormData.whatsapp_numbers = [''];
            }
            const serverQr = getServerQr(profesional);
            if (serverQr && (!parsed.editFormData.payment_qr_image || !parsed.editFormData.payment_qr_image.startsWith('data:image'))) {
              parsed.editFormData.payment_qr_image = serverQr;
            }
            setEditFormData(parsed.editFormData);
          }
        }
      } catch (err) {
        console.error('Error cargando borrador:', err);
      }
    }
  }

  // Auto‑save draft – mirrors original useEffect (lines 151‑172).
  useEffect(() => {
    if (isEditing && draftStorageKey) {
      const timer = setTimeout(() => {
        try {
          // eslint-disable-next-line no-unused-vars
          const { new_image, payment_qr_file, ...cleanFormData } = editFormData;
          const draftPayload = {
            editFormData: cleanFormData,
            updatedAt: Date.now()
          };
          localStorage.setItem(draftStorageKey, JSON.stringify(draftPayload));
        } catch (err) {
          console.error('Error guardando borrador en localStorage:', err);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
     
  }, [editFormData, isEditing, draftStorageKey]);

  // Simple change handler used by the UI.
  const handleEditChange = async (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      if (file) {
        try {
          const compressedFile = await compressImage(file);
          setEditFormData(prev => ({ ...prev, new_image: compressedFile }));
          if (setImagePreview) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(reader.result);
            };
            reader.readAsDataURL(compressedFile);
          }
        } catch (error) {
          console.error("Error comprimiendo imagen", error);
          setEditFormData(prev => ({ ...prev, new_image: file }));
          if (setImagePreview) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    } else {
      setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  return {
    editFormData,
    setEditFormData,
    handleEditChange
  };
}
