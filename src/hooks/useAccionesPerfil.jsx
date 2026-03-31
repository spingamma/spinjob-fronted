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

  const isLoggedIn = localStorage.getItem('spingamma_user') !== null;
  const userName = (() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).nombre; } catch (e) { return ''; }
    }
    return '';
  })();

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

  const registrarInteraccionBackend = useCallback((platformName) => {
    const userStr = localStorage.getItem('spingamma_user');
    if (!userStr || !profesional) return;

    try {
      const userObj = JSON.parse(userStr);
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

      fetch(`${API_URL}/profesionales/${profesional.slug}/interaccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_phone: userObj.celular,
          user_name: userObj.nombre,
          platform: platformName
        })
      }).catch(err => console.error("Error silencioso registrando métrica:", err));
    } catch (error) {}
  }, [profesional]);

  const handleLinkClick = useCallback((e, platformName, url) => {
    e.preventDefault();
    const isLogged = localStorage.getItem('spingamma_user') !== null;

    if (isLogged) {
      registrarInteraccionBackend(platformName);
      
      localStorage.setItem(pendingRateKey, 'true');
      setMostrarCalificacion(true);
      
      onProtectedAction(url);
    } else {
      localStorage.setItem(pendingInteractionKey, platformName);
      onProtectedAction(url);
    }
  }, [onProtectedAction, registrarInteraccionBackend, pendingRateKey, pendingInteractionKey]);

  const handleCalificarClick = useCallback(() => {
    if (!profesional) return;
    const spingammaWhatsapp = "59164016676";
    const mensaje = `Hola SpinGamma, soy ${userName || 'un usuario'}. Quiero calificar el perfil profesional de ${profesional.name}.`;
    const url = `https://wa.me/${spingammaWhatsapp}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank', 'noopener,noreferrer');

    localStorage.removeItem(pendingRateKey);
    setMostrarCalificacion(false);
  }, [profesional, userName, pendingRateKey]);

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
    handleLogout
  };
}