import React from 'react';
import { ArrowLeft, BarChart2, Calendar } from 'lucide-react';

export default function MetricsHeader({
  navigate,
  isPremium,
  timeFilter,
  setTimeFilter,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd
}) {
  return (
    <>
      <button onClick={() => navigate('/mis-negocios')} className="flex items-center text-primary/80 hover:text-primary/90 font-medium mb-6 transition-colors group">
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Volver a Mis Negocios
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold text-primary flex items-center gap-3">
          <BarChart2 className="text-secondary" size={32} /> Rendimiento de la Tarjeta
        </h1>
        
        {/* Controles de Filtro (Solo si es Premium) */}
        {isPremium && (
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Calendar size={18} className="text-primary" />
              <select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-transparent text-primary font-semibold outline-none cursor-pointer flex-1 text-sm"
              >
                <option value="general">General (Todos los tiempos)</option>
                <option value="1_month">Último mes</option>
                <option value="3_months">Últimos 3 meses</option>
                <option value="6_months">Últimos 6 meses</option>
                <option value="custom">Rango de fechas</option>
              </select>
            </div>
            
            {timeFilter === 'custom' && (
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
                <input 
                  type="date" 
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-transparent text-sm text-primary font-medium outline-none w-full"
                />
                <span className="text-gray-300 font-bold">-</span>
                <input 
                  type="date" 
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-transparent text-sm text-primary font-medium outline-none w-full"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
