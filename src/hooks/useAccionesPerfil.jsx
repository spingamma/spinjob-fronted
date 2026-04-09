// Archivo: src/hooks/useAccionesPerfil.js
import { useState, useEffect, useCallback } from 'react';

export default function useAccionesPerfil(profesional, onProtectedAction) {
  const [mostrarQR, setMostrarQR] = useState(false);

  const pendingRateKey = `spingamma_pending_rate_${profesional?.slug}`;
  const pendingInteractionKey = `spingamma_pending_interaction_${profesional?.slug}`;

  const [mostrarCalificacion, setMostrarCalificacion] = useState(() => {
    if (!profesional) return false;
    return localStorage.getItem(pendingRateKey) === 'true';
  });

  // Nuevo estado para el modal de calificacion
  const [mostrarModalCalificando, setMostrarModalCalificando] = useState(false);
  const [calificacionPrevia, setCalificacionPrevia] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

  useEffect(() => {
    const userStr = localStorage.getItem('spingamma_user');
    const pendingPlatform = localStorage.getItem(pendingInteractionKey);

    if (userStr && pendingPlatform) {
      registrarInteraccionBackend(pendingPlatform);
      localStorage.removeItem(pendingInteractionKey);

      localStorage.setItem(pendingRateKey, 'true');
      setMostrarCalificacion(true);
    }
  });

  const toggleQR = useCallback(() => setMostrarQR(prev => !prev), []);

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

  const registrarInteraccionBackend = useCallback(async (platformName) => {
    const freshUser = localStorage.getItem('spingamma_user');
    if (!freshUser || !profesional) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem('spingamma_token');

      const response = await fetch(`${API_URL}/profesionales/${profesional.slug}/interaccion`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ platform: platformName }),
        keepalive: true
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
      await registrarInteraccionBackend(platformName);
      
      localStorage.setItem(pendingRateKey, 'true');
      setMostrarCalificacion(true);
      
      onProtectedAction(url);
    } else {
      localStorage.setItem(pendingInteractionKey, platformName);
      onProtectedAction(url);
    }
  }, [onProtectedAction, registrarInteraccionBackend, pendingRateKey, pendingInteractionKey, isLoggedIn]);

  const handleCalificarClick = useCallback(async () => {
    if (!profesional) return;

    if (!userObj) {
      const spingammaWhatsapp = "59164016676";
      const mensaje = `Hola SpinGamma, quiero habilitar la opci\u00f3n de calificar perfiles y que revisen que no soy un bot. Mi nombre es un usuario.`;
      const url = `https://wa.me/${spingammaWhatsapp}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    setIsSubmittingReview(true); // Re-usamos esto para que el usuario note que algo está cargando
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    const goToWhatsApp = () => {
      const spingammaWhatsapp = "59164016676";
      const mensaje = `Hola SpinGamma, quiero habilitar la opci\u00f3n de calificar perfiles y que revisen que no soy un bot. Mi nombre es ${userName || 'un usuario'}.`;
      const url = `https://wa.me/${spingammaWhatsapp}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setIsSubmittingReview(false);
    };

    let isVerifiedStrict = userObj?.is_verified === true || userObj?.is_verified === "true" || userObj?.is_verified === "True" || userObj?.is_verified === 1;

    try {
      if (!isVerifiedStrict) {
        const token = localStorage.getItem('spingamma_token');
        
        // VALIDACIÓN 1: Comprobar si realmente tenemos token para consultar
        if (!token) {
          console.error("Fallo de Frontend: No existe 'spingamma_token' en LocalStorage. El registro no devolvió token.");
          goToWhatsApp();
          return;
        }

        const verifyRes = await fetch(`${API_URL}/usuarios/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          console.log("Respuesta Exitosa de /usuarios/status:", verifyData); // 👈 Revisa la consola del navegador

          // VALIDACIÓN 2: Comprobar el nombre de la propiedad
          if (verifyData.is_verified === true || verifyData.is_verified === "true" || verifyData.is_verified === 1) {
            userObj.is_verified = true;
            localStorage.setItem('spingamma_user', JSON.stringify(userObj));
            isVerifiedStrict = true; 
          } else {
            console.warn("Fallo de Lógica: El endpoint respondió 200 OK, pero 'is_verified' no es true.", verifyData);
            goToWhatsApp();
            return;
          }
        } else {
          const errorText = await verifyRes.text();
          console.error(`Fallo de Backend: El endpoint respondió con error ${verifyRes.status}`, errorText);
          goToWhatsApp();
          return;
        }
      }

      // 2. Si pasamos hasta aquí, el usuario ESTÁ VERIFICADO (ya sea en localStorage o porque el endpoint lo confirmó)
      const token = localStorage.getItem('spingamma_token');
      const res = await fetch(`${API_URL}/profesionales/${profesional.slug}/resenas/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCalificacionPrevia(data.rating ? data : null);
      } else {
        setCalificacionPrevia(null);
      }
      
      // Abrimos modal de exito final
      setMostrarModalCalificando(true);
      localStorage.removeItem(pendingRateKey);
      setMostrarCalificacion(false);
      
    } catch (err) {
      console.error("Error validando perfiles o reseña", err);
      // Fallback a whatsApp por seguridad si todo crashea
      goToWhatsApp();
    } finally {
      setIsSubmittingReview(false);
    }
  }, [profesional, userName, userObj, pendingRateKey]);

  const handleSubmitReview = useCallback(async ({ rating, description, imageFile, esEdicion }) => {
    if (!profesional || !userObj) return;
    setIsSubmittingReview(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem('spingamma_token');
      
      const formData = new FormData();
      formData.append('rating', rating);
      if (description) formData.append('descripcion', description);
      if (imageFile) formData.append('image', imageFile);
      
      // POST si es nueva, PUT si es edicion
      const method = esEdicion ? 'PUT' : 'POST';
      const endpoint = `${API_URL}/profesionales/${profesional.slug}/resenas`;
      
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      if (!res.ok) throw new Error("Error saving review");
      
      // Si fue exitoso
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

  const handleCerrarPanelCalificacion = useCallback(() => {
    localStorage.removeItem(pendingRateKey);
    setMostrarCalificacion(false);
  }, [pendingRateKey]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('spingamma_user');
    window.location.reload();
  }, []);

  return {
    mostrarQR,
    toggleQR,
    mostrarCalificacion,
    isLoggedIn,
    userName,
    handleShare,
    handleLinkClick,
    handleCalificarClick,
    handleCerrarPanelCalificacion,
    handleLogout,
    // Propiedades nuevas para Modal:
    mostrarModalCalificando,
    setMostrarModalCalificando,
    calificacionPrevia,
    isSubmittingReview,
    handleSubmitReview
  };
}