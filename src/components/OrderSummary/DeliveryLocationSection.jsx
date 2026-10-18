// src/components/OrderSummary/DeliveryLocationSection.jsx

import React from 'react';
import { MapPin, CheckCircle2, AlertCircle, Loader2, Navigation, Edit3 } from 'lucide-react';
import MapSelectorModal from '../MapSelectorModal';

/**
 * Componente modular desacoplado para la gestión del lugar de entrega del cliente.
 * Se muestra exclusivamente cuando el método seleccionado es "Delivery".
 */
export default function DeliveryLocationSection({
  isCourierSelected,
  businessHasLocation,
  isResolvingBusiness,
  customerCoords,
  isLocationConfirmed,
  isMapOpen,
  distanceKm,
  deliveryFee,
  deliveryRatePerKm,
  openMap,
  closeMap,
  confirmCustomerLocation,
  businessCoords,
  currency = 'Bs'
}) {
  if (!isCourierSelected) {
    return null;
  }

  return (
    <div className="mt-4 p-4 rounded-2xl border border-orange-100 bg-orange-50/40 space-y-3 transition-all animate-in fade-in-50 duration-200">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-secondary shrink-0" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
          Ubicación de Entrega (Delivery)
        </h3>
      </div>

      {isResolvingBusiness ? (
        <div className="flex items-center gap-2 py-3 text-xs text-gray-500 font-medium">
          <Loader2 size={16} className="animate-spin text-secondary" />
          <span>Verificando ubicación de despacho del comercio...</span>
        </div>
      ) : !businessHasLocation ? (
        <div 
          data-testid="business-no-location-alert"
          className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5"
        >
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Ubicación del negocio no disponible</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Este comercio aún no tiene registradas sus coordenadas para calcular envíos. Por favor selecciona <strong>Entrega en el local</strong> o contacta al negocio.
            </p>
          </div>
        </div>
      ) : !isLocationConfirmed ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">
            Para calcular el costo de envío exacto (<strong>{deliveryRatePerKm} {currency}/km</strong>), indica dónde deseas recibir tu pedido.
          </p>
          <button
            type="button"
            onClick={openMap}
            data-testid="open-delivery-map-btn"
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-[0.99]"
          >
            <Navigation size={15} />
            <span>Ingresar ubicación para el pedido</span>
          </button>
        </div>
      ) : (
        <div 
          data-testid="delivery-location-confirmed-card"
          className="bg-white rounded-xl p-3 border border-emerald-200 shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Ubicación confirmada</span>
            </div>
            <button
              type="button"
              onClick={openMap}
              data-testid="change-delivery-location-btn"
              className="text-[11px] font-bold text-secondary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 size={12} />
              <span>Cambiar</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Distancia</span>
              <span data-testid="delivery-distance-info" className="font-extrabold text-primary">
                {distanceKm} km
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Costo Envío</span>
              <span data-testid="delivery-fee-info" className="font-black text-secondary">
                {currency} {deliveryFee.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Mapa Leaflet */}
      <MapSelectorModal
        isOpen={isMapOpen}
        onClose={closeMap}
        onConfirm={confirmCustomerLocation}
        initialCoords={customerCoords || businessCoords}
      />
    </div>
  );
}
