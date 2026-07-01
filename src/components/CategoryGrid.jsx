// Archivo: src/components/CategoryGrid.jsx
import {
  ShoppingBag, HeartPulse, Wrench, Building2, UtensilsCrossed,
  Sofa, BarChart3, Briefcase, Palette, Monitor, Car, Cpu,
  GraduationCap, Scale, Camera, Scissors, Music, Dumbbell,
  Leaf, PawPrint, Plane, Sparkles, LayoutGrid, Coffee,
  Users, Shirt, BookOpen, Hammer, Paintbrush
} from 'lucide-react';
import { slugify } from '../utils/slugs';

// --- Icon Mapping (keyword → Lucide icon) ---
const ICON_MAP = [
  { keywords: ['comercio', 'retail', 'tienda', 'venta'], icon: ShoppingBag },
  { keywords: ['salud', 'medicina', 'medic', 'doctor', 'clinic', 'farma'], icon: HeartPulse },
  { keywords: ['mantenimiento', 'reparacion', 'plomero', 'electric'], icon: Wrench },
  { keywords: ['inmobiliaria', 'bienes raices', 'propiedad'], icon: Building2 },
  { keywords: ['gastronomia', 'cafeteria', 'restaurante', 'comida', 'alimento'], icon: UtensilsCrossed },
  { keywords: ['hogar', 'casa', 'mueble', 'decoracion'], icon: Sofa },
  { keywords: ['data', 'ciencia de datos', 'analisis'], icon: BarChart3 },
  { keywords: ['servicios profesionales', 'consultoria', 'asesoria'], icon: Briefcase },
  { keywords: ['cultural', 'familiar', 'arte', 'evento'], icon: Palette },
  { keywords: ['tecnologia', 'digital', 'software', 'programacion', 'ti ', 'sistemas'], icon: Monitor },
  { keywords: ['transporte', 'movilidad', 'logistica', 'envio'], icon: Car },
  { keywords: ['educacion', 'capacitacion', 'formacion', 'academia', 'colegio'], icon: GraduationCap },
  { keywords: ['legal', 'abogado', 'juridico', 'derecho'], icon: Scale },
  { keywords: ['fotografia', 'video', 'audiovisual', 'produccion'], icon: Camera },
  { keywords: ['belleza', 'estetica', 'peluqueria', 'spa', 'cosmetica'], icon: Scissors },
  { keywords: ['musica', 'entretenimiento', 'espectaculo', 'dj'], icon: Music },
  { keywords: ['deporte', 'fitness', 'gym', 'entrenamiento'], icon: Dumbbell },
  { keywords: ['ecologia', 'ambiente', 'natural', 'organico', 'agro'], icon: Leaf },
  { keywords: ['mascota', 'veterinaria', 'animal', 'pet'], icon: PawPrint },
  { keywords: ['turismo', 'viaje', 'tour', 'hotel', 'hospedaje'], icon: Plane },
  { keywords: ['moda', 'ropa', 'textil', 'confeccion'], icon: Shirt },
  { keywords: ['construccion', 'arquitectura', 'ingenier', 'obra'], icon: Hammer },
  { keywords: ['diseño', 'creativo', 'publicidad', 'marketing'], icon: Paintbrush },
];

// --- Color Palette (rotating backgrounds) ---
const COLOR_PALETTE = [
  { bg: '#E0F2F1', icon: '#00897B' },  // Teal
  { bg: '#FFF3E0', icon: '#E65100' },  // Orange
  { bg: '#F3E5F5', icon: '#7B1FA2' },  // Purple
  { bg: '#E8F5E9', icon: '#2E7D32' },  // Green
  { bg: '#E3F2FD', icon: '#1565C0' },  // Blue
  { bg: '#FCE4EC', icon: '#C62828' },  // Rose
  { bg: '#FFF8E1', icon: '#F57F17' },  // Amber
  { bg: '#E0F7FA', icon: '#00838F' },  // Cyan
  { bg: '#EDE7F6', icon: '#4527A0' },  // Deep Purple
  { bg: '#F1F8E9', icon: '#558B2F' },  // Light Green
  { bg: '#FBE9E7', icon: '#BF360C' },  // Deep Orange
  { bg: '#E8EAF6', icon: '#283593' },  // Indigo
];

/**
 * Resolves icon + color for a category name using keyword matching.
 */
function getCategoryConfig(categoryName, index) {
  const normalized = categoryName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  let IconComponent = LayoutGrid; // fallback
  for (const entry of ICON_MAP) {
    if (entry.keywords.some(kw => normalized.includes(kw))) {
      IconComponent = entry.icon;
      break;
    }
  }

  const colors = COLOR_PALETTE[index % COLOR_PALETTE.length];
  return { IconComponent, colors };
}

export default function CategoryGrid({ categories, onSelectCategory }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section data-testid="category-grid" className="mb-8">
      <div className="flex justify-between items-end mb-5">
        <h3 className="text-lg font-bold text-[#6A431F]">
          Qué visitaremos hoy?
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {categories.map((cat, index) => {
          const { IconComponent, colors } = getCategoryConfig(cat.category, index);
          return (
            <button
              key={cat.category}
              data-testid={`category-card-${slugify(cat.category)}`}
              onClick={() => onSelectCategory(cat.category)}
              className="group flex flex-col items-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-4 py-6 hover:scale-[1.02] hover:border-[#6A431F]/30 focus:outline-none focus:ring-2 focus:ring-[#6A431F]/20 active:scale-[0.98] cursor-pointer"
            >
              {/* Colored Icon Circle */}
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: colors.bg }}
              >
                <IconComponent
                  size={28}
                  style={{ color: colors.icon }}
                  strokeWidth={1.8}
                />
              </div>

              {/* Category Name */}
              <h4 className="text-xs sm:text-sm font-bold text-[#1A535C] mb-1 leading-tight min-w-0 w-full truncate">
                {cat.category}
              </h4>

              {/* Count */}
              {(cat.count ?? 0) > 0 && (
                <p className="text-[11px] text-gray-400 font-medium">
                  {cat.count} profesionales
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
