import React from 'react';
import { Calendar, DollarSign, CheckCircle2, TrendingUp } from 'lucide-react';

export default function DeliveryHistoryControlCard({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  todayStr,
  summary
}) {
  const completedCount = Number(summary?.completed_count || 0);
  const totalEarnings = Number(summary?.total_earnings || 0);
  const avgEarnings = completedCount > 0 ? (totalEarnings / completedCount).toFixed(2) : '0.00';

  // Helper para establecer esta semana (últimos 7 días)
  const setThisWeek = () => {
    const today = new Date();
    const pastWeek = new Date();
    pastWeek.setDate(today.getDate() - 6);
    setStartDate(pastWeek.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  // Helper para establecer este mes
  const setThisMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-100 space-y-4">
      {/* ── SELECTOR DE RANGO DE FECHAS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
          <Calendar size={16} className="text-secondary" />
          <span>Filtro de Historial y Liquidación:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs">
            <span className="font-bold text-gray-400 uppercase text-[10px]">Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="delivery-start-date"
              className="bg-transparent text-xs text-primary font-semibold outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs">
            <span className="font-bold text-gray-400 uppercase text-[10px]">Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="delivery-end-date"
              className="bg-transparent text-xs text-primary font-semibold outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setStartDate(todayStr);
              setEndDate(todayStr);
            }}
            data-testid="delivery-filter-today-btn"
            className="px-2.5 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={setThisWeek}
            data-testid="delivery-filter-week-btn"
            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Semana
          </button>

          <button
            type="button"
            onClick={setThisMonth}
            data-testid="delivery-filter-month-btn"
            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Mes
          </button>
        </div>
      </div>

      {/* ── TARJETA DE RESUMEN DE GANANCIAS DEL PERIODO ── */}
      <div 
        data-testid="delivery-earnings-summary-card"
        className="bg-gradient-to-r from-emerald-50/80 via-emerald-50/40 to-white rounded-2xl p-4 border border-emerald-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">
              Entregas Realizadas
            </span>
            <p className="text-xl font-black text-primary">
              {completedCount} {completedCount === 1 ? 'carrera' : 'carreras'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-emerald-200/60 pt-2 sm:pt-0 sm:pl-4">
          <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">
              Ganancia Total
            </span>
            <p className="text-xl font-black text-secondary">
              Bs. {totalEarnings.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-emerald-200/60 pt-2 sm:pt-0 sm:pl-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">
              Promedio / Carrera
            </span>
            <p className="text-xl font-black text-primary">
              Bs. {avgEarnings}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
