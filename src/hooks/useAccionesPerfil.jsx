// Archivo: src/hooks/useAccionesPerfil.js
import { useState, useEffect, useCallback } from 'react';
import fetchAuth from '../utils/fetchAuth';

export default function useAccionesPerfil(profesional, onProtectedAction) {
  const [mostrarQR, setMostrarQR] = useState(false);

  const pendingInteractionKey = `spingamma_pending_interaction_${profesional?.slug}`;

  // Nuevo estado para el modal de calificacion y verificacion
  const [mostrarModalCalificando, setMostrarModalCalificando] = useState(false);
  const [mostrarModalVerificacion, setMostrarModalVerificacion] = useState(false);
  const [calificacionPrevia, setCalificacionPrevia] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Estados para Mi Tarjetero
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Leer user obj completo
  const userObj = (() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return null; }
    }
    return null;
  })();

  const isLoggedIn = userObj !== null;
  const userName = userObj?.nombre || '';
  const isVerified = userObj?.is_verified === true;
  const isAdmin = userObj?.is_admin === true;

  useEffect(() => {
    const userStr = localStorage.getItem('spingamma_user');
    const pendingPlatform = localStorage.getItem(pendingInteractionKey);

    if (userStr && pendingPlatform) {
      // Si es admin, limpiar pero no registrar
      const parsed = JSON.parse(userStr);
      if (!parsed.is_admin) {
        registrarInteraccionBackend(pendingPlatform);
      }
      localStorage.removeItem(pendingInteractionKey);
    }
  });

  // Verificar estado de Mi Tarjetero al montar
  useEffect(() => {
    const token = localStorage.getItem('spingamma_token');
    if (isLoggedIn && token && profesional && profesional.slug) {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      fetchAuth(`${API_URL}/tarjetero/${profesional.slug}/status`)
      .then(res => res.json())
      .then(data => {
        if (data && data.is_saved !== undefined) {
          setIsSaved(data.is_saved);
        }
      })
      .catch(err => {
        if (err.message !== 'SESSION_EXPIRED') {
          console.error("Error consultando estado del tarjetero", err);
        }
      });
    }
  }, [isLoggedIn, profesional]);

  const toggleQR = useCallback(() => setMostrarQR(prev => !prev), []);

  const handleDownloadQR = useCallback(async (colorHex = '1E3D51', bgColorHex = 'FFFFFF') => {
    if (!profesional) return;
    try {
      const canvas = document.getElementById('qr-canvas');
      if (canvas) {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `QR_${profesional.name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(window.location.href)}&color=${colorHex}&bgcolor=${bgColorHex}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `QR_${profesional.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error al descargar el QR', err);
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(window.location.href)}&color=${colorHex}&bgcolor=${bgColorHex}`, '_blank');
    }
  }, [profesional]);

  const handleShare = useCallback(async () => {
    if (!profesional) return;
    const shareData = {
      title: `Perfil de ${profesional.name}`,
      text: `Conoce el perfil profesional de ${profesional.name} - ${profesional.title} en SpinGamma.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error al compartir", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado al portapapeles");
    }
  }, [profesional]);

  const toggleSaveCard = useCallback(async () => {
    if (!profesional) return;
    if (!isLoggedIn) {
      onProtectedAction(null);
      return;
    }

    setIsSaving(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    try {
      const res = await fetchAuth(`${API_URL}/tarjetero/${profesional.slug}`, {
        method: isSaved ? 'DELETE' : 'POST'
      });
      if (res.ok) {
        setIsSaved(!isSaved);
      }
    } catch (err) {
      console.error("Error guardando tarjeta:", err);
    } finally {
      setIsSaving(false);
    }
  }, [isLoggedIn, profesional, isSaved, onProtectedAction]);

  const registrarInteraccionBackend = useCallback(async (platformName) => {
    const freshUserStr = localStorage.getItem('spingamma_user');
    if (!freshUserStr || !profesional) return;

    try {
      const freshUser = JSON.parse(freshUserStr);
      if (freshUser.is_admin) return;

      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

      const response = await fetchAuth(`${API_URL}/businesses/${profesional.slug}/interaccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformName })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(`Error ${response.status} registrando interacción (${platformName}):`, errorData);
        throw new Error(`Fallo ${response.status}`);
      }
    } catch (error) {
      console.error("Error en registrarInteraccionBackend:", error);
    }
  }, [profesional]);

  const handleLinkClick = useCallback(async (e, platformName, url) => {
    e.preventDefault();

    if (isLoggedIn) {
      if (!isAdmin) {
        await registrarInteraccionBackend(platformName);
      }
      onProtectedAction(url);
    } else {
      localStorage.setItem(pendingInteractionKey, platformName);
      onProtectedAction(url);
    }
  }, [onProtectedAction, registrarInteraccionBackend, pendingInteractionKey, isLoggedIn, isAdmin]);

  const handleCalificarClick = useCallback(async () => {
    if (!profesional) return;

    if (!userObj) {
      const spingammaWhatsapp = "59164016676";
      const mensaje = `Hola SpinGamma, quiero habilitar la opci\u00f3n de calificar perfiles y que revisen que no soy un bot. Mi nombre es un usuario.`;
      const url = `https://wa.me/${spingammaWhatsapp}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    setIsSubmittingReview(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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
  }, [profesional, userName, userObj]);

  const handleSubmitReview = useCallback(async ({ rating, description, esEdicion }) => {
    if (!profesional || !userObj) return;
    setIsSubmittingReview(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      
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
      // Limpiar datos
      setCalificacionPrevia(null);
      
    } catch (err) {
      console.error("Error submitting review:", err);
      // Silencioso o con alerta nativa
    } finally {
      setIsSubmittingReview(false);
    }
  }, [profesional, userObj]);


  const handleLogout = useCallback(() => {
    localStorage.removeItem('spingamma_user');
    window.location.reload();
  }, []);

  return {
    mostrarQR,
    toggleQR,
    handleDownloadQR,
    isLoggedIn,
    userName,
    handleShare,
    handleLinkClick,
    handleCalificarClick,
    handleLogout,
    // Propiedades nuevas para Modal:
    mostrarModalCalificando,
    setMostrarModalCalificando,
    mostrarModalVerificacion,
    setMostrarModalVerificacion,
    calificacionPrevia,
    isSubmittingReview,
    handleSubmitReview,
    // Propiedades para Mi Tarjetero:
    isSaved,
    isSaving,
    toggleSaveCard
  };

}