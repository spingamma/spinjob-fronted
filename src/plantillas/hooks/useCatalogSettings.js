// src/plantillas/hooks/useCatalogSettings.js

import { useState } from 'react';
import {
  DELIVERY_METHOD_PICKUP,
  DELIVERY_METHOD_COURIER,
  DEFAULT_DELIVERY_METHODS
} from '../../utils/deliveryConstants';

export function useCatalogSettings({
  deliveryMethods = [],
  setDeliveryMethods,
  setOrdersEnabled
}) {
  const [warningMessage, setWarningMessage] = useState('');

  const currentMethods = Array.isArray(deliveryMethods) ? deliveryMethods : [];
  const hasPickup = currentMethods.includes(DELIVERY_METHOD_PICKUP);
  const hasCourier = currentMethods.includes(DELIVERY_METHOD_COURIER);

  const handleOrdersEnabledChange = (e) => {
    const isChecked = e.target.checked;
    if (setOrdersEnabled) {
      setOrdersEnabled(isChecked);
    }
    if (isChecked && currentMethods.length === 0) {
      if (setDeliveryMethods) {
        setDeliveryMethods(DEFAULT_DELIVERY_METHODS);
      }
    }
    setWarningMessage('');
  };

  const handleToggleDeliveryMethod = (method) => {
    if (!setDeliveryMethods) return;

    const isCurrentlySelected = currentMethods.includes(method);

    if (isCurrentlySelected) {
      // Invariante de negocio: No permitir dejar 0 opciones si los pedidos están activos
      if (currentMethods.length <= 1) {
        setWarningMessage('Debes mantener al menos una opción de entrega activa.');
        return;
      }
      setWarningMessage('');
      setDeliveryMethods(currentMethods.filter(m => m !== method));
    } else {
      setWarningMessage('');
      setDeliveryMethods([...currentMethods, method]);
    }
  };

  return {
    hasPickup,
    hasCourier,
    warningMessage,
    handleOrdersEnabledChange,
    handleToggleDeliveryMethod
  };
}
