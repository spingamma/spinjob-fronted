# Estándares de Diseño UI/UX y Branding (Tarjetoso)

## Branding y Estética
1. **Paleta Premium:** Usa la paleta de Tarjetoso: `#1E3D51` (Primario) y `#B95221` (Acento) siempre. Nunca preguntes colores.
2. **Tailwind 4 & Glassmorphism:** Usa `bg-white/10 backdrop-blur-md border border-white/20`, gradientes (`from-[#1E3D51] to-[#B95221]`) y animaciones (`transition-all duration-300 ease-out hover:scale-[1.02]`).
3. **Nombre de marca:** Tarjetoso (NUNCA usar "SpinJob" en textos visibles al usuario).
4. **Imágenes:** SIEMPRE usar `onError` con fallback a `ui-avatars.com`. Toda subida de imagen debe pasar por `CropModal` (`cropShape="rect"` para productos, `"round"` para avatares).

## Mobile-First Responsivo
5. **NUNCA usar hover para acciones críticas:** En móvil no existe hover. Acciones deben ser siempre visibles.
6. **Grids en móvil:** Usar `grid-cols-1` en móvil, `sm:grid-cols-2`, `md:grid-cols-3`. NUNCA empezar con 2 en móvil.
7. **Prevenir Overflow:** Usa `w-full` y `overflow-hidden` o `min-w-0` en contenedores anidados dentro de flex/grid.
8. **Textareas:** Usar auto-grow con `useRef` + `useEffect` y contador visual.

## z-index Hierarchy
9. **Escala obligatoria:**
    - `z-40` → `BottomNavbar` (navegación inferior móvil)
    - `z-50` → Dropdowns, tooltips, barras flotantes
    - `z-[100]` → Modales principales
    - `z-[999]` → Modales sobre modales (ej. CropModal sobre otro modal)
    - NUNCA igualar z-index entre BottomNavbar y modales.
