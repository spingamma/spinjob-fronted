import React from 'react';
import { BarChart2, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AnalyticsChart({
  viewMode,
  selectedBusinesses,
  isLoadingChart,
  chartData
}) {
  const getChartAreas = () => {
    if (viewMode === 'global' || (viewMode === 'compare' && selectedBusinesses.length === 1)) {
      return [
        { dataKey: 'Visitas', name: 'Visitas', color: 'var(--color-primary)' },
        { dataKey: 'Redes / WhatsApp', name: 'Redes / WhatsApp', color: 'var(--color-secondary)', customName: 'Redes / WhatsApp' }
      ];
    } else if (viewMode === 'compare' && selectedBusinesses.length > 1) {
      return selectedBusinesses.map(b => ({
        dataKey: b.slug,
        name: b.name,
        color: b.color
      }));
    }
    return [];
  };

  const chartAreas = getChartAreas();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 z-0">
      <h3 className="font-bold text-gray-500 mb-6 flex items-center gap-2">
        {viewMode === 'global' ? 'Comportamiento de la App (Visitas vs Contactos)' : 
         (selectedBusinesses.length === 1 ? `Comportamiento de ${selectedBusinesses[0].name}` : 'Comparativa de Interacciones Totales')}
      </h3>

      {viewMode === 'compare' && selectedBusinesses.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <BarChart2 size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold max-w-sm mx-auto">
            Busca y selecciona uno o más negocios arriba para cargar la gráfica.
          </p>
        </div>
      ) : isLoadingChart ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={40} className="animate-spin text-secondary" />
        </div>
      ) : chartData.length > 0 && chartAreas.length > 0 ? (
        <div className="w-full h-[450px] min-h-[450px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <defs>
                {chartAreas.map(a => (
                  <linearGradient key={`color${a.dataKey}`} id={`color${a.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={a.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={a.color} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '8px' }}
                formatter={(value, name) => {
                  const area = chartAreas.find(a => a.dataKey === name);
                  return [value, area ? (area.customName || area.name) : name];
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                wrapperStyle={{ paddingTop: '30px' }}
                formatter={(value, entry) => {
                  const area = chartAreas.find(a => a.dataKey === value);
                  return <span style={{ color: entry.color, fontWeight: 'bold' }}>{area ? (area.customName || area.name) : value}</span>;
                }}
              />
              
              {chartAreas.map(a => (
                <Area 
                  key={a.dataKey}
                  type="monotone" 
                  dataKey={a.dataKey} 
                  name={a.dataKey}
                  stroke={a.color} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill={`url(#color${a.dataKey})`} 
                  activeDot={{ r: 6, strokeWidth: 0, fill: a.color }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="py-10 text-center text-gray-400 font-bold">No hay datos disponibles en este periodo.</div>
      )}
    </div>
  );
}
