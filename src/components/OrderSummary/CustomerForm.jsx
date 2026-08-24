// src/components/OrderSummary/CustomerForm.jsx

import React from "react";
import { CheckCircle2 } from "lucide-react";

/**
 * Form for entering customer name, selecting delivery method and payment method.
 * All interactive elements include data-testid attributes for testing.
 */
export const CustomerForm = ({
  isOwner,
  customerName,
  setCustomerName,
  selectedDeliveryMethod,
  setSelectedDeliveryMethod,
  presencialPayment,
  setPresencialPayment,
  deliveryMethods,
}) => {
  const parsedDeliveryMethods = (() => {
    if (!deliveryMethods) return ["Entrega en el local"];
    try {
      const parsed = typeof deliveryMethods === "string" ? JSON.parse(deliveryMethods) : deliveryMethods;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["Entrega en el local"];
    } catch {
      return ["Entrega en el local"];
    }
  })();

  return (
    <form className="space-y-4">
      {!isOwner && (
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Tu Nombre *
          </label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ej. Juan Pérez"
            data-testid="customer-name-input"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-secondary focus:ring-4 focus:ring-orange-50 transition-all outline-none font-bold"
          />
        </div>
      )}
      {isOwner ? (
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Método de Pago Recibido *
          </label>
          <select
            value={presencialPayment}
            onChange={(e) => setPresencialPayment(e.target.value)}
            data-testid="payment-method-select"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 font-bold text-gray-700 outline-none"
          >
            <option value="efectivo">Efectivo</option>
            <option value="qr_simple">Transferencia / QR</option>
            <option value="pos">Tarjeta (POS)</option>
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Método de Entrega *
          </label>
          <select
            value={selectedDeliveryMethod}
            onChange={(e) => setSelectedDeliveryMethod(e.target.value)}
            data-testid="delivery-method-select"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 font-bold text-gray-700 outline-none"
          >
            {parsedDeliveryMethods.map((method, i) => (
              <option key={i} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      )}
    </form>
  );
};
