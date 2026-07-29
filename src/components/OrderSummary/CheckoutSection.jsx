// src/components/OrderSummary/CheckoutSection.jsx

import React, { useState, useEffect } from 'react';
import { Send, ShoppingBag, ArrowLeft, Store } from 'lucide-react';
import fetchAuth from '../../utils/fetchAuth';
import { API_URL } from '../../config/api';

/**
 * Checkout UI for creating a new order.
 * Manages its own local state for the form inputs and handles submission.
 */
export default function CheckoutSection({
  isOwner,
  deliveryMethods,
  cart,
  navigate,
  slug,
  fetchedQrImage
}) {
  const userStr = localStorage.getItem('spingamma_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const parsedDeliveryMethods = React.useMemo(() => {
    if (!deliveryMethods) return ['Entrega en el local'];
    try {
      const parsed = typeof deliveryMethods === 'string' ? JSON.parse(deliveryMethods) : deliveryMethods;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['Entrega en el local'];
    } catch {
      return ['Entrega en el local'];
    }
  }, [deliveryMethods]);

  const [customerName, setCustomerName] = useState(isOwner ? 'Venta Presencial' : (user?.nombre || ''));
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(isOwner ? 'presencial' : parsedDeliveryMethods[0]);
  const [presencialPayment, setPresencialPayment] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOwner) {
      setCustomerName('Venta Presencial');
      setSelectedDeliveryMethod('presencial');
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
    const orderData = {
      customer_name: customerName.trim() || (isOwner ? "Venta Presencial" : "Cliente"),
      delivery_method: isOwner ? "presencial" : selectedDeliveryMethod,
      payment_method: isOwner ? presencialPayment : "qr_simple",
      status: isOwner ? "entregado" : "pendiente",
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
          subtotal: validPrice * item.quantity
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-[#1A535C]">
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors" data-testid="back-button-checkout">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight">
          {isOwner ? 'Registrar Venta Presencial' : 'Tu Pedido'}
        </h1>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6">
        {isOwner && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <Store size={22} className="text-blue-600 shrink-0" />
            <p className="text-xs font-medium">Estás registrando una <strong>Venta Presencial</strong>. Se descontará del inventario.</p>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-sm font-bold text-[#757778] uppercase tracking-wider mb-4 border-b pb-2">Para: {slug}</h2>
          <div className="space-y-4">
            {itemsList.map((item, idx) => {
              const rawMatch = (item.product.price || '0').replace(/[^\d.-]/g, '');
              const priceNum = parseFloat(rawMatch);
              const validPrice = isNaN(priceNum) ? 0 : priceNum;
              return (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-sm">{item.product.name}</p>
                    <p className="text-xs text-[#757778]">{item.quantity} x Bs. {validPrice.toFixed(2)}</p>
                  </div>
                  <p className="font-black">Bs. {(item.quantity * validPrice).toFixed(2)}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-end">
            <span className="text-gray-500 font-bold">Total a pagar</span>
            <span className="text-2xl font-black text-[#F9842C]">Bs. {(totalPrice ?? 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-[#1A535C] mb-4 border-b pb-2">Detalles del {isOwner ? 'Cliente' : 'Pedido'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isOwner && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tu Nombre *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#F9842C] focus:ring-4 focus:ring-orange-50 transition-all outline-none font-bold"
                  data-testid="customer-name-input"
                />
              </div>
            )}
            {isOwner ? (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Método de Pago Recibido *</label>
                <select value={presencialPayment} onChange={e => setPresencialPayment(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 font-bold text-gray-700 outline-none" data-testid="payment-method-select">
                  <option value="efectivo">Efectivo</option>
                  <option value="qr_simple">Transferencia / QR</option>
                  <option value="pos">Tarjeta (POS)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Método de Entrega *</label>
                <select value={selectedDeliveryMethod} onChange={e => setSelectedDeliveryMethod(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 font-bold text-gray-700 outline-none" data-testid="delivery-method-select">
                  {parsedDeliveryMethods.map((method, i) => (
                    <option key={i} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            )}
            {!isOwner && (
              <button type="submit" disabled={loading} data-testid="confirm-order-btn" className="w-full bg-[#F9842C] hover:bg-[#e06516] text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-60">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                Confirmar Pedido (Pagar con QR)
              </button>
            )}
            {isOwner && (
              <button
                type="button"
                disabled={loading}
                data-testid="ingresar-venta-realizada-btn"
                onClick={handleSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShoppingBag size={18} />}
                Ingresar Venta Realizada
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
