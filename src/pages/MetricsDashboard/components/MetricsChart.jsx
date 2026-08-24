import React from 'react';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary/95 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl text-white">
        <p className="font-bold text-lg mb-2 border-b border-white/10 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm my-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-medium">{entry.name}:</span>
            <span className="font-bold ml-auto">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MetricsChart({ data }) {

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
            <TrendingUp size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary tracking-tight">Evolución de Tráfico</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Métricas de impacto generadas por tu tarjeta</p>
          </div>
        </div>
      </div>
      
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVistas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorClics" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
              dy={10}
              minTickGap={30}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="vistas" 
              name="Aperturas de Tarjeta" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorVistas)" 
              activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "#fff", strokeWidth: 3 }}
            />
            <Area 
              type="monotone" 
              dataKey="clics" 
              name="Clics en Redes/Contacto" 
              stroke="var(--color-secondary)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorClics)" 
              activeDot={{ r: 6, fill: "var(--color-secondary)", stroke: "#fff", strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
