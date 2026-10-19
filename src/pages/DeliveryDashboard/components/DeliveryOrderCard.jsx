import React, { useState, useMemo } from 'react';
import { 
  Store, 
  MapPin, 
  Navigation, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Package,
  Bike,
  Loader2,
  AlertOctagon,
  ShieldAlert
} from 'lucide-react';
import { formatOrderCode } from '../../../utils/formatOrderCode';
import { WhatsappIcon } from '../../../plantillas/components/ProfileIcons';
import { cleanWhatsappNumber } from '../../../utils/phone';
import { parseGoogleMapsCoords } from '../../../plantillas/utils/parseGoogleMapsCoords';
import { calculateStraightDistanceKm } from '../../../utils/deliveryCalculator';

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

export default function DeliveryOrderCard({ 
  order, 
  driverCoords, 
  onClaimOrder, 
  isClaiming = false,
  hasActiveDelivery = false
}) {
  const [showItems, setShowItems] = useState(false);
  const orderCode = formatOrderCode(order.order_number, order.id);

  // Calcular distancia al restaurante (desde el backend o cliente)
  const distanceToRestaurant = useMemo(() => {
    if (typeof order.distance_to_restaurant_km === 'number') {
      return order.distance_to_restaurant_km;
    }
    if (driverCoords && order.business_location_url) {
      const restCoords = parseGoogleMapsCoords(order.business_location_url);
      if (restCoords) {
        return calculateStraightDistanceKm(
          driverCoords.lat,
          driverCoords.lng,
          restCoords.lat,
          restCoords.lng
        );
      }
    }
    return null;
  }, [order.distance_to_restaurant_km, order.business_location_url, driverCoords]);

  // Clasificación de distancia y semáforo:
  // 0 - 3 km: Verde
  // 3 - 8 km: Amarillo
  // > 8 km: Rojo (Bloqueado)
  const distanceInfo = useMemo(() => {
    if (distanceToRestaurant === null) {
      return {
        tier: 'unknown',
        badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
        text: 'Distancia calculándose...',
        canAccept: true,
        blockReason: null
      };
    }

    if (distanceToRestaurant <= 3) {
      return {
        tier: 'green',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold',
        dot: '🟢',
        text: `${distanceToRestaurant} km del restaurante`,
        canAccept: true,
        blockReason: null
      };
    }

    if (distanceToRestaurant <= 8) {
      return {
        tier: 'yellow',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
        dot: '🟡',
        text: `${distanceToRestaurant} km del restaurante`,
        canAccept: true,
        blockReason: null
      };
    }

    // De 8 km en adelante -> Rojo y bloqueado
    return {
      tier: 'red',
      badgeClass: 'bg-red-100 text-red-800 border-red-300 font-extrabold',
      dot: '🔴',
      text: `${distanceToRestaurant} km del restaurante`,
      canAccept: false,
      blockReason: 'Debes estar más cerca para aceptar el pedido'
    };
  }, [distanceToRestaurant]);

  // WhatsApp Restaurante
  const waRestaurantUrl = order.business_phone
    ? `https://wa.me/${cleanWhatsappNumber(order.business_phone)}?text=${encodeURIComponent(`Hola ${order.business_name || 'Restaurante'}, soy repartidor de Tarjetoso por el pedido #${orderCode}. ¿Ya está listo para recoger?`)}`
    : null;

  // WhatsApp Cliente
  const waCustomerUrl = order.customer_phone
    ? `https://wa.me/${cleanWhatsappNumber(order.customer_phone)}?text=${encodeURIComponent(`Hola ${order.customer_name}, soy tu repartidor de Tarjetoso con tu pedido de ${order.business_name || 'el restaurante'}. Voy en camino a tu ubicación.`)}`
    : null;

  // Borde dinámico según el semáforo de cercanía
  const cardBorderClass = distanceInfo.tier === 'green'
    ? 'border-emerald-200 hover:border-emerald-300'
    : distanceInfo.tier === 'yellow'
    ? 'border-amber-200 hover:border-amber-300'
    : distanceInfo.tier === 'red'
    ? 'border-red-200 bg-red-50/10'
    : 'border-gray-100';

  return (
    <div 
      data-testid={`delivery-order-card-${order.id}`}
      className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border ${cardBorderClass} hover:shadow-md transition-all space-y-4`}
    >
      {/* ── HEADER DEL PEDIDO & SEMÁFORO DE DISTANCIA ── */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-black text-primary text-base sm:text-lg">
            Pedido #{orderCode}
          </span>
          
          {/* Badge del semáforo de distancia */}
          <span className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 ${distanceInfo.badgeClass}`}>
            <span>{distanceInfo.dot}</span>
            <span>{distanceInfo.text}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <Clock size={15} className="text-secondary" />
          <span>{getTimeAgo(order.created_at)}</span>
        </div>
      </div>

      {/* ── RECOJO (RESTAURANTE) & ENTREGA (CLIENTE) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PUNTO DE RECOJO: RESTAURANTE */}
        <div className="bg-amber-50/50 border border-amber-100/80 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Store size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Punto de Recojo (Comercio)
                </span>
                <h4 className="font-black text-primary text-sm sm:text-base leading-tight">
                  {order.business_name || 'Restaurante'}
                </h4>
              </div>
            </div>

            {order.business_state && (
              <p className="text-xs text-gray-500 font-medium mb-3">
                📍 {order.business_state}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {order.business_location_url ? (
              <a
                href={order.business_location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition-all shadow-2xs hover:scale-[1.02]"
              >
                <Navigation size={14} className="text-amber-700" />
                <span>Ruta al Local</span>
              </a>
            ) : (
              <span className="text-[11px] text-gray-400 italic">Sin mapa registrado</span>
            )}

            {waRestaurantUrl && (
              <a
                href={waRestaurantUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-2xs hover:scale-[1.02]"
                title="Escribir al restaurante por WhatsApp"
              >
                <WhatsappIcon size={14} className="fill-current text-white" />
                <span>WhatsApp Local</span>
              </a>
            )}
          </div>
        </div>

        {/* PUNTO DE ENTREGA: CLIENTE */}
        <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Punto de Entrega (Cliente)
                </span>
                <h4 className="font-black text-primary text-sm sm:text-base leading-tight">
                  {order.customer_name}
                </h4>
              </div>
            </div>

            {order.distance_km && (
              <p className="text-xs text-emerald-700 font-bold mb-3">
                📏 Trayecto a cliente: ~{order.distance_km} km
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {order.delivery_location_url ? (
              <a
                href={order.delivery_location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold rounded-xl transition-all shadow-2xs hover:scale-[1.02]"
              >
                <Navigation size={14} className="text-emerald-700" />
                <span>Ruta al Cliente</span>
              </a>
            ) : (
              <span className="text-[11px] text-gray-400 italic">Sin GPS confirmado</span>
            )}

            {waCustomerUrl && (
              <a
                href={waCustomerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-2xs hover:scale-[1.02]"
                title="Escribir al cliente por WhatsApp"
              >
                <WhatsappIcon size={14} className="fill-current text-white" />
                <span>WhatsApp Cliente</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── DETALLES DE ITEMS Y PRODUCTOS ──────────── */}
      <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
        <button
          onClick={() => setShowItems(!showItems)}
          className="w-full flex items-center justify-between text-xs font-extrabold text-primary hover:text-secondary transition-colors"
        >
          <span className="flex items-center gap-2">
            <Package size={16} className="text-secondary" />
            Contenido del Paquete ({order.items?.length || 0} productos)
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            {showItems ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {showItems && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            {order.items?.map((item, idx) => {
              let choicesList = [];
              if (item.selected_choices) {
                try {
                  choicesList = typeof item.selected_choices === 'string'
                    ? JSON.parse(item.selected_choices)
                    : item.selected_choices;
                  if (!Array.isArray(choicesList)) choicesList = [];
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

      {/* ── FOOTER: TARIFAS, GANANCIA Y BOTÓN ACEPTAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-gray-100">
        <div>
          <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider block">
            Ganancia por Despacho
          </span>
          <p className="text-xl font-black text-secondary">
            Bs. {(order.delivery_cost || 0).toFixed(2)}
          </p>
          <span className="text-[10px] text-gray-400">
            Total del pedido pagado en QR: Bs. {order.total_price?.toFixed(2)}
          </span>
        </div>

        {/* BOTÓN DE ACCIÓN CON VALIDACIÓN DE PEDIDO ACTIVO (< 1 activo) Y DISTANCIA (< 8km) */}
        <div className="flex flex-col items-stretch sm:items-end gap-1">
          {hasActiveDelivery ? (
            <div className="flex flex-col items-stretch sm:items-end">
              <button
                disabled={true}
                data-testid={`active-delivery-limit-btn-${order.id}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-xs rounded-2xl cursor-not-allowed opacity-90"
                title="Ya tienes una entrega en curso"
              >
                <Clock size={16} className="text-amber-600" />
                <span>Entrega en curso (Máx. 1)</span>
              </button>
              <span className="text-[11px] font-bold text-amber-700 text-center sm:text-right mt-1">
                Completa tu pedido actual antes de tomar otro
              </span>
            </div>
          ) : distanceInfo.canAccept ? (
            <button
              onClick={() => onClaimOrder(order.id)}
              disabled={isClaiming}
              data-testid={`accept-delivery-btn-${order.id}`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-orange-600 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isClaiming ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Aceptando...</span>
                </>
              ) : (
                <>
                  <Bike size={18} />
                  <span>Aceptar Pedido 🛵</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-col items-stretch sm:items-end">
              <button
                disabled={true}
                data-testid={`blocked-delivery-btn-${order.id}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 border border-red-200 text-red-600 font-extrabold text-xs rounded-2xl cursor-not-allowed opacity-80"
                title="Estás a más de 8 km del restaurante"
              >
                <ShieldAlert size={16} className="text-red-500" />
                <span>Bloqueado (&gt; 8 km)</span>
              </button>
              <span className="text-[11px] font-bold text-red-600 text-center sm:text-right mt-1">
                {distanceInfo.blockReason}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
