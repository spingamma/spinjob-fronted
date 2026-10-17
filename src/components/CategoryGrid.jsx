import { useMemo } from 'react';
import { slugify } from '../utils/slugs';
import { getCategoryConfig } from '../utils/categoryIcons';

export default function CategoryGrid({ categories, onSelectCategory, adminBusiness }) {
  const allCategories = useMemo(() => {
    const list = (categories || []).filter(
      c => c.category?.toLowerCase() !== 'tarjetoso' && c.category?.toLowerCase() !== 'servicio al cliente'
    );
    const adminItem = {
      category: adminBusiness?.name || 'Tarjetoso',
      subtitle: adminBusiness?.title || 'Servicio al cliente',
      isAdmin: true,
      slug: adminBusiness?.slug || 'spingamma',
      image: adminBusiness?.image || '/icon-512.webp'
    };
    return [adminItem, ...list];
  }, [categories, adminBusiness]);

  if (!allCategories || allCategories.length === 0) return null;

  return (
    <section id="categories-section" data-testid="category-grid" className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {allCategories.map((cat, index) => {
          const isTarjetoso = cat.isAdmin || cat.category?.toLowerCase() === 'tarjetoso';
          const { IconComponent, colors } = getCategoryConfig(cat.category, index);

          if (isTarjetoso) {
            return (
              <button
                key="Tarjetoso"
                data-testid="category-card-tarjetoso"
                onClick={() => onSelectCategory('Tarjetoso', cat.slug)}
                className="group flex flex-col items-center text-center bg-primary rounded-2xl border border-primary shadow-sm hover:shadow-lg transition-all duration-300 p-4 py-6 hover:scale-[1.02] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-secondary/40 active:scale-[0.98] cursor-pointer"
              >
                {/* Icon Container without colored margins */}
                <div className="w-[64px] h-[64px] md:w-[74px] md:h-[74px] rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 overflow-hidden bg-transparent">
                  <img
                    src={cat.image || "/icon-512.webp"}
                    alt={cat.category}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Category Name */}
                <h4 className="text-xs sm:text-sm font-bold text-white mb-1 leading-tight min-w-0 w-full whitespace-normal">
                  {cat.category}
                </h4>

                {/* Subtitle */}
                <p className="text-[11px] text-white/90 font-medium tracking-wide">
                  {cat.subtitle || 'Servicio al cliente'}
                </p>
              </button>
            );
          }

          return (
            <button
              key={cat.category}
              data-testid={`category-card-${slugify(cat.category)}`}
              onClick={() => onSelectCategory(cat.category)}
              className="group flex flex-col items-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-4 py-6 hover:scale-[1.02] hover:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/20 active:scale-[0.98] cursor-pointer"
            >
              {/* Icon Container without colored margins */}
              <div
                className="w-[64px] h-[64px] md:w-[74px] md:h-[74px] rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 overflow-hidden"
                style={{ backgroundColor: typeof IconComponent === 'string' ? 'transparent' : colors.bg }}
              >
                {typeof IconComponent === 'string' ? (
                  <img
                    src={IconComponent}
                    alt={cat.category}
                    className="w-full h-full object-contain rounded-2xl"
                  />
                ) : (
                  <IconComponent
                    size={32}
                    style={{ color: colors.icon }}
                    strokeWidth={1.8}
                  />
                )}
              </div>

              {/* Category Name */}
              <h4 className="text-xs sm:text-sm font-bold text-primary mb-1 leading-tight min-w-0 w-full whitespace-normal">
                {cat.category}
              </h4>

              {/* Count */}
              {(cat.count ?? 0) > 0 && (
                <p className="text-[11px] text-gray-400 font-medium">
                  {cat.count === 1 ? '1 negocio' : `${cat.count} negocios`}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
