// Archivo: src/components/InstallPrompt.jsx
import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export default function InstallPrompt() {
  // ==========================================
  // 🚀 SWITCH MAESTRO DE INSTALACIÓN
  // Cambia esto a "true" cuando compres tu dominio oficial
  // ==========================================
  const IS_PWA_ENABLED = true; 

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const isIOS = typeof window !== 'undefined' && /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);

  useEffect(() => {
    // Si el switch está apagado, detenemos toda la lógica de detección en seco
    if (!IS_PWA_ENABLED) return;

    if (isStandalone) {
      return;
    }
    
    if (isIOS) {
      // Mostrar el prompt en iOS después de unos segundos para no ser invasivo
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // 3. Interceptar el evento de instalación en Android/PC (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e) => {
      // Prevenir el mini-infobar por defecto del navegador
      e.preventDefault();
      // Guardar el evento para dispararlo cuando el usuario haga clic en nuestro botón
      setDeferredPrompt(e);
      // Mostrar nuestro banner personalizado
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [IS_PWA_ENABLED, isStandalone, isIOS]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar el prompt nativo de instalación
    deferredPrompt.prompt();

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó la instalación de la PWA');
    } else {
      console.log('Usuario rechazó la instalación de la PWA');
    }

    // Limpiar el estado
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  // Si el switch está en false, o si ya está instalada, no renderizamos absolutamente nada
  if (!IS_PWA_ENABLED || isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-[400px] z-[150] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-primary/95 backdrop-blur-md border border-primary/50 p-4 sm:p-5 rounded-2xl shadow-2xl relative overflow-hidden group">
        
        {/* Efecto de luz de fondo */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-secondary"></div>
        
        <button 
          onClick={handleClose}
          data-testid="install-prompt-close-btn"
          className="absolute top-3 right-3 p-1.5 text-gray-200 hover:text-white bg-primary/90/50 hover:bg-primary/90 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4 mt-1">
          <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center shrink-0 border-2 border-secondary/20">
            <img 
              src="/icon-192.webp" 
              alt="SpinGamma Logo" 
              className="w-8 h-8 object-contain rounded-md"
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = "https://ui-avatars.com/api/?name=SG&background=F67927&color=fff"; 
              }}
            />
          </div>
          
          <div className="flex-1 pr-4">
            <h3 className="text-white font-bold text-base leading-tight mb-1">
  Instala Tarjetoso
</h3>
            
            {isIOS ? (
              <div className="text-gray-200 text-xs leading-relaxed">
                Instala esta app en tu iPhone: toca el ícono <Share size={12} className="inline mx-0.5 text-secondary" /> <strong>Compartir</strong> abajo y luego <PlusSquare size={12} className="inline mx-0.5 text-secondary" /> <strong>Agregar a inicio</strong>.
              </div>
            ) : (
              <>
                <p className="text-gray-200 text-xs mb-3 leading-relaxed">
                  Agrega nuestro directorio a tu pantalla de inicio para acceso rápido, sin ocupar espacio.
                </p>
                <button 
                  onClick={handleInstallClick}
                  data-testid="install-prompt-btn"
                  className="w-full bg-secondary hover:bg-secondary/90 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Instalar App
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}