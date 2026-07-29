import React from 'react';
import { Plus, Minus } from 'lucide-react';

export default function ProductCard({
  product,
  idx,
  isActive,
  isDark,
  isPremium,
  ordersEnabled,
  cart,
  updateCart,
  limitMsg,
  expanded,
  toggleExpand,
  handleCardClick
}) {
  return (
    <div
      data-product-idx={idx}
      className={`snap-center shrink-0 h-fit w-[195px] sm:w-[235px] md:w-[270px] transition-all duration-300 ease-out flex flex-col rounded-[1.25rem] overflow-hidden border cursor-pointer ${
        isActive
          ? (isDark ? 'bg-[#1e1e1e] border-white/10 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] scale-100 z-10' : 'bg-white border-transparent shadow-[0_15px_30px_-10px_rgba(30,61,81,0.15)] scale-100 z-10')
          : (isDark ? 'bg-[#1e1e1e]/50 border-white/5 scale-90 opacity-100 z-0' : 'bg-white border-gray-200 scale-90 opacity-100 z-0 hover:bg-gray-50')
      }`}
      onClick={() => handleCardClick(idx, isActive, product)}
    >
      {/* Imagen/Icono en la parte superior */}
      {product.image_url && (
        <div className="relative w-full flex flex-col justify-start">
          <img src={product.image_url} alt={product.name} className="w-full h-auto max-h-[240px] sm:max-h-[280px] md:max-h-[320px] object-contain transition-transform duration-500 hover:scale-105 drop-shadow-sm" />
        </div>
      )}

      {/* Info inferior con fondo blanco/oscuro */}
      <div className="flex flex-col p-4 sm:p-5 pt-3 sm:pt-4 w-full text-left flex-1 justify-between">
        <div>
          <h4 className={`font-bold text-sm sm:text-base leading-tight mb-1.5 line-clamp-2 ${isDark ? 'text-white' : 'text-[#1A535C]'}`}>
            {product.name}
          </h4>
          {product.description && (
            <div className="mb-1">
              <p className={`text-[11px] sm:text-xs whitespace-pre-wrap ${expanded ? '' : 'line-clamp-2'} ${isDark ? 'text-gray-400' : 'text-[#757778]'}`}>
                {product.description}
              </p>
              {product.description.length > 60 && (
                <button
                  onClick={(e) => toggleExpand(idx, e)}
                  className={`text-[10px] font-bold mt-1 cursor-pointer hover:underline block ${isDark ? 'text-[#C8A721]' : 'text-[#F9842C]'}`}
                >
                  {expanded ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between mt-1">
          {product.price ? (
            <p className={`font-black text-base sm:text-lg ${isDark ? 'text-[#C8A721]' : 'text-[#1A535C]'}`}>
              {product.price}
            </p>
          ) : (
            <p className="font-bold text-base sm:text-lg text-transparent select-none">-</p>
          )}

          {isPremium && ordersEnabled && (
            product.stock === 0 ? (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-lg p-1.5 px-3">
                <span className="font-bold text-xs uppercase tracking-wider">Agotado</span>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 bg-gray-100 rounded-lg p-1"
                onClick={(e) => e.stopPropagation()} // Prevent carousel item click
              >
                <button
                  onClick={() => updateCart(product, -1)}
                  data-testid={`remove-from-cart-btn-${product.id}`}
                  className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-red-500"
                >
                  <Minus size={14} />
                </button>
                <span data-testid={`cart-quantity-${product.id}`} className="font-bold text-sm min-w-[1.2rem] text-center text-[#1A535C]">
                  {cart[product.id]?.quantity || 0}
                </span>
                <div className="relative">
                  <button
                    onClick={() => updateCart(product, 1)}
                    data-testid={`add-to-cart-btn-${product.id}`}
                    className={`w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm transition-colors ${
                      product.stock !== undefined && product.stock !== null && product.stock !== '' && (cart[product.id]?.quantity || 0) >= product.stock
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-[#1A535C] hover:text-[#F9842C]'
                    }`}
                  >
                    <Plus size={14} />
                  </button>
                  {limitMsg === product.id && (
                    <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] font-bold rounded shadow-md whitespace-nowrap z-50">
                      Stock máximo
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
