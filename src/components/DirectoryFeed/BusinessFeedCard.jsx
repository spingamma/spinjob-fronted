import React, { useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle2, Utensils, ArrowRight } from 'lucide-react';
import FeedProductCard from './FeedProductCard';
import WoodenClosedSign from '../WoodenClosedSign';

export default function BusinessFeedCard({ business, onBusinessClick, onProductClick }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCardHeaderClick = () => {
    if (onBusinessClick) {
      onBusinessClick(business.slug);
    }
  };

  const products = business.products || [];

  return (
    <article
      data-testid={`business-feed-card-${business.slug}`}
      className={`bg-white rounded-3xl border border-gray-100/80 shadow-xs hover:shadow-md transition-all duration-300 p-4 sm:p-5 mb-5 ${
        business.is_open === false ? 'opacity-90' : ''
      }`}
    >
      {/* Cabecera del negocio */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div
          onClick={handleCardHeaderClick}
          className="flex items-center gap-3 min-w-0 cursor-pointer group"
        >
          {/* Logo circular */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50 shadow-xs">
            <img
              src={business.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&background=F8F9FA&color=1E3D51&size=200`}
              alt={`Logo de ${business.name}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&background=F8F9FA&color=1E3D51&size=200`;
              }}
            />
            {business.premium && (
              <div className="absolute top-1 left-1 bg-white/95 rounded-full p-0.5 shadow-xs" title="Verificado">
                <CheckCircle2 size={12} className="text-secondary" />
              </div>
            )}
          </div>

          {/* Nombre y metadatos */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-primary truncate group-hover:text-secondary transition-colors">
                {business.name}
              </h3>
              {business.is_open === false && (
                <div data-testid={`feed-closed-badge-${business.slug}`} className="inline-block scale-85 origin-left">
                  <WoodenClosedSign compact />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
              {business.rating > 0 && (
                <span className="flex items-center gap-1 font-bold text-gray-800">
                  <Star size={13} className="fill-secondary text-secondary" />
                  {business.rating}
                  {business.reviews_count > 0 && (
                    <span className="text-[11px] text-gray-400 font-normal">({business.reviews_count})</span>
                  )}
                </span>
              )}

              {business.home_delivery && (
                <span className="text-[11px] font-semibold text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                  📦 Delivery
                </span>
              )}

              {business.national_delivery && (
                <span className="text-[11px] font-semibold text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                  ✈️ Nacional
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botón visitar perfil */}
        <button
          type="button"
          data-testid={`visit-business-btn-${business.slug}`}
          onClick={handleCardHeaderClick}
          className="shrink-0 text-xs font-bold text-secondary bg-secondary/10 hover:bg-secondary hover:text-white px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>Ver Menú</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Carrusel de Productos */}
      {products.length > 0 ? (
        <div className="relative group/carousel -mx-1 sm:mx-0">
          {/* Botones de navegación en desktop */}
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Desplazar a la izquierda"
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-white/95 border border-gray-200 text-primary shadow-md items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:scale-110 transition-all cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Desplazar a la derecha"
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-white/95 border border-gray-200 text-primary shadow-md items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:scale-110 transition-all cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>

          {/* Contenedor del carrusel */}
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-3 overflow-x-auto snap-x snap-mandatory py-1 px-1 scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <FeedProductCard
                key={product.id}
                product={product}
                businessSlug={business.slug}
                onProductClick={onProductClick}
              />
            ))}
          </div>
        </div>
      ) : (
        <div
          onClick={handleCardHeaderClick}
          className="bg-brand-bg/50 border border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:bg-brand-bg transition-colors flex items-center justify-center gap-2"
        >
          <Utensils size={16} className="text-secondary/70" />
          <span className="text-xs font-semibold text-gray-500">
            Explora las opciones y platos completos en el perfil del negocio
          </span>
        </div>
      )}
    </article>
  );
}
