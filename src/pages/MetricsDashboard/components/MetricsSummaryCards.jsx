import React from 'react';
import { Users, MousePointerClick } from 'lucide-react';

export default function MetricsSummaryCards({ totalVistas, totalClics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 mt-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
        <div>
          <p className="text-gray-500 font-bold mb-1 text-xs uppercase tracking-widest">Aperturas de Tarjeta</p>
          <h3 className="text-4xl font-extrabold text-primary tracking-tight">{totalVistas}</h3>
        </div>
        <div className="bg-primary/5 p-4 rounded-xl">
          <Users size={32} className="text-primary" />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary"></div>
        <div>
          <p className="text-gray-500 font-bold mb-1 text-xs uppercase tracking-widest">Interacciones (Clics)</p>
          <h3 className="text-4xl font-extrabold text-secondary tracking-tight">{totalClics}</h3>
        </div>
        <div className="bg-secondary/5 p-4 rounded-xl">
          <MousePointerClick size={32} className="text-secondary" />
        </div>
      </div>
    </div>
  );
}
