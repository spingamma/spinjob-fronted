// src/plantillas/components/CatalogSettings.jsx

import React from 'react';
import { Settings2, Store, Bike, AlertCircle } from 'lucide-react';
import PaymentQrUploader from './PaymentQrUploader';
import { useCatalogSettings } from '../hooks/useCatalogSettings';
import {
  DELIVERY_METHOD_PICKUP,
  DELIVERY_METHOD_COURIER
} from '../../utils/deliveryConstants';

export default function CatalogSettings({
  isPremium,
  ordersEnabled,
  setOrdersEnabled,
  paymentQrImage,
  setPaymentQrImage,
  deliveryMethods,
  setDeliveryMethods
}) {
  const {
    hasPickup,
    hasCourier,
    warningMessage,
    handleOrdersEnabledChange,
    handleToggleDeliveryMethod
  } = useCatalogSettings({
    deliveryMethods,
    setDeliveryMethods,
    setOrdersEnabled
  });

  return (
    <div className="pt-2">
      <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-4">
        <Settings2 size={16} className="text-secondary" /> Configuración de Catálogo
      </h4>

      {isPremium && (
        <div className="mb-2 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <input
              data-testid="ordersEnabledCheckbox"
              type="checkbox"
              id="ordersEnabledCheckbox"
              checked={ordersEnabled}
              onChange={handleOrdersEnabledChange}
              className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="ordersEnabledCheckbox" className="text-xs font-bold text-primary cursor-pointer select-none">
              Habilitar "Mis pedidos" (Carrito de compras)
            </label>
          </div>

          {ordersEnabled && (
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
              {/* Carga de QR Bancario */}
              <PaymentQrUploader paymentQrImage={paymentQrImage} setPaymentQrImage={setPaymentQrImage} />

              {/* Selección de Métodos de Entrega */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-primary">
                    Métodos de entrega disponibles para tus clientes *
                  </label>
                </div>
                <p className="text-[11px] text-gray-500">
                  Selecciona uno o ambos métodos para que el cliente elija en su compra:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Opción 1: Entrega en local */}
                  <label
                    htmlFor="delivery-pickup-checkbox"
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      hasPickup
                        ? 'border-secondary bg-orange-50/40 text-primary font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id="delivery-pickup-checkbox"
                      data-testid="delivery-method-pickup-checkbox"
                      checked={hasPickup}
                      onChange={() => handleToggleDeliveryMethod(DELIVERY_METHOD_PICKUP)}
                      className="mt-0.5 w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Store size={15} className={hasPickup ? "text-secondary" : "text-gray-400"} />
                        <span className="text-xs font-bold">Entrega en local</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-normal mt-0.5">
                        El cliente retira en tu dirección
                      </p>
                    </div>
                  </label>

                  {/* Opción 2: Delivery */}
                  <label
                    htmlFor="delivery-courier-checkbox"
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      hasCourier
                        ? 'border-secondary bg-orange-50/40 text-primary font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id="delivery-courier-checkbox"
                      data-testid="delivery-method-delivery-checkbox"
                      checked={hasCourier}
                      onChange={() => handleToggleDeliveryMethod(DELIVERY_METHOD_COURIER)}
                      className="mt-0.5 w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Bike size={15} className={hasCourier ? "text-secondary" : "text-gray-400"} />
                        <span className="text-xs font-bold">Delivery</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-normal mt-0.5">
                        Envío motorizado a domicilio
                      </p>
                    </div>
                  </label>
                </div>

                {warningMessage && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200 animate-in fade-in">
                    <AlertCircle size={14} className="shrink-0 text-amber-600" />
                    <span>{warningMessage}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
