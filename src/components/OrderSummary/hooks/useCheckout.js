import { useState, useEffect, useMemo } from 'react';
import fetchAuth from '../../../utils/fetchAuth';
import { API_URL } from '../../../config/api';
import { normalizeDeliveryMethods, DELIVERY_METHOD_COURIER } from '../../../utils/deliveryConstants';
import { useDeliveryCalculation } from './useDeliveryCalculation';

export function useCheckout({
  isOwner,
  deliveryMethods,
  cart,
  navigate,
  slug,
  fetchedQrImage,
  businessLocationUrl
}) {
  const userStr = localStorage.getItem('spingamma_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const parsedDeliveryMethods = useMemo(() => {
    return normalizeDeliveryMethods(deliveryMethods);
  }, [deliveryMethods]);

  const [customerName, setCustomerName] = useState(isOwner ? 'Venta Presencial' : (user?.nombre || ''));
  const [selectedDeliveryMethodRaw, setSelectedDeliveryMethodRaw] = useState(isOwner ? 'presencial' : parsedDeliveryMethods[0]);
  const [presencialPayment, setPresencialPayment] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOwner) {
      setCustomerName('Venta Presencial');
      setSelectedDeliveryMethodRaw('presencial');
    } else if (parsedDeliveryMethods.length > 0 && !parsedDeliveryMethods.includes(selectedDeliveryMethodRaw)) {
      setSelectedDeliveryMethodRaw(parsedDeliveryMethods[0]);
    }
  }, [isOwner, parsedDeliveryMethods, selectedDeliveryMethodRaw]);

  // Hook desacoplado de cálculo de delivery
  const deliveryCalc = useDeliveryCalculation({
    slug,
    businessLocationUrl,
    selectedDeliveryMethod: selectedDeliveryMethodRaw
  });

  const isDelivery = selectedDeliveryMethodRaw === DELIVERY_METHOD_COURIER;
  const currentDeliveryFee = isDelivery ? deliveryCalc.deliveryFee : 0;

  const itemsList = Object.values(cart || {});
  const itemsPrice = itemsList.reduce((acc, item) => {
    const rawMatch = (item.product.price || '0').replace(/[^\d.-]/g, '');
    const priceNum = parseFloat(rawMatch);
    const validPrice = isNaN(priceNum) ? 0 : priceNum;
    return acc + validPrice * item.quantity;
  }, 0);

  const finalTotalPrice = Math.round((itemsPrice + currentDeliveryFee) * 100) / 100;
  const isDeliveryBlocked = !isOwner && isDelivery && !deliveryCalc.isDeliveryReady;

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isOwner && !customerName.trim()) return;

    if (isDeliveryBlocked) {
      if (!deliveryCalc.businessHasLocation) {
        alert("Este comercio no tiene configurada su ubicación para calcular envíos. Por favor selecciona 'Entrega en el local'.");
      } else {
        alert("Por favor ingresa y confirma la ubicación de tu pedido en el mapa antes de continuar.");
      }
      return;
    }

    setLoading(true);
    const finalDeliveryMethod = isOwner ? "presencial" : selectedDeliveryMethodRaw;
    
    const orderData = {
      customer_name: customerName.trim() || (isOwner ? "Venta Presencial" : "Cliente"),
      delivery_method: finalDeliveryMethod,
      delivery_cost: isDelivery ? deliveryCalc.deliveryFee : 0,
      delivery_location_url: isDelivery ? deliveryCalc.customerLocationUrl : null,
      distance_km: isDelivery ? deliveryCalc.distanceKm : null,
      payment_method: isOwner ? presencialPayment : "qr_simple",
      status: isOwner ? "entregado" : "pendiente",
      is_direct_sale: !!isOwner,
      total_price: finalTotalPrice,
      items: itemsList.map(item => {
        const rawMatch = (item.product.price || "0").replace(/[^\d.-]/g, '');
        const priceNum = parseFloat(rawMatch);
        const validPrice = isNaN(priceNum) ? 0 : priceNum;
        return {
          product_id: item.product.id || null,
          product_name: item.product.name,
          quantity: item.quantity,
          price_at_time: validPrice,
          subtotal: validPrice * item.quantity,
          selected_choices: item.selected_choices
            ? (typeof item.selected_choices === 'string' ? item.selected_choices : JSON.stringify(item.selected_choices))
            : null
        };
      })
    };

    try {
      const res = await fetchAuth(`${API_URL}/businesses/${slug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!res.ok) throw new Error("Error al enviar pedido");

      const resData = await res.json().catch(() => ({}));
      navigate(`/perfil/${slug}/orden/${resData.id}`, { state: { order: resData, paymentQrImage: fetchedQrImage }, replace: true });
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        alert("Hubo un problema al enviar tu pedido. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    customerName,
    setCustomerName,
    selectedDeliveryMethodRaw,
    setSelectedDeliveryMethodRaw,
    presencialPayment,
    setPresencialPayment,
    loading,
    liveDeliveryMethods: parsedDeliveryMethods,
    itemsList,
    itemsPrice,
    totalPrice: finalTotalPrice,
    deliveryFee: currentDeliveryFee,
    deliveryCalc,
    isDeliveryBlocked,
    handleSubmit
  };
}
