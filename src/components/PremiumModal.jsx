import React from 'react';
import { Lock, Sparkles, CheckCircle2, X } from 'lucide-react';

export default function PremiumModal({ isOpen, onClose, featureName }) {
  if (!isOpen) return null;

  const defaultWaMessage = featureName 
    ? `Hola SpinGamma, quiero actualizar mi negocio al plan Premium para activar ${featureName}.`
    : `Hola SpinGamma, quiero actualizar mi negocio al plan Premium.`;
    
  const waUrl = `https://wa.me/59164016676?text=${encodeURIComponent(defaultWaMessage)}`;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-primary/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
          data-testid="close-premium-modal-btn"
        >
          <X size={20} />
        </button>

        <div className="bg-gradient-to-br from-primary/5 via-primary/90/5 to-transparent border-b border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-secondary to-secondary/90 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20 animate-pulse">
            <Lock size={28} />
          </div>
          
          <h2 className="text-2xl font-extrabold text-primary tracking-tight mb-2 flex items-center justify-center gap-2">
            <Sparkles className="text-secondary fill-secondary/20" size={24} /> 
            {featureName ? `${featureName} Premium` : 'Función Premium'}
          </h2>
          
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
            Actualiza al plan Premium para desbloquear esta y muchas más herramientas para tu negocio.
          </p>
        </div>
        
        <div className="p-6 sm:p-8 bg-white">
          <p className="text-primary font-bold mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
            Incluye todo lo del plan Básico, más:
          </p>
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex gap-3 items-start">
              <CheckCircle2 size={18} className="text-secondary shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <strong className="text-primary">Vitrina y catálogo ampliados</strong> (15 visibles, 50 en inventario)
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 size={18} className="text-secondary shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <strong className="text-primary">Hasta 600 pedidos mensuales</strong> (Notificaciones, estados y carrito activo)
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 size={18} className="text-secondary shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <strong className="text-primary">Dashboard de métricas completo</strong> (Analítica para ventas)
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 size={18} className="text-secondary shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <strong className="text-primary">Insignia de Cuenta Verificada</strong> (Más confianza)
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 size={18} className="text-secondary shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <strong className="text-primary">Soporte prioritario</strong> (Vía WhatsApp directo)
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a 
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-gradient-to-r from-secondary to-secondary/90 text-white font-extrabold rounded-xl hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
              data-testid="activate-premium-btn"
            >
              <Sparkles size={16} /> Activar Premium (US$5/mes)
            </a>
            <button 
              onClick={onClose}
              className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-primary font-bold rounded-xl transition-all text-sm"
              data-testid="close-premium-modal-bottom-btn"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
