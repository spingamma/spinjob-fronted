import React from 'react';
import { BarChart2, Globe, Building, Calendar, Download } from 'lucide-react';

export default function AnalyticsHeader({
  viewMode,
  setViewMode,
  days,
  setDays,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  hasChartData,
  onDownloadPDF
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-20">
      <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
        <BarChart2 size={24} className="text-secondary" />
        Analíticas
      </h2>

      <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 items-start sm:items-center flex-wrap">
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto shrink-0">
          <button
            onClick={() => setViewMode('global')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'global' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-500'}`}
          >
            <Globe size={16} /> Aplicación
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'compare' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-500'}`}
          >
            <Building size={16} /> Negocios
          </button>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto shrink-0">
          <div className="relative flex-1 sm:flex-none">
            <select 
              value={days}
              onChange={(e) => setDays(e.target.value === 'custom' ? 'custom' : Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 text-sm font-bold text-primary appearance-none cursor-pointer min-w-[140px]"
            >
              <option value={30}>Último mes</option>
              <option value={90}>Últimos 3 meses</option>
              <option value={180}>Últimos 6 meses</option>
              <option value="custom">Rango de fechas</option>
            </select>
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {days === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 w-full sm:w-auto">
              <input 
                type="date" 
                value={customStartDate} 
                onChange={e => setCustomStartDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl outline-none text-sm font-bold text-gray-500 focus:border-secondary w-full sm:w-auto"
              />
              <span className="text-gray-400">-</span>
              <input 
                type="date" 
                value={customEndDate} 
                onChange={e => setCustomEndDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl outline-none text-sm font-bold text-gray-500 focus:border-secondary w-full sm:w-auto"
              />
            </div>
          )}
        </div>
        
        {hasChartData && (
          <button 
            onClick={onDownloadPDF}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm"
            title="Descargar Reporte en PDF"
          >
            <Download size={18} />
            <span className="hidden lg:inline">Descargar PDF</span>
          </button>
        )}
      </div>
    </div>
  );
}
