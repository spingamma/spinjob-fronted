import { useState } from 'react';

export function useCart() {
  const [cart, setCart] = useState({});
  const [limitMsg, setLimitMsg] = useState(null);

  const updateCart = (product, delta) => {
    let limitReached = false;
    setCart(prev => {
      const current = prev[product.id]?.quantity || 0;
      const newQuantity = current + delta;

      if (delta > 0 && product.stock !== undefined && product.stock !== null && product.stock !== '') {
        if (newQuantity > product.stock) {
          limitReached = true;
          return prev;
        }
      }

      if (newQuantity <= 0) {
        const newCart = { ...prev };
        delete newCart[product.id];
        return newCart;
      }
      return {
        ...prev,
        [product.id]: { product, quantity: newQuantity }
      };
    });

    if (limitReached) {
      setLimitMsg(product.id);
      setTimeout(() => setLimitMsg(null), 2000);
    }
  };

  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Object.values(cart).reduce((sum, item) => {
    // try to parse price as float. e.g., "Bs. 120" -> 120
    const priceNum = parseFloat((item.product.price || "0").replace(/[^\d.-]/g, ''));
    return sum + (priceNum || 0) * item.quantity;
  }, 0);

  return {
    cart,
    setCart,
    limitMsg,
    updateCart,
    totalItems,
    totalPrice
  };
}
