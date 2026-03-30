// Archivo: src/hooks/useAccionesPerfil.jsx
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para centralizar la lógica de interacción en el perfil.
 * Maneja: QR, Compartir, Registro de Métricas, Calificaciones y Auth.
 */
export default function useAccionesPerfil(profesional, onProtectedAction) {
  const [mostrarQR, setMostrarQR] = useState(false);

  // Claves de LocalStorage dinámicas por profesional
  const pendingRateKey = `spingamma_pending_rate_${profesional?.slug}`;
  const hasRatedKey = `spingamma_has_rated_${profesional?.slug}`;
  const pendingInteractionKey = `spingamma_pending_interaction_${profesional?.slug}`;

  // Estado del banner de calificación: se muestra si hay una acción pendiente y no ha calificado aún
  const [mostrarCalificacion, setMostrarCalificacion] = useState(() => {
    if (!profesional) return false;
    const isPending = localStorage.getItem(pendingRateKey) === 'true';
    const hasRated = localStorage.getItem(hasRatedKey) === 'true';
    return isPending && !hasRated;
  });

  // Datos del usuario logueado
  const isLoggedIn = localStorage.getItem('spingamma_user') !== null;
  const userName = (() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.nombre || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  })();

  /**
   * Efecto para procesar interacciones pendientes después de que el usuario se registra
   */
  useEffect(() => {
    const userStr = localStorage.getItem('spingamma_user');
    const pendingPlatform = localStorage.getItem(pendingInteractionKey);

    if (userStr && pendingPlatform) {
      // 1. Registrar la métrica que quedó en espera
      registrarInteraccionBackend(pendingPlatform);
      localStorage.removeItem(pendingInteractionKey);

      // 2. Si no ha calificado antes, activar el banner de feedback
      if (localStorage.getItem(hasRatedKey) !== 'true') {
        localStorage.setItem(pendingRateKey, 'true');
        setMostrarCalificacion(true);
      }
    }
  }, [profesional, registrarInteraccionBackend, hasRatedKey, pendingRateKey, pendingInteractionKey]);

  const toggleQR = useCallback(() => setMostrarQR((prev) => !prev), []);

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
    } catch (error) {
      console.error("Error al parsear usuario:", error);
    }
  }, [profesional]);

  /**
   * Maneja clics en enlaces (WhatsApp, Teléfono, Redes).
   * Si no está logueado, dispara el modal y guarda la intención.
   */
  const handleLinkClick = useCallback((e, platformName, url) => {
    if (e) e.preventDefault();
    const isLogged = localStorage.getItem('spingamma_user') !== null;

    if (isLogged) {
      registrarInteraccionBackend(platformName);
      
      // Activar banner de calificación tras la interacción si es la primera vez
      if (localStorage.getItem(hasRatedKey) !== 'true') {
        localStorage.setItem(pendingRateKey, 'true');
        setMostrarCalificacion(true);
      }
      onProtectedAction(url);
    } else {
      // Guardar plataforma para registrarla tras el login exitoso
      localStorage.setItem(pendingInteractionKey, platformName);
      onProtectedAction(url);
    }
  }, [onProtectedAction, registrarInteraccionBackend, hasRatedKey, pendingRateKey, pendingInteractionKey]);

  /**
   * Genera el mensaje dinámico para calificar vía WhatsApp.
   * "Hola SpinGamma, soy [Nombre]. Quiero calificar el perfil profesional de [Profesional]."
   */
  const handleCalificarClick = useCallback(() => {
    if (!profesional) return;

    // Obtener nombre fresco del storage para evitar cierres obsoletos
    const storedUser = localStorage.getItem('spingamma_user');
    let nombreUsuario = 'un usuario';
    
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.nombre) nombreUsuario = parsed.nombre;
      } catch (e) {}
    }

    const spingammaWhatsapp = "59164016676";
    const mensaje = `Hola SpinGamma, soy ${nombreUsuario}. Quiero calificar el perfil profesional de ${profesional.name}.`;
    
    // Uso de api.whatsapp.com para máxima compatibilidad con parámetros de texto
    const url = `https://api.whatsapp.com/send?phone=${spingammaWhatsapp}&text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank', 'noopener,noreferrer');

    // Marcar como calificado y limpiar estados pendientes
    localStorage.setItem(hasRatedKey, 'true');
    localStorage.removeItem(pendingRateKey);
    setMostrarCalificacion(false);
  }, [profesional, hasRatedKey, pendingRateKey]);

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