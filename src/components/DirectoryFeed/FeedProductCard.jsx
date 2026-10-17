import React from 'react';

export default function FeedProductCard({ product, businessSlug, onProductClick }) {
  const handleClick = (e) => {
    e.preventDefault();
    if (onProductClick) {
      onProductClick(product, businessSlug);
    }
  };

  return (
    <div
      data-testid={`feed-product-card-${product.id}`}
      onClick={handleClick}
      className="group shrink-0 w-[160px] sm:w-[190px] md:w-[210px] bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]"
    >
      {/* Imagen del producto */}
      <div className="relative aspect-4/3 w-full bg-gray-50 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=F4ECE4&color=1E3D51&size=200`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Sin foto
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-xs">
            Agotado
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-primary line-clamp-1 leading-snug group-hover:text-secondary transition-colors" title={product.name}>
            {product.name}
          </h4>
          {product.description && (
            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5" title={product.description}>
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-gray-50">
          <span className="text-xs sm:text-sm font-black text-primary">
            {product.price || '-'}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-secondary group-hover:underline">
            Pedir →
          </span>
        </div>
      </div>
    </div>
  );
}
