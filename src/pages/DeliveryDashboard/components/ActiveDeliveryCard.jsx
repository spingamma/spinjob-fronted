import React, { useState } from 'react';
import { 
  Store, 
  MapPin, 
  Navigation, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Package,
  Bike,
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatOrderCode } from '../../../utils/formatOrderCode';
import { WhatsappIcon } from '../../../plantillas/components/ProfileIcons';
import { cleanWhatsappNumber } from '../../../utils/phone';

function getTimeAgo(dateString) {
  try {
    const orderDate = new Date(dateString);
    const now = new Date();
    const diffMin = Math.floor((now - orderDate) / (1000 * 60));
    if (diffMin < 1) return 'Hace un momento';
    if (diffMin === 1) return 'Hace 1 min';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours === 1) return 'Hace 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    return orderDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  } catch {
    return 'Reciente';
  }
}

export default function ActiveDeliveryCard({ 
  order, 
  onDeliverOrder, 
  isDelivering = false 
}) {
  const [showItems, setShowItems] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const orderCode = formatOrderCode(order.order_number, order.id);

  // WhatsApp Restaurante
  const waRestaurantUrl = order.business_phone
    ? `https://wa.me/${cleanWhatsappNumber(order.business_phone)}?text=${encodeURIComponent(`Hola ${order.business_name || 'Restaurante'}, soy el repartidor de Tarjetoso por el pedido #${orderCode}. Ya estoy en camino a recoger el pedido.`)}`
    : null;

  // WhatsApp Cliente
  const waCustomerUrl = order.customer_phone
    ? `https://wa.me/${cleanWhatsappNumber(order.customer_phone)}?text=${encodeURIComponent(`Hola ${order.customer_name}, soy tu repartidor de Tarjetoso con tu pedido de ${order.business_name || 'el restaurante'}. Ya voy en camino a tu ubicación.`)}`
    : null;

  const phoneTelUrl = order.customer_phone
    ? `tel:${order.customer_phone}`
    : null;

  return (
    <div 
      data-testid={`active-delivery-card-${order.id}`}
      className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-primary/20 space-y-4 relative overflow-hidden"
    >
      {/* ── BANNER DE ESTADO EN CURSO ── */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-black text-primary text-base sm:text-lg">
            Entrega #{orderCode}
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200 font-extrabold flex items-center gap-1.5 animate-pulse">
            <Bike size={14} className="text-blue-700" />
            <span>En camino al cliente</span>
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>GPS activo</span>
          </span>

        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <Clock size={15} className="text-secondary" />
          <span>Aceptado {getTimeAgo(order.created_at)}</span>
        </div>
      </div>

      {/* ── PASOS: RETIRO EN COMERCIO Y ENTREGA AL CLIENTE ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PASO 1: RECOJO EN LOCAL */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                1
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                  Punto de Retiro (Comercio)
                </span>
                <h4 className="font-black text-primary text-sm sm:text-base leading-tight">
                  {order.business_name || 'Restaurante'}
                </h4>
              </div>
            </div>

            {order.business_state && (
              <p className="text-xs text-gray-600 font-medium mb-3">
                📍 {order.business_state}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {order.business_location_url && (
              <a
                href={order.business_location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-all shadow-2xs hover:scale-[1.02]"
              >
                <Navigation size={14} className="text-amber-700" />
                <span>Ruta al Local</span>
              </a>
            )}

            {waRestaurantUrl && (
              <a
                href={waRestaurantUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-2xs hover:scale-[1.02]"
                title="Escribir al restaurante"
              >
                <WhatsappIcon size={14} className="fill-current text-white" />
                <span>WhatsApp Local</span>
              </a>
            )}
          </div>
        </div>

        {/* PASO 2: ENTREGA AL CLIENTE */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                2
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                  Punto de Entrega (Cliente)
                </span>
                <h4 className="font-black text-primary text-sm sm:text-base leading-tight">
                  {order.customer_name}
                </h4>
              </div>
            </div>

            {order.distance_km && (
              <p className="text-xs text-emerald-800 font-bold mb-3">
                📏 Distancia calculada: ~{order.distance_km} km
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {order.delivery_location_url && (
              <a
                href={order.delivery_location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl transition-all shadow-2xs hover:scale-[1.02]"
              >
                <Navigation size={14} className="text-emerald-700" />
                <span>Ruta al Cliente</span>
              </a>
            )}

            {waCustomerUrl && (
              <a
                href={waCustomerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs hover:scale-[1.02]"
                title="Escribir al cliente por WhatsApp"
              >
                <WhatsappIcon size={14} className="fill-current text-white" />
                <span>WhatsApp</span>
              </a>
            )}

            {phoneTelUrl && (
              <a
                href={phoneTelUrl}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs font-bold rounded-xl transition-all shadow-2xs"
                title="Llamar directamente al cliente"
              >
                <Phone size={14} />
                <span>Llamar</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── NOTA DE ENTREGA O REFERENCIA SI EXISTE ── */}
      {order.delivery_notes && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-900 flex items-start gap-2">
          <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Instrucciones del cliente:</strong>
            <span>{order.delivery_notes}</span>
          </div>
        </div>
      )}

      {/* ── DETALLE DEL PAQUETE ── */}
      <div className="border border-gray-100 rounded-2xl p-3.5 bg-gray-50/50">
        <button
          onClick={() => setShowItems(!showItems)}
          className="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:text-primary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Package size={16} className="text-secondary" />
            <span>Ver contenido del pedido ({order.items?.length || 0} items)</span>
          </div>
          {showItems ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showItems && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            {order.items?.map((item, idx) => {
              let choicesList = [];
              if (item.selected_choices) {
                try {
                  const parsed = typeof item.selected_choices === 'string'
                    ? JSON.parse(item.selected_choices)
                    : item.selected_choices;
                  if (Array.isArray(parsed)) {
                    choicesList = parsed.map(c => typeof c === 'string' ? c : c.name || c.choice_name);
                  }
                } catch {
                  choicesList = [];
                }
              }

              return (
                <div key={idx} className="flex justify-between items-start text-xs text-gray-700">
                  <div>
                    <span className="font-bold text-primary">{item.quantity}x</span> {item.product_name}
                    {choicesList.length > 0 && (
                      <p className="text-[11px] text-gray-400 pl-4">
                        Con: {choicesList.join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-500">
                    Bs. {item.subtotal?.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FOOTER: AVISO DE PAGO, GANANCIA Y BOTÓN DE ENTREGA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-gray-100">
        <div>
          <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider block">
            Ganancia por Despacho
          </span>
          <p className="text-xl font-black text-secondary">
            Bs. {(order.delivery_cost || 0).toFixed(2)}
          </p>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
            ✓ Total Pagado en QR (No cobrar efectivo)
          </span>
        </div>

        {/* BOTÓN CONFIRMAR ENTREGA CON MODAL */}
        <div>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isDelivering}
            data-testid={`deliver-order-btn-${order.id}`}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm rounded-2xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isDelivering ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Confirmando entrega...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>¡Marcar como Entregado! ✅</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── MODAL DE CONFIRMACIÓN DE ENTREGA ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-lg font-black text-primary">
                ¿Confirmar Entrega?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                ¿Ya entregaste el pedido <strong>#{orderCode}</strong> en manos del cliente {order.customer_name}?
              </p>
            </div>

            <div className="bg-emerald-50 p-3 rounded-2xl text-xs font-bold text-emerald-800">
              Ganancia a sumar: Bs. {(order.delivery_cost || 0).toFixed(2)}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                Aún no
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  onDeliverOrder(order.id);
                }}
                data-testid={`confirm-deliver-modal-btn-${order.id}`}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Sí, ¡Entregado!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
