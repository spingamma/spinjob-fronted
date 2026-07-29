// src/hooks/useReceiptUploader.js

import { useState } from 'react';
import fetchAuth from '../utils/fetchAuth';
import { API_URL } from '../config/api';

/**
 * Hook to manage receipt image selection, preview, validation and upload.
 * Returns state and handler functions ready to be consumed by the UI.
 */
export const useReceiptUploader = ({ slug, orderId, navigate }) => {
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptError, setReceiptError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setReceiptError('El archivo es muy pesado. Máximo 5MB.');
        return;
      }
      setReceiptError('');
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadReceipt = async (e) => {
    e.preventDefault();
    if (!receiptFile) return;
    setIsUploading(true);
    setReceiptError('');
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      const activeSlug = slug && slug.includes('-') ? 'spingamma' : slug || 'spingamma';
      const res = await fetchAuth(`${API_URL}/businesses/${activeSlug}/orders/${orderId}/receipt`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Error upload');
      // Redirect after successful upload
      navigate('/mis-compras');
    } catch {
      setReceiptError('No se pudo enviar el comprobante.');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    receiptPreview,
    setReceiptPreview,
    receiptError,
    isUploading,
    handleFileChange,
    handleUploadReceipt,
  };
};
