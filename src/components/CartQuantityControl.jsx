import React from 'react';
import { Plus, Minus } from 'lucide-react';

/**
 * CartQuantityControl renders the +/- buttons and quantity display for a product.
 *
 * Props:
 * - product: the product object (must contain id and stock)
 * - cart: current cart state mapping product IDs to { quantity }
 * - updateCart: (product, delta) => void handler to modify cart
 * - isPremium: boolean flag indicating premium user
 * - ordersEnabled: boolean flag indicating ordering is enabled
 */
export default function CartQuantityControl({ product, cart, updateCart }) {
  const quantity = cart[product.id]?.quantity || 0;
  const isDisabled =
    product.stock !== undefined &&
    product.stock !== null &&
    product.stock !== '' &&
    quantity >= product.stock;

  return (
    <div
      data-testid={`cart-quantity-control-${product.id}`}
      className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 rounded-lg p-1"
    >
      <button
        type="button"
        data-testid={`search-grid-remove-btn-${product.id}`}
        onClick={() => updateCart(product, -1)}
        className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-800 rounded shadow-sm text-gray-600 dark:text-gray-200"
      >
        <Minus size={12} />
      </button>
      <span
        data-testid={`search-grid-cart-qty-${product.id}`}
        className="font-bold text-xs min-w-[1rem] text-center"
      >
        {quantity}
      </span>
      <button
        type="button"
        data-testid={`search-grid-add-btn-${product.id}`}
        onClick={() => updateCart(product, 1)}
        disabled={isDisabled}
        className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-800 rounded shadow-sm text-[#1A535C] dark:text-white disabled:opacity-30"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
