import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { goBack } from '../../utils/navigation';

/**
 * Header component for the checkout view.
 * Shows a back button and a title that depends on ownership.
 */
export const OrderHeader = ({ isOwner, navigate }) => (
  <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
    <button
      onClick={() => goBack(navigate)}
      data-testid="order-header-back-btn"
      className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
    >
      <ArrowLeft size={20} />
    </button>
    <h1 className="text-lg font-extrabold tracking-tight">
      {isOwner ? 'Registrar Venta Presencial' : 'Tu Pedido'}
    </h1>
  </div>
);
