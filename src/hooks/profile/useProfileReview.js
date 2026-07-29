import { useState, useCallback } from 'react';
import fetchAuth from '../../utils/fetchAuth';
import { API_URL } from '../../config/api';

export default function useProfileReview(profesional, userObj) {
  const [mostrarModalCalificando, setMostrarModalCalificando] = useState(false);
  const [mostrarModalVerificacion, setMostrarModalVerificacion] = useState(false);
  const [calificacionPrevia, setCalificacionPrevia] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleCalificarClick = useCallback(async () => {
    if (!profesional) return;

    if (!userObj) {
      const spingammaWhatsapp = "59164016676";
      const mensaje = `Hola Tarjetoso, quiero habilitar la opci\u00f3n de calificar perfiles y que revisen que no soy un bot. Mi nombre es un usuario.`;
      const url = `https://wa.me/${spingammaWhatsapp}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    setIsSubmittingReview(true);

    const showVerificationPrompt = () => {
      setMostrarModalVerificacion(true);
      setIsSubmittingReview(false);
    };

    let isVerifiedStrict = userObj?.is_verified === true || userObj?.is_verified === "true" || userObj?.is_verified === "True" || userObj?.is_verified === 1;

    try {
      if (!isVerifiedStrict) {
        const verifyRes = await fetchAuth(`${API_URL}/usuarios/status`);

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.is_verified === true || verifyData.is_verified === "true" || verifyData.is_verified === 1) {
            userObj.is_verified = true;
            localStorage.setItem('spingamma_user', JSON.stringify(userObj));
            isVerifiedStrict = true; 
          } else {
            showVerificationPrompt();
            return;
          }
        } else {
          showVerificationPrompt();
          return;
        }
      }

      const res = await fetchAuth(`${API_URL}/businesses/${profesional.slug}/resenas/me`);
      if (res.ok) {
        const data = await res.json();
        setCalificacionPrevia(data.rating ? data : null);
      } else {
        setCalificacionPrevia(null);
      }
      
      setMostrarModalCalificando(true);
      
    } catch (err) {
      console.error("Error validando perfiles o reseña", err);
      showVerificationPrompt();
    } finally {
      setIsSubmittingReview(false);
    }
  }, [profesional, userObj]);

  const handleSubmitReview = useCallback(async ({ rating, description, esEdicion }) => {
    if (!profesional || !userObj) return;
    setIsSubmittingReview(true);
    
    try {
      
      const formData = new FormData();
      formData.append('rating', rating);
      if (description) formData.append('descripcion', description);
      
      const method = esEdicion ? 'PUT' : 'POST';
      const endpoint = `${API_URL}/businesses/${profesional.slug}/resenas`;
      
      const res = await fetchAuth(endpoint, {
        method,
        body: formData,
      });
      
      if (!res.ok) throw new Error("Error saving review");
      
      setMostrarModalCalificando(false);
      setCalificacionPrevia(null);
      
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  }, [profesional, userObj]);

  return {
    mostrarModalCalificando,
    setMostrarModalCalificando,
    mostrarModalVerificacion,
    setMostrarModalVerificacion,
    calificacionPrevia,
    isSubmittingReview,
    handleCalificarClick,
    handleSubmitReview
  };
}
