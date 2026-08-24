// src/components/OrderSummary/CheckoutSection.jsx
import React from 'react';
import { Send, ShoppingBag, ArrowLeft, Store } from 'lucide-react';
import { useCheckout } from './hooks/useCheckout';

export default function CheckoutSection({
  isOwner,
  deliveryMethods,
  cart,
  navigate,
  slug,
  fetchedQrImage
}) {
  const {
    customerName,
    setCustomerName,
    selectedDeliveryMethodRaw,
    setSelectedDeliveryMethodRaw,
    presencialPayment,
    setPresencialPayment,
    loading,
    liveDeliveryMethods,
    isPaqueteriaSelected,
    pickupFee,
    itemsList,
    totalPrice,
    handleSubmit
  } = useCheckout({
    isOwner,
    deliveryMethods,
    cart,
    navigate,
    slug,
    fetchedQrImage
  });

  return (
    <div className="min-h-screen bg-brand-bg pb-24 font-sans text-primary">
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
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Para: {slug}</h2>
          <div className="space-y-4">
            {itemsList.map((item, idx) => {
              const rawMatch = (item.product.price || '0').replace(/[^\d.-]/g, '');
              const priceNum = parseFloat(rawMatch);
              const validPrice = isNaN(priceNum) ? 0 : priceNum;
              return (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} x Bs. {validPrice.toFixed(2)}</p>
                  </div>
                  <p className="font-black">Bs. {(item.quantity * validPrice).toFixed(2)}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
            {isPaqueteriaSelected && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium text-sm">Total QR (Productos)</span>
                  <span className="font-bold text-gray-700">Bs. {(totalPrice ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-red-500">
                  <span className="font-medium text-sm">A Pagar en Efectivo (Recojo)</span>
                  <span className="font-bold">Bs. {pickupFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-500 font-bold">Costo Total</span>
                  <span className="text-xl font-black text-secondary">Bs. {(totalPrice + pickupFee).toFixed(2)}</span>
                </div>
              </>
            )}
            {!isPaqueteriaSelected && (
              <div className="flex justify-between items-end">
                <span className="text-gray-500 font-bold">Total a pagar</span>
                <span className="text-2xl font-black text-secondary">Bs. {(totalPrice ?? 0).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-primary mb-4 border-b pb-2">Detalles del {isOwner ? 'Cliente' : 'Pedido'}</h2>
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
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-secondary focus:ring-4 focus:ring-orange-50 transition-all outline-none font-bold"
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
                <select value={selectedDeliveryMethodRaw} onChange={e => setSelectedDeliveryMethodRaw(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 font-bold text-gray-700 outline-none" data-testid="delivery-method-select">
                  {liveDeliveryMethods.map((method, i) => (
                    <option key={i} value={method}>
                      {typeof method === 'string' && method.startsWith('PAQUETERIA|') 
                        ? `📦 Paquetería: ${method.split('|')[2]} (Recojo: ${method.split('|')[3]} Bs)`
                        : method}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {!isOwner && (
              <button type="submit" disabled={loading} data-testid="confirm-order-btn" className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-60">
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
