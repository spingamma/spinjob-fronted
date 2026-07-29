import React from 'react';
import miCarrito from '../../assets/oso-carrito.webp';

export default function FloatingOrderButton({ isPremium, ordersEnabled, totalItems, totalPrice, isOwner, handleOrder }) {
  if (!isPremium || !ordersEnabled || totalItems <= 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-0 right-0 px-4 z-[90] flex justify-center animate-in slide-in-from-bottom-10">
      <button
        data-testid="order-checkout-btn"
        onClick={handleOrder}
        className="w-full max-w-sm bg-[#F9842C] hover:bg-[#e06516] text-white font-bold py-4 px-6 rounded-2xl shadow-xl flex items-center justify-between transition-all transform hover:scale-[1.02]"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <img src={miCarrito} alt="Carrito" className="w-7 h-7 object-contain drop-shadow-md" />
          </div>
          <span className="text-lg">{isOwner ? 'Ingresar Venta' : 'Ordenar'} ({totalItems})</span>
        </div>
        <span className="text-lg">Bs. {totalPrice.toFixed(2)}</span>
      </button>
    </div>
  );
}
