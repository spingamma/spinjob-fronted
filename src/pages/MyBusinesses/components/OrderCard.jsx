import React from 'react';
import { Download, XCircle, Loader2, CheckCircle2, PackageCheck } from 'lucide-react';
import { formatOrderCode } from '../../../utils/formatOrderCode';

export default function OrderCard({ 
  order, 
  updatingOrder, 
  rejectingOrder, 
  setRejectingOrder, 
  handleStatusChange, 
  handleDownloadReceipt,
  isPaqueteria
}) {
  const isPendiente = order.status === "pendiente_de_pago" || order.status === "pendiente" || order.status === "pago_enviado";
  const isPagado = order.status === "pagado";
  const isEntregado = order.status === "entregado";
  const isReadyForPickup = order.status === "ready_for_pickup";
  const isCompletado = order.status === "completado";
  const isCancelado = order.status === "cancelado";

  const statusBadgeClass = isCancelado
    ? 'bg-red-100 text-red-700 border border-red-200'
    : isCompletado
    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    : isReadyForPickup
    ? 'bg-secondary text-white border border-secondary'
    : isEntregado
    ? 'bg-green-100 text-green-700 border border-green-200'
    : isPagado
    ? 'bg-blue-100 text-blue-700 border border-blue-200'
    : order.status === "pago_enviado"
    ? 'bg-orange-100 text-orange-800 border border-orange-200'
    : 'bg-amber-100 text-amber-800 border border-amber-200';

  const statusLabel = isCancelado
    ? 'CANCELADO'
    : isCompletado
    ? 'COMPLETADO'
    : isReadyForPickup
    ? 'LISTO PARA RECOJO'
    : isEntregado
    ? 'ENTREGADO'
    : isPagado
    ? 'PAGADO'
    : order.status === "pago_enviado"
    ? 'PAGO ENVIADO'
    : 'PENDIENTE DE PAGO';

  return (
    <div data-testid={`business-order-card-${order.id}`} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-primary text-sm">Pedido #{formatOrderCode(order.order_number, order.id)}</span>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${statusBadgeClass}`}>
            {statusLabel}
          </span>
        </div>
        <p className="text-xs text-gray-400 font-medium">Cliente: <span className="text-primary font-bold">{order.customer_name}</span></p>
        <p className="text-xs text-gray-400 font-medium">Fecha: <span className="font-semibold text-gray-600">{new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></p>
        {order.delivered_at && (
          <p className="text-xs text-green-600 font-medium mt-0.5">Fecha de Entrega: <span className="font-semibold">{new Date(order.delivered_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></p>
        )}
      </div>
      
      {/* Items Details */}
      <div className="border-t border-b sm:border-none border-gray-50 py-3 sm:py-0 flex-1 sm:max-w-xs">
        <div className="space-y-1">
          {order.items.map((item, idx) => (
            <p key={idx} className="text-xs text-gray-500 font-medium line-clamp-1">
              {item.quantity}x {item.product_name}
            </p>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider text-right">Total</p>
          <p className="font-black text-lg text-primary">Bs. {order.total_price.toFixed(2)}</p>
        </div>
        
        {!isCancelado && (
          <div className="flex gap-2 flex-wrap">
            {isPendiente && !isPaqueteria && (
              <>
                {order.receipt_url && (
                  <button 
                    onClick={() => handleDownloadReceipt(order.receipt_url, order.order_number)}
                    data-testid="download-receipt-btn"
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-bold rounded-xl shadow-sm border border-orange-200 transition-colors"
                  >
                    <Download size={14} /> Descargar Comprobante
                  </button>
                )}
                {rejectingOrder === order.id ? (
                  <div className="flex flex-col gap-2 w-full mt-2">
                    <p className="text-xs font-bold text-gray-600 mb-1">
                      {order.status === 'pago_enviado' ? 'Selecciona el motivo del pago incorrecto:' : 'Selecciona el motivo del rechazo:'}
                    </p>
                    
                    {order.status === 'pago_enviado' ? (
                      <>
                        <button 
                          onClick={() => {
                            handleStatusChange(order.id, 'pendiente_de_pago', 'No llegó el pago a la cuenta del QR');
                            setRejectingOrder(null);
                          }}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors text-left"
                        >
                          No llegó el pago a la cuenta del QR
                        </button>
                        <button 
                          onClick={() => {
                            handleStatusChange(order.id, 'pendiente_de_pago', 'El monto pagado esperado es incorrecto');
                            setRejectingOrder(null);
                          }}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors text-left"
                        >
                          El monto pagado esperado es incorrecto
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => {
                          handleStatusChange(order.id, 'cancelado', 'Lamentamos no poder atender este pedido en este momento. Esperamos estar disponibles pronto.');
                          setRejectingOrder(null);
                        }}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors text-left"
                      >
                        No podemos atender este pedido ahora
                      </button>
                    )}

                    <button 
                      onClick={() => setRejectingOrder(null)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition-colors mt-1"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setRejectingOrder(order.id)}
                    disabled={updatingOrder?.id === order.id}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle size={14} />
                    {order.status === 'pago_enviado' ? 'Pago incorrecto' : 'Rechazar pedido'}
                  </button>
                )}
                <button 
                  onClick={() => handleStatusChange(order.id, 'pagado')}
                  disabled={updatingOrder?.id === order.id}
                  data-testid="mark-paid-btn"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingOrder?.id === order.id && updatingOrder?.status === 'pagado' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Marcar Pagado
                </button>
              </>
            )}

            {isPagado && !isPaqueteria && (
              <button 
                onClick={() => handleStatusChange(order.id, 'entregado')}
                disabled={updatingOrder?.id === order.id}
                data-testid="mark-delivered-btn"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingOrder?.id === order.id && updatingOrder?.status === 'entregado' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <PackageCheck size={14} />
                )}
                Entregado
              </button>
            )}

            {isEntregado && !isPaqueteria && (
              <div className="flex flex-col gap-1 w-full text-right sm:text-left sm:w-auto mt-2 sm:mt-0">
                <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-3 py-2 rounded-xl border border-green-200">
                  <PackageCheck size={14} /> Entregado
                </div>
                <span className="text-[10px] text-gray-400 font-medium">Esperando confirmación del cliente</span>
              </div>
            )}

            {isEntregado && isPaqueteria && (
              <button 
                onClick={() => handleStatusChange(order.id, 'ready_for_pickup')}
                disabled={updatingOrder?.id === order.id}
                data-testid="mark-ready-btn"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary hover:bg-secondary/90 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingOrder?.id === order.id && updatingOrder?.status === 'ready_for_pickup' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <PackageCheck size={14} />
                )}
                Recibir Paquete
              </button>
            )}

            {isReadyForPickup && isPaqueteria && (
              <button 
                onClick={() => handleStatusChange(order.id, 'completado')}
                disabled={updatingOrder?.id === order.id}
                data-testid="mark-completed-btn"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingOrder?.id === order.id && updatingOrder?.status === 'completado' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                Entregar al Cliente
              </button>
            )}

            {isReadyForPickup && !isPaqueteria && (
              <div className="flex items-center gap-1 text-secondary text-xs font-bold bg-orange-50 px-3 py-2 rounded-xl border border-orange-200">
                <PackageCheck size={14} /> Listo para Recojo
              </div>
            )}

            {isCompletado && (
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 size={14} /> Confirmado
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
