import { useMemo } from 'react';
import {
  Sandwich, Pizza, Coffee, Soup, Flame, IceCream,
  Cookie, Salad, Globe, UtensilsCrossed, LayoutGrid
} from 'lucide-react';
import { slugify } from '../utils/slugs';
import ComidaIcon from '../assets/COMIDA.webp';

// --- Icon Mapping para las 9 categorías gastronómicas oficiales ---
const ICON_MAP = [
  { keywords: ['tarjetoso'], icon: '/icon-192.webp' },
  { keywords: ['rapida', 'burger', 'hamburguesa', 'alita', 'broaster', 'salchipapa', 'hot dog'], icon: Sandwich },
  { keywords: ['pizza', 'pasta', 'lasagna', 'calzone'], icon: Pizza },
  { keywords: ['cafe', 'cafeteria', 'brunch', 'desayuno', 'te y masita', 'masita', 'sandwich'], icon: Coffee },
  { keywords: ['tradicional', 'almuerzo', 'tipico', 'criolla', 'sopa', 'pension'], icon: Soup },
  { keywords: ['parrilla', 'carne', 'churrasqueria', 'asado', 'corte', 'brasa', 'leña'], icon: Flame },
  { keywords: ['postre', 'helado', 'heladeria', 'torta', 'pastel', 'waffle', 'crepa'], icon: IceCream },
  { keywords: ['street food', 'saltena', 'tucumana', 'chola', 'silpancho', 'callejera', 'snack'], icon: Cookie },
  { keywords: ['saludable', 'bebida', 'jugo', 'veggie', 'vegan', 'ensalada', 'bowl', 'fitness'], icon: Salad },
  { keywords: ['internacional', 'sushi', 'nikkei', 'taco', 'mexicana', 'shawarma', 'arabe', 'asiatica', 'chifa'], icon: Globe },
  { keywords: ['gastronomia', 'restaurante', 'comida', 'alimento'], icon: ComidaIcon },
];

// --- Gastronomy Color Palette (tonos cálidos, apetecibles y modernos) ---
const COLOR_PALETTE = [
  { bg: '#FFF4EC', icon: 'var(--color-secondary)' },  // Warm Peach / Secondary
  { bg: '#FFF0F0', icon: '#E03131' },  // Pizza / Coral Red
  { bg: '#FFF9DB', icon: '#E67700' },  // Warm Amber / Mustard
  { bg: '#F4ECE4', icon: '#795548' },  // Coffee / Espresso Brown
  { bg: '#F8F9FA', icon: '#D9480F' },  // Flame / Terracotta
  { bg: '#FFF0F6', icon: '#D6336C' },  // Sweet Berry / Postres
  { bg: '#EBFBEE', icon: '#2B8A3E' },  // Fresh Mint / Veggie Green
  { bg: '#E3FAFC', icon: '#0C8599' },  // International Ocean Teal
  { bg: '#FFF3BF', icon: '#F59F00' },  // Golden Crust
];

/**
 * Resolves icon + color for a category name using keyword matching.
 */
function getCategoryConfig(categoryName, index) {
  const normalized = categoryName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (normalized === 'tarjetoso') {
    return {
      IconComponent: '/icon-192.webp',
      colors: { bg: '#FFF4EC', icon: 'var(--color-secondary)' }
    };
  }

  let IconComponent = UtensilsCrossed; // fallback gastronómico
  for (const entry of ICON_MAP) {
    if (entry.keywords.some(kw => normalized.includes(kw))) {
      IconComponent = entry.icon;
      break;
    }
  }

  const colors = COLOR_PALETTE[index % COLOR_PALETTE.length];
  return { IconComponent, colors };
}

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
      image: adminBusiness?.image || '/icon-192.webp'
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
                    src={cat.image || "/icon-192.webp"}
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
                    className="w-full h-full object-cover rounded-2xl"
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
