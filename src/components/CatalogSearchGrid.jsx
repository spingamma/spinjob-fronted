import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import CartQuantityControl from './CartQuantityControl';

export default function CatalogSearchGrid({ products, isDark, isOwner, isPremium, ordersEnabled, cart, updateCart, onToggleVisibility }) {
  if (!products || products.length === 0) {
    return (
      <div data-testid="catalog-search-empty" className="py-12 text-center text-gray-400">
        <p className="text-sm font-medium">No se encontraron productos que coincidan con tu búsqueda.</p>
      </div>
    );
  }

  return (
    <div data-testid="catalog-search-grid" className="px-4 py-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {products.map((product) => {
        const isHidden = product.is_visible === false;
        const rawMatch = (product.price || "0").replace(/[^\d.-]/g, '');
        const priceNum = parseFloat(rawMatch);

        return (
          <div
            key={product.id}
            data-testid={`catalog-search-item-${product.id}`}
            className={`flex flex-col rounded-2xl overflow-hidden border transition-all ${
              isHidden ? 'opacity-75 border-dashed border-gray-400 bg-gray-50/50' : (
                isDark
                  ? 'bg-gray-900 border-white/10 text-white'
                  : 'bg-white border-gray-200 text-primary shadow-sm'
              )
            }`}
          >
            <div className="relative w-full h-36 bg-gray-50 flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-gray-300 font-bold text-xs uppercase">Sin imagen</div>
              )}
              {isOwner && isHidden && (
                <span
                  data-testid={`badge-hidden-${product.id}`}
                  className="absolute top-2 left-2 bg-gray-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm"
                >
                  <EyeOff size={10} /> Oculto
                </span>
              )}
              {isOwner && (
                <button
                  type="button"
                  data-testid={`toggle-visibility-grid-${product.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility?.(product.id);
                  }}
                  title={product.is_visible !== false ? "Visible para clientes (Click para ocultar)" : "Oculto para clientes (Click para mostrar)"}
                  className={`absolute top-2 right-2 z-20 p-1.5 rounded-full backdrop-blur-md transition-all shadow-md active:scale-90 ${
                    product.is_visible !== false
                      ? 'bg-white/90 text-secondary hover:bg-white hover:scale-110 border border-secondary/20'
                      : 'bg-gray-900/80 text-white/70 hover:text-white hover:bg-gray-900 hover:scale-110 border border-white/20'
                  }`}
                >
                  {product.is_visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              )}
              {product.stock === 0 && (
                <span className={`absolute ${isOwner ? 'top-2 right-10' : 'top-2 right-2'} bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase`}>
                  Agotado
                </span>
              )}
            </div>

            <div className="p-3 flex flex-col justify-between flex-1">
              <div>
                <h4 className="font-bold text-sm leading-tight line-clamp-2 mb-1">{product.name}</h4>
                {product.description && (
                  <p className={`text-[11px] line-clamp-2 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {product.description}
                  </p>
                )}
              </div>

              <div className="flex items-end justify-between mt-2 pt-2 border-t border-gray-100/10">
                <span className="font-black text-sm text-secondary">
                  {product.price ? product.price : `Bs. ${(priceNum || 0).toFixed(2)}`}
                </span>

          {isPremium && ordersEnabled && product.stock !== 0 && (
            <CartQuantityControl
              product={product}
              cart={cart}
              updateCart={updateCart}
              isPremium={isPremium}
              ordersEnabled={ordersEnabled}
            />
          )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
