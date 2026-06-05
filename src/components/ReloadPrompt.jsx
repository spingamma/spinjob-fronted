import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Opcional: Revisar actualizaciones cada hora
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Error al registrar Service Worker:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] bg-white border border-[#1E3D51]/10 p-4 rounded-xl shadow-2xl flex flex-col items-center gap-3 w-[90%] max-w-[320px] transition-all duration-500 ease-out">
      <div className="text-sm text-[#1E3D51] text-center font-medium">
        {offlineReady
          ? 'App instalada. Funciona sin conexión.'
          : '¡Nueva versión disponible!'}
      </div>
      
      {needRefresh && (
        <button
          onClick={() => updateServiceWorker(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#F67927] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#F67927]/90 transition-colors shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar ahora
        </button>
      )}
      
      <button
        onClick={close}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default ReloadPrompt;
