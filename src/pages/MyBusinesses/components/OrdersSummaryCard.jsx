import React from 'react';
import { DollarSign, ShoppingBag } from 'lucide-react';

export default function OrdersSummaryCard({ summary }) {
  if (!summary) return null;

  const totalSales = Number(summary.total_sales || 0);
  const ordersCount = Number(summary.orders_count || 0);

  return (
    <div 
      data-testid="orders-summary-card"
      className="bg-white rounded-3xl p-5 mb-5 border border-emerald-100 shadow-sm bg-gradient-to-r from-emerald-50/70 via-white to-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
          <DollarSign size={24} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Ventas del Día (Pagadas)
          </span>
          <p 
            data-testid="summary-total-sales" 
            className="text-2xl font-black text-emerald-700 tracking-tight"
          >
            Bs. {totalSales.toFixed(2)}
          </p>
        </div>
      </div>

      <div 
        data-testid="summary-orders-count"
        className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/60 px-3.5 py-1.5 rounded-xl self-stretch sm:self-auto justify-center sm:justify-start"
      >
        <ShoppingBag size={15} className="text-emerald-600" />
        <span className="text-xs text-emerald-900 font-semibold">
          <strong className="font-extrabold text-emerald-800">{ordersCount}</strong> {ordersCount === 1 ? 'pedido cobrado' : 'pedidos cobrados'}
        </span>
      </div>
    </div>
  );
}
