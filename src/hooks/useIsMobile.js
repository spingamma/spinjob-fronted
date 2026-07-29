// Archivo: src/hooks/useIsMobile.js
// Hook centralizado para detectar si el dispositivo es móvil.
// Reemplaza el uso directo de window.innerWidth < 768 en 4+ páginas.

import { useState, useEffect } from 'react';

/**
 * @param {number} breakpoint - Ancho en px bajo el cual se considera móvil (default: 768)
 * @returns {boolean}
 */
export default function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);

  return isMobile;
}
