import React from 'react';

export default function AnalyticsNetworkBreakdown({ chartData, networkStats }) {
  if (chartData.length === 0 || networkStats.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-100">
      <h4 className="font-bold text-primary mb-4">Desglose de Redes y Contactos</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {networkStats.map((stat, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative group overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl" style={{ backgroundColor: stat.business.color || 'var(--color-primary)' }}></div>
            <p className="font-black text-gray-500 mb-3 truncate pl-2" style={{ color: stat.business.color || 'var(--color-primary)' }}>
              {stat.business.name}
            </p>
            {Object.keys(stat.redes).length === 0 ? (
              <p className="text-xs text-gray-400 font-medium pl-2">Sin clics en redes registrados</p>
            ) : (
              <div className="space-y-2 pl-2">
                {Object.entries(stat.redes).sort((a,b) => b[1]-a[1]).map(([plataforma, cantidad]) => (
                  <div key={plataforma} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-500 capitalize">{plataforma}</span>
                    <span className="font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-lg">{cantidad}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
