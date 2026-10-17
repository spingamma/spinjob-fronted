import {
  Pizza, Coffee, Soup, Flame, IceCream,
  Cookie, Salad, Globe, UtensilsCrossed
} from 'lucide-react';
import ComidaRapidaIcon from '../assets/COMIDA-RAPIDA.webp';

export const ICON_MAP = [
  { keywords: ['tarjetoso', 'servicio al cliente'], icon: '/icon-512.webp' },
  { keywords: ['rapida', 'burger', 'hamburguesa', 'alita', 'broaster', 'salchipapa', 'hot dog'], icon: ComidaRapidaIcon },
  { keywords: ['pizza', 'pasta', 'lasagna', 'calzone'], icon: Pizza },
  { keywords: ['cafe', 'cafeteria', 'brunch', 'desayuno', 'te y masita', 'masita', 'sandwich'], icon: Coffee },
  { keywords: ['tradicional', 'almuerzo', 'tipico', 'criolla', 'sopa', 'pension'], icon: Soup },
  { keywords: ['parrilla', 'carne', 'churrasqueria', 'asado', 'corte', 'brasa', 'leña'], icon: Flame },
  { keywords: ['postre', 'helado', 'heladeria', 'torta', 'pastel', 'waffle', 'crepa'], icon: IceCream },
  { keywords: ['street food', 'saltena', 'tucumana', 'chola', 'silpancho', 'callejera', 'snack'], icon: Cookie },
  { keywords: ['saludable', 'bebida', 'jugo', 'veggie', 'vegan', 'ensalada', 'bowl', 'fitness'], icon: Salad },
  { keywords: ['internacional', 'sushi', 'nikkei', 'taco', 'mexicana', 'shawarma', 'arabe', 'asiatica', 'chifa'], icon: Globe },
  { keywords: ['gastronomia', 'restaurante', 'comida', 'alimento'], icon: UtensilsCrossed },
];

export const COLOR_PALETTE = [
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

export function getCategoryConfig(categoryName, index = 0) {
  if (!categoryName) {
    return {
      IconComponent: UtensilsCrossed,
      colors: COLOR_PALETTE[0]
    };
  }

  const normalized = categoryName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (normalized === 'tarjetoso' || normalized === 'servicio al cliente') {
    return {
      IconComponent: '/icon-512.webp',
      colors: { bg: '#FFF4EC', icon: 'var(--color-secondary)' }
    };
  }

  let IconComponent = UtensilsCrossed;
  for (const entry of ICON_MAP) {
    if (entry.keywords.some(kw => normalized.includes(kw))) {
      IconComponent = entry.icon;
      break;
    }
  }

  const colors = COLOR_PALETTE[index % COLOR_PALETTE.length];
  return { IconComponent, colors };
}
