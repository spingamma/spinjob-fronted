import React from 'react';
import { CheckCircle, Store, MapPin, Calendar, Clock, DollarSign } from 'lucide-react';
import { formatOrderCode } from '../../../utils/formatOrderCode';

function formatDeliveredTime(dateString) {
  if (!dateString) return 'Hoy';
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Hoy';
  }
}

export default function CompletedDeliveryCard({ order }) {
  const orderCode = formatOrderCode(order.order_number, order.id);

  return (
    <div 
      data-testid={`completed-delivery-card-${order.id}`}
      className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <CheckCircle size={22} />
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-primary text-sm">
              Pedido #{orderCode}
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Entregado
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <Store size={13} className="text-amber-600" />
              {order.business_name || 'Restaurante'}
            </span>
            <span>→</span>
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-emerald-600" />
              {order.customer_name}
            </span>
          </div>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
          <Clock size={12} />
          {formatDeliveredTime(order.delivered_at)}
        </span>
        <span className="text-base font-black text-emerald-700">
          + Bs. {(order.delivery_cost || 0).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
