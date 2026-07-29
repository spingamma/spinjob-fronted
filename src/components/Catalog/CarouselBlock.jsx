import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { useCarouselScroll } from './hooks/useCarouselScroll';

export default function CarouselBlock({ title, products, isDark, isPremium, ordersEnabled, cart, updateCart, limitMsg }) {
  const displayProducts = products.length > 0 ? Array(20).fill(products).flat() : [];
  const [expandedProducts, setExpandedProducts] = useState({});

  const { activeIndex, containerRef, handleScroll, handleCardClick } = useCarouselScroll(products);

  const toggleExpand = (idx, e) => {
    e.stopPropagation();
    setExpandedProducts(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleProductClick = () => {
    // A pedido del usuario, no redirigir automáticamente a WhatsApp al hacer click en el producto.
  };

  return (
    <div className="w-full overflow-hidden mb-2">
      <h3 className={`text-xs font-extrabold tracking-widest mb-4 flex items-center gap-2 px-4 uppercase ${isDark ? 'text-white' : 'text-[#1A535C]'}`}>
        <span className={`w-1 h-4 rounded-full ${isDark ? 'bg-[#C8A721]' : 'bg-[#1D565F]'}`}></span>
        {title}
      </h3>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex items-center overflow-x-auto snap-x snap-mandatory hide-scroll px-[calc(50%-97.5px)] sm:px-[calc(50%-117.5px)] md:px-[calc(50%-135px)] gap-4 sm:gap-6 pb-4 pt-2 -mb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>

        {displayProducts.map((product, idx) => {
          const isActive = activeIndex === idx;

          return (
            <ProductCard
              key={`${product.id}-${idx}`}
              product={product}
              idx={idx}
              isActive={isActive}
              isDark={isDark}
              isPremium={isPremium}
              ordersEnabled={ordersEnabled}
              cart={cart}
              updateCart={updateCart}
              limitMsg={limitMsg}
              expanded={expandedProducts[idx]}
              toggleExpand={toggleExpand}
              handleCardClick={(index, active, prod) => handleCardClick(index, active, prod, handleProductClick)}
            />
          );
        })}
      </div>
    </div>
  );
}
