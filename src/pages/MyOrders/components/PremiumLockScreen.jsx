import React from 'react';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PremiumLockScreen({ setIsBusinessMode }) {
  return (
    <div 
      data-testid="premium-lock-container"
      className="bg-gradient-to-br from-primary/5 via-primary/90/5 to-transparent border border-gray-200/80 backdrop-blur-lg rounded-3xl p-8 md:p-12 text-center shadow-xl max-w-2xl mx-auto mt-4"
    >
      <div className="w-20 h-20 bg-gradient-to-tr from-secondary to-secondary/90 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 animate-pulse">
        <Lock size={36} />
      </div>
      
      <h2 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mb-4 flex items-center justify-center gap-2">
        <Sparkles className="text-secondary fill-secondary/20" /> Gestión de Pedidos Premium
      </h2>
      
      <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
        Para recibir y gestionar los pedidos de tus clientes directamente en Tarjetoso, activa el plan Premium en tu negocio.
      </p>
      
      <div className="bg-white/90 rounded-2xl p-6 border border-gray-100 shadow-sm text-left max-w-sm mx-auto mb-8 flex flex-col gap-3">
        <p className="text-primary font-bold mb-2 flex items-center gap-2 border-b border-gray-100 pb-3 text-sm">
          Beneficios del Plan Premium:
        </p>
        <div className="flex gap-3 items-start">
          <CheckCircle2 size={18} className="text-secondary shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700">
            <strong className="text-primary">Hasta 600 pedidos mensuales</strong> (Estados, notificaciones y carrito activo)
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <CheckCircle2 size={18} className="text-secondary shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700">
            <strong className="text-primary">Vitrina y catálogo ampliados</strong> (50 productos)
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <CheckCircle2 size={18} className="text-secondary shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700">
            <strong className="text-primary">Dashboard de métricas</strong> para el crecimiento de tu negocio
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <CheckCircle2 size={18} className="text-secondary shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700">
            <strong className="text-primary">Insignia de Cuenta Verificada</strong>
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button 
          onClick={() => setIsBusinessMode(false)}
          className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-primary font-bold rounded-xl transition-all text-sm"
          data-testid="lock-back-to-client-btn"
        >
          Volver a mis compras
        </button>
        <a 
          href="https://wa.me/59164016676?text=Hola%20SpinGamma,%20quiero%20actualizar%20mi%20negocio%20al%20plan%20Premium%20para%20activar%20los%20Pedidos."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-secondary to-secondary/90 text-white font-extrabold rounded-xl hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
          data-testid="activate-premium-orders-btn"
        >
          <Sparkles size={16} /> Activar Premium (US$5/mes)
        </a>
      </div>
    </div>
  );
}
