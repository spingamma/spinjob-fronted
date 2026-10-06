import React from 'react';
import { Plus, Minus, Eye, EyeOff } from 'lucide-react';

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
  handleCardClick,
  isOwner,
  onToggleVisibility
}) {
  return (
    <div
      data-product-idx={idx}
      className={`snap-center shrink-0 h-fit w-[195px] sm:w-[235px] md:w-[270px] transition-all duration-300 ease-out flex flex-col rounded-[1.25rem] overflow-hidden border cursor-pointer ${isActive
          ? (isDark ? 'bg-gray-900 border-white/10 shadow-[0_15px_30px_-10px] shadow-black/50 scale-100 z-10' : 'bg-white border-transparent shadow-[0_15px_30px_-10px] shadow-primary/15 scale-100 z-10')
          : (isDark ? 'bg-gray-900/50 border-white/5 scale-90 opacity-100 z-0' : 'bg-white border-gray-200 scale-90 opacity-100 z-0 hover:bg-gray-50')
        }`}
      onClick={() => handleCardClick(idx, isActive, product)}
    >
      {/* Imagen/Icono en la parte superior */}
      {(product.image_url || isOwner) && (
        <div className="relative w-full flex flex-col justify-start">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-auto max-h-[240px] sm:max-h-[280px] md:max-h-[320px] object-contain transition-transform duration-500 hover:scale-105 drop-shadow-sm" />
          ) : (
            <div className="w-full h-24 bg-gray-50 flex items-center justify-center text-gray-300 font-bold text-xs uppercase">
              Sin imagen
            </div>
          )}
          {isOwner && (
            <button
              type="button"
              data-testid={`toggle-visibility-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility?.(product.id);
              }}
              title={product.is_visible !== false ? "Visible para clientes (Click para ocultar)" : "Oculto para clientes (Click para mostrar)"}
              className={`absolute top-2 right-2 z-20 p-2 rounded-full backdrop-blur-md transition-all shadow-md active:scale-90 ${
                product.is_visible !== false
                  ? 'bg-white/90 text-secondary hover:bg-white hover:scale-110 border border-secondary/20'
                  : 'bg-gray-900/80 text-white/70 hover:text-white hover:bg-gray-900 hover:scale-110 border border-white/20'
              }`}
            >
              {product.is_visible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          )}
          {isOwner && product.is_visible === false && (
            <span
              data-testid={`badge-hidden-${product.id}`}
              className="absolute top-2 left-2 z-20 bg-gray-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm"
            >
              <EyeOff size={10} /> Oculto
            </span>
          )}
        </div>
      )}

      {/* Info inferior con fondo blanco/oscuro */}
      <div className="flex flex-col p-4 sm:p-5 pt-3 sm:pt-4 w-full text-left flex-1 justify-between">
        <div>
          <h4 className={`font-bold text-sm sm:text-base leading-tight mb-1.5 line-clamp-2 ${isDark ? 'text-white' : 'text-primary'}`}>
            {product.name}
          </h4>
          {product.description && (
            <div className="mb-1">
              <p className={`text-[11px] sm:text-xs whitespace-pre-wrap ${expanded ? '' : 'line-clamp-2'} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {product.description}
              </p>
              {product.description.length > 60 && (
                <button
                  onClick={(e) => toggleExpand(idx, e)}
                  className={`text-[10px] font-bold mt-1 cursor-pointer hover:underline block ${isDark ? 'text-yellow-500' : 'text-secondary'}`}
                >
                  {expanded ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between mt-1">
          {product.price ? (
            <p className={`font-black text-base sm:text-lg ${isDark ? 'text-yellow-500' : 'text-primary'}`}>
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
                <span data-testid={`cart-quantity-${product.id}`} className="font-bold text-sm min-w-[1.2rem] text-center text-primary">
                  {cart[product.id]?.quantity || 0}
                </span>
                <div className="relative">
                  <button
                    onClick={() => updateCart(product, 1)}
                    data-testid={`add-to-cart-btn-${product.id}`}
                    className={`w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm transition-colors ${product.stock !== undefined && product.stock !== null && product.stock !== '' && (cart[product.id]?.quantity || 0) >= product.stock
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-primary hover:text-secondary'
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
