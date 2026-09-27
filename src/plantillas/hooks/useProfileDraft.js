import { useEffect } from 'react';

export default function useProfileDraft({
  isEditing,
  draftStorageKey,
  editFormData,
  imagePreview,
  setImagePreview
}) {
  // Load draft on mount/editing change
  useEffect(() => {
    if (isEditing && draftStorageKey) {
      try {
        const savedDraft = localStorage.getItem(draftStorageKey);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.imagePreview) setImagePreview(parsed.imagePreview);
        }
      } catch (err) {
        console.error('Error loading draft for imagePreview:', err);
      }
    }
  }, [isEditing, draftStorageKey, setImagePreview]);

  // Auto-save draft on changes
  useEffect(() => {
    if (isEditing && draftStorageKey) {
      const timer = setTimeout(() => {
        try {
          // eslint-disable-next-line no-unused-vars
          const { new_image, payment_qr_file, ...cleanFormData } = editFormData;
          const draftPayload = {
            editFormData: cleanFormData,
            imagePreview,
            updatedAt: Date.now()
          };
          localStorage.setItem(draftStorageKey, JSON.stringify(draftPayload));
        } catch (err) {
          console.error('Error guardando borrador en localStorage (image):', err);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [editFormData, imagePreview, isEditing, draftStorageKey]);
}
