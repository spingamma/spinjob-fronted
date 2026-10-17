import { useState, useEffect, useMemo } from 'react';
import fetchAuth from '../../../utils/fetchAuth';
import { API_URL } from '../../../config/api';

export function useCheckout({
  isOwner,
  deliveryMethods,
  cart,
  navigate,
  slug,
  fetchedQrImage
}) {
  const userStr = localStorage.getItem('spingamma_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const parsedDeliveryMethods = useMemo(() => {
    if (!deliveryMethods) return ['Entrega en el local'];
    try {
      const parsed = typeof deliveryMethods === 'string' ? JSON.parse(deliveryMethods) : deliveryMethods;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['Entrega en el local'];
    } catch {
      return ['Entrega en el local'];
    }
  }, [deliveryMethods]);

  const [customerName, setCustomerName] = useState(isOwner ? 'Venta Presencial' : (user?.nombre || ''));
  const [selectedDeliveryMethodRaw, setSelectedDeliveryMethodRaw] = useState(isOwner ? 'presencial' : parsedDeliveryMethods[0]);
  const [presencialPayment, setPresencialPayment] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOwner) {
      setCustomerName('Venta Presencial');
      setSelectedDeliveryMethodRaw('presencial');
    }
  }, [isOwner]);

  const itemsList = Object.values(cart || {});
  const totalPrice = itemsList.reduce((acc, item) => {
    const rawMatch = (item.product.price || '0').replace(/[^\d.-]/g, '');
    const priceNum = parseFloat(rawMatch);
    const validPrice = isNaN(priceNum) ? 0 : priceNum;
    return acc + validPrice * item.quantity;
  }, 0);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isOwner && !customerName.trim()) return;

    setLoading(true);
    const finalDeliveryMethod = isOwner ? "presencial" : selectedDeliveryMethodRaw;
    
    const orderData = {
      customer_name: customerName.trim() || (isOwner ? "Venta Presencial" : "Cliente"),
      delivery_method: finalDeliveryMethod,
      payment_method: isOwner ? presencialPayment : "qr_simple",
      status: isOwner ? "entregado" : "pendiente",
      is_direct_sale: !!isOwner,
      total_price: totalPrice,
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
    totalPrice,
    handleSubmit
  };
}
