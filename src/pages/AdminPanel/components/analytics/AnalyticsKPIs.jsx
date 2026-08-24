import React from 'react';

export default function AnalyticsKPIs({ globalStats, days }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-primary rounded-3xl p-6 shadow-sm border border-primary/10 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
        <p className="text-gray-200 font-bold mb-1 text-xs uppercase tracking-widest relative z-10">Total Visitas a Tarjetas</p>
        <div className="flex items-end gap-3 relative z-10">
          <h3 className="text-4xl font-black">{globalStats.totalVisitas}</h3>
          <span className="text-sm bg-white/10 px-2 py-1 rounded-lg font-medium mb-1">
            {days === 'custom' ? 'Rango' : `En ${days} días`}
          </span>
        </div>
      </div>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
        <p className="text-gray-500 font-bold mb-1 text-xs uppercase tracking-widest relative z-10">Clics Redes & WhatsApp</p>
        <div className="flex items-end gap-3 relative z-10">
          <h3 className="text-4xl font-black text-secondary">{globalStats.totalContactos}</h3>
          <span className="text-sm bg-gray-50 text-gray-500 border border-gray-100 px-2 py-1 rounded-lg font-medium mb-1">
            {days === 'custom' ? 'Rango' : `En ${days} días`}
          </span>
        </div>
      </div>
    </div>
  );
}
