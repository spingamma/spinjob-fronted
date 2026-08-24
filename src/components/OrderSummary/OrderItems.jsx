// src/components/OrderSummary/OrderItems.jsx

import React from "react";
import { CheckCircle2 } from "lucide-react";

/**
 * Renders the list of items in the cart and the total price.
 */
export const OrderItems = ({ itemsList, totalPrice }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">
      Para: {/* Business name is rendered by the parent */}
    </h2>
    <div className="space-y-4">
      {itemsList.map((item, idx) => {
        const rawMatch = (item.product.price || "0").replace(/[^\d.-]/g, "");
        const priceNum = parseFloat(rawMatch);
        const validPrice = isNaN(priceNum) ? 0 : priceNum;
        return (
          <div key={idx} className="flex justify-between items-center">
            <div className="flex-1 pr-4">
              <p className="font-bold text-sm">{item.product.name}</p>
              <p className="text-xs text-gray-500">
                {item.quantity} x Bs. {validPrice.toFixed(2)}
              </p>
            </div>
            <p className="font-black">Bs. {(item.quantity * validPrice).toFixed(2)}</p>
          </div>
        );
      })}
    </div>
    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-end">
      <span className="text-gray-500 font-bold">Total a pagar</span>
      <span className="text-2xl font-black text-secondary">Bs. {totalPrice.toFixed(2)}</span>
    </div>
  </div>
);
