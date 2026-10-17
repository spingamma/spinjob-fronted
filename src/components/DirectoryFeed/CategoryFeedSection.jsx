import React from 'react';
import { slugify } from '../../utils/slugs';
import { getCategoryConfig } from '../../utils/categoryIcons';
import BusinessFeedCard from './BusinessFeedCard';

export default function CategoryFeedSection({
  category,
  businesses = [],
  index = 0,
  onBusinessClick,
  onProductClick
}) {
  if (!businesses || businesses.length === 0) return null;

  const { IconComponent, colors } = getCategoryConfig(category, index);

  return (
    <section
      data-testid={`category-feed-section-${slugify(category || 'general')}`}
      className="mb-8"
    >
      {/* Cabecera de Categoría / Especialidad */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-xs"
            style={{ backgroundColor: typeof IconComponent === 'string' ? 'transparent' : colors.bg }}
          >
            {typeof IconComponent === 'string' ? (
              <img
                src={IconComponent}
                alt={category}
                className="w-full h-full object-contain"
              />
            ) : (
              <IconComponent
                size={22}
                style={{ color: colors.icon }}
                strokeWidth={2}
              />
            )}
          </div>

          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-black text-primary uppercase tracking-wide">
              {category}
            </h2>
            <p className="text-[11px] text-gray-400 font-medium">
              {businesses.length === 1 ? '1 negocio disponible' : `${businesses.length} negocios disponibles`}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de tarjetas con carrusel de cada negocio */}
      <div className="flex flex-col">
        {businesses.map((biz) => (
          <BusinessFeedCard
            key={biz.slug}
            business={biz}
            onBusinessClick={onBusinessClick}
            onProductClick={onProductClick}
          />
        ))}
      </div>
    </section>
  );
}
