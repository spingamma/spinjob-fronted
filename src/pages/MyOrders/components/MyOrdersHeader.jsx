import React from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function MyOrdersHeader({ navigate }) {
  return (
    <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm border-b border-gray-100 flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} data-testid="my-orders-back-btn" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-primary cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="bg-secondary/10 p-2 rounded-xl">
            <ShoppingBag size={20} className="text-secondary" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight">Mis Pedidos</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
