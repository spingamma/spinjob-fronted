import React from 'react';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PremiumLockScreen() {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-br from-primary/5 via-primary/90/5 to-transparent border border-white/40 backdrop-blur-lg rounded-3xl p-8 md:p-12 text-center shadow-xl max-w-2xl mx-auto mt-10">
      <div className="w-20 h-20 bg-gradient-to-tr from-secondary to-secondary/90 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 animate-pulse">
        <Lock size={36} />
      </div>
      
      <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-4 flex items-center justify-center gap-2">
        <Sparkles className="text-secondary fill-secondary/20" /> Gestión de Pedidos Premium
      </h2>
      
      <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
        Actualiza al plan Premium para desbloquear esta y muchas más herramientas para tu negocio.
      </p>
      
      <div className="bg-white/80 rounded-2xl p-6 border border-gray-200 shadow-sm text-left max-w-sm mx-auto mb-8 flex flex-col gap-3">
        <p className="text-primary font-bold mb-2 flex items-center gap-2 border-b border-gray-100 pb-3">
          Incluye todo lo del plan Básico, más:
        </p>
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

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button 
          onClick={() => navigate('/mis-negocios')}
          className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-primary font-bold rounded-xl transition-all text-sm"
          data-testid="back-to-businesses-btn"
        >
          Volver
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
