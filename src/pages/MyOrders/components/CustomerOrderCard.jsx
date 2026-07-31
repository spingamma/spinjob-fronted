import React from 'react';
import { Loader2, QrCode, AlertCircle, CheckCircle2, PackageCheck, ShieldAlert } from 'lucide-react';
import { formatOrderCode } from '../../../utils/formatOrderCode';

export default function CustomerOrderCard({
  order,
  updatingOrderId,
  confirmingReceivedId,
  setConfirmingReceivedId,
  handleMarkReceived,
  navigate
}) {
  const dateObj = new Date(order.created_at);
  const dateStr = dateObj.toLocaleDateString();
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const isCancelado = order.status === "cancelado";
  const isCompletado = order.status === "completado";
  const isEntregado = order.status === "entregado";
  const isPagado = order.status === "pagado";
  const isPagoEnviado = order.status === "pago_enviado";
  const isReadyForPickup = order.status === "ready_for_pickup";
  const isPaqueteria = order.delivery_method?.startsWith('PAQUETERIA|');

  const badgeClass = isCancelado 
    ? 'bg-red-100 text-red-700 border border-red-200' 
    : isCompletado
    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    : isReadyForPickup
    ? 'bg-[#F9842C] text-white border border-[#F9842C]'
    : isEntregado 
    ? (isPaqueteria ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-green-100 text-green-700 border border-green-200')
    : isPagado 
    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
    : isPagoEnviado
    ? 'bg-orange-100 text-orange-800 border border-orange-200'
    : 'bg-amber-100 text-amber-800 border border-amber-200';

  const statusLabel = isCancelado 
    ? 'CANCELADO' 
    : isCompletado
    ? 'COMPLETADO'
    : isReadyForPickup
    ? 'LISTO PARA RECOJO'
    : isEntregado 
    ? (isPaqueteria ? 'EN CAMINO A PAQUETERÍA' : 'ENTREGADO')
    : isPagado 
    ? 'PAGADO' 
    : isPagoEnviado
    ? 'PAGO ENVIADO'
    : 'PENDIENTE DE PAGO';

  return (
    <div data-testid={`customer-order-card-${order.id}`} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between transition-all hover:shadow-md">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-md ${badgeClass}`}>
            {statusLabel}
          </span>
          <p className="text-xs font-bold text-gray-400">{dateStr} • {timeStr}</p>
        </div>
        
        <h3 className="font-extrabold text-lg mb-3">Pedido #{formatOrderCode(order.order_number, order.id)} ({order.customer_name})</h3>
        
        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">
                <span className="font-bold text-[#1A535C] mr-2">{item.quantity}x</span> 
                {item.product_name}
              </span>
              <span className="text-gray-500 font-bold text-xs">Bs. {item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="md:w-40 flex flex-col justify-between items-end md:items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4 w-full">
        <div className="text-right w-full flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total</p>
          <p className="text-xl font-black text-[#1A535C]">Bs. {order.total_price.toFixed(2)}</p>
        </div>

        {order.status === 'pendiente' || order.status === 'pendiente_de_pago' ? (
          <div className="flex flex-col w-full mt-3 gap-2">
            {order.payment_rejection_reason && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] p-2 rounded-xl text-center font-bold flex flex-col items-center gap-1 leading-tight">
                <AlertCircle size={14} />
                Pago rechazado: {order.payment_rejection_reason}
              </div>
            )}
            <button
              type="button"
              data-testid={`pay-order-btn-${order.id}`}
              onClick={() => {
                const targetSlug = order.business_slug || order.business?.slug || 'spingamma';
                navigate(`/perfil/${targetSlug}/orden/${order.id}`);
              }}
              className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all bg-[#F9842C] hover:bg-[#e06516] text-white"
            >
              <QrCode size={14} /> {order.payment_rejection_reason ? 'Volver a intentar' : 'Pagar con QR'}
            </button>
          </div>
        ) : order.status === 'pago_enviado' ? (
          <button
            type="button"
            disabled
            className="w-full mt-3 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all bg-orange-50 text-orange-700 cursor-default border border-orange-200/60"
          >
            Pago pendiente de verificar
          </button>
        ) : order.status === 'pagado' || order.status === 'entregado' || order.status === 'ready_for_pickup' ? (
          <div className="flex flex-col gap-2 w-full mt-3">
            {order.status === 'entregado' && !isPaqueteria && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] p-2 rounded-xl text-center font-bold">
                Tienes 72 horas para confirmar entrega o presentar reclamo
              </div>
            )}
            {order.status === 'entregado' && isPaqueteria && (
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] p-2 rounded-xl text-center font-bold">
                El negocio envió tu pedido a la paquetería
              </div>
            )}
            
            {(!isPaqueteria || order.status === 'ready_for_pickup') && (
              confirmingReceivedId === order.id ? (
                <div className="w-full flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingReceivedId(null);
                      handleMarkReceived(order.id);
                    }}
                    disabled={updatingOrderId === order.id}
                    className="flex-1 py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                  >
                    {updatingOrderId === order.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingReceivedId(null)}
                    className="flex-1 py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  data-testid={`receive-order-btn-${order.id}`}
                  onClick={() => setConfirmingReceivedId(order.id)}
                  disabled={updatingOrderId === order.id}
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  <PackageCheck size={14} />
                  {order.status === 'ready_for_pickup' ? 'Confirmar Recojo' : 'Producto recibido'}
                </button>
              )
            )}
          </div>
        ) : null}

        {(order.status === 'entregado' || order.status === 'ready_for_pickup') && (
          <button
            type="button"
            data-testid={`claim-order-btn-${order.id}`}
            onClick={() => {
              const text = encodeURIComponent(`Hola Tarjetoso, necesito ayuda con mi pedido #${formatOrderCode(order.order_number, order.id)}.`);
              window.open(`https://wa.me/59164016676?text=${text}`, '_blank');
            }}
            className="w-full mt-2 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60"
          >
            <ShieldAlert size={14} /> Hacer Reclamo
          </button>
        )}

        {order.status === 'cancelado' && order.payment_rejection_reason && (
          <div className="w-full mt-3 bg-orange-50 border border-orange-200 text-orange-800 text-[10px] p-2 rounded-xl text-center font-bold flex flex-col items-center gap-1 leading-tight">
            <AlertCircle size={14} />
            {order.payment_rejection_reason}
          </div>
        )}
      </div>
    </div>
  );
}
