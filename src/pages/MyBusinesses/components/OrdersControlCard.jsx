import React from 'react';
import { Building, DollarSign, ShoppingBag, PackageOpen, Volume2 } from 'lucide-react';
import { playCashRegisterSound } from '../../../utils/soundEffects';

export default function OrdersControlCard({
  businesses = [],
  selectedBusinessSlug,
  onSelectBusiness,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  todayStr,
  summary,
  isPaqueteria = false,
  handlePaqueteExterno
}) {
  const hasMultipleBusinesses = Array.isArray(businesses) && businesses.length > 1;
  const totalSales = Number(summary?.total_sales || 0);
  const ordersCount = Number(summary?.orders_count || 0);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-100 mb-6 space-y-4">
      {/* Nivel Superior: Selector de Negocio (si hay múltiples) y Filtros de Fecha */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        {/* Selector de Negocio */}
        {hasMultipleBusinesses && (
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <Building size={16} className="text-secondary shrink-0" />
              <span className="hidden sm:inline">Negocio:</span>
            </span>
            <select
              value={selectedBusinessSlug}
              onChange={(e) => onSelectBusiness && onSelectBusiness(e.target.value)}
              data-testid="business-selector-dropdown"
              className="flex-1 lg:flex-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-primary outline-none focus:border-secondary transition-all truncate max-w-full lg:max-w-xs"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.nombre_negocio || b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Rango de Fechas + Botón Hoy */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs">
            <span className="font-bold text-gray-400 uppercase text-[10px]">Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="business-orders-start-date"
              className="bg-transparent text-xs text-primary font-semibold outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs">
            <span className="font-bold text-gray-400 uppercase text-[10px]">Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="business-orders-end-date"
              className="bg-transparent text-xs text-primary font-semibold outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setStartDate(todayStr);
              setEndDate(todayStr);
            }}
            data-testid="business-orders-today-btn"
            className="px-3 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={playCashRegisterSound}
            data-testid="test-cash-sound-btn"
            title="Probar sonido de caja registradora"
            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 size={13} className="text-secondary" />
            <span className="hidden sm:inline">Probar timbre</span>
          </button>

          {isPaqueteria && handlePaqueteExterno && (
            <button
              type="button"
              onClick={handlePaqueteExterno}
              data-testid="ingresar-paquete-externo-btn"
              className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 ml-auto lg:ml-2 transition-transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <PackageOpen size={14} />
              <span>Ingresar Paquete Externo</span>
            </button>
          )}
        </div>
      </div>

      {/* Nivel Inferior: Resumen de Ventas Pagadas */}
      <div
        data-testid="orders-summary-card"
        className="bg-gradient-to-r from-emerald-50/70 via-emerald-50/30 to-white rounded-2xl p-3 sm:p-3.5 border border-emerald-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider block leading-tight">
              Ventas del Período (Pagadas)
            </span>
            <p
              data-testid="summary-total-sales"
              className="text-lg sm:text-xl font-black text-emerald-700 tracking-tight leading-tight"
            >
              Bs. {totalSales.toFixed(2)}
            </p>
          </div>
        </div>

        <div
          data-testid="summary-orders-count"
          className="flex items-center gap-1.5 bg-white border border-emerald-200/60 px-3 py-1 rounded-xl shadow-xs self-stretch sm:self-auto justify-center"
        >
          <ShoppingBag size={14} className="text-emerald-600" />
          <span className="text-xs text-emerald-900 font-semibold">
            <strong className="font-extrabold text-emerald-800">{ordersCount}</strong>{' '}
            {ordersCount === 1 ? 'pedido cobrado' : 'pedidos cobrados'}
          </span>
        </div>
      </div>
    </div>
  );
}
