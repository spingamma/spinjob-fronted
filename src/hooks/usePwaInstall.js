import { useState, useEffect } from 'react';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(() => {
    return typeof window !== 'undefined' ? window.deferredPromptEvent || null : null;
  });

  const isIOS = typeof window !== 'undefined' && /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isStandalone = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true
  );

  useEffect(() => {
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPromptEvent = e;
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        window.deferredPromptEvent = null;
        setDeferredPrompt(null);
      }
      return;
    }
    if (isIOS) {
      alert("Para instalar en iPhone/iPad: Toca el ícono 'Compartir' en Safari y selecciona 'Agregar a inicio'.");
      return;
    }
    alert("Para instalar la aplicación, abre el menú de opciones de tu navegador (los tres puntos arriba a la derecha) y selecciona 'Instalar aplicación' o 'Agregar a la pantalla principal'.");
  };

  return {
    isStandalone,
    isIOS,
    deferredPrompt,
    handleInstallClick
  };
}
