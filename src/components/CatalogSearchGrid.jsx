import React from 'react';
import { Plus, Minus, EyeOff } from 'lucide-react';

export default function CatalogSearchGrid({ products, isDark, isOwner, isPremium, ordersEnabled, cart, updateCart, limitMsg }) {
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
              isDark
                ? 'bg-[#1e1e1e] border-white/10 text-white'
                : 'bg-white border-gray-200 text-[#1A535C] shadow-sm'
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
              {product.stock === 0 && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
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
                <span className="font-black text-sm text-[#F9842C]">
                  {product.price ? product.price : `Bs. ${(priceNum || 0).toFixed(2)}`}
                </span>

                {isPremium && ordersEnabled && product.stock !== 0 && (
                  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 rounded-lg p-1">
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
                      {cart[product.id]?.quantity || 0}
                    </span>
                    <button
                      type="button"
                      data-testid={`search-grid-add-btn-${product.id}`}
                      onClick={() => updateCart(product, 1)}
                      disabled={
                        product.stock !== undefined &&
                        product.stock !== null &&
                        product.stock !== '' &&
                        (cart[product.id]?.quantity || 0) >= product.stock
                      }
                      className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-800 rounded shadow-sm text-[#1A535C] dark:text-white disabled:opacity-30"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
