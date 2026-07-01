---
trigger: always_on
---

# Estándares de Diseño UI/UX Premium

## 🏎️ VELOCIDAD DE DISEÑO
1. **Decisión Proactiva:** No preguntes si usar azul o naranja. Usa la paleta `#1E3D51` (Primario) y `#B95221` (Acento) siempre.
2. **Componentes Atómicos:** Si un elemento visual se repite 2+ veces, extráelo a `src/components/` inmediatamente en paralelo con la edición de la página.

## Componentes
1. **Reutilización:** Elementos visuales compartidos → `src/components/`.
2. **Renderizado seguro:** Proteger con `&&` o `?.`.
3. **Imágenes:** SIEMPRE `onError` con fallback a `ui-avatars.com`.
4. **Testing Hooks (OBLIGATORIO EXTREMO):** 🚨 SIEMPRE agrega atributos `data-testid="..."` a TODOS los elementos interactivos (botones, inputs, `<a>`, modales, iconos clickeables). ES UN ERROR GRAVE olvidar esto, ya que las pruebas E2E no deben depender de textos frágiles o selectores de clase.

## Formularios
4. **Validación Regex:** Nombres `/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/`, celulares 8 dígitos (Bolivia).
5. **Feedback visual:** Mostrar `Loader2` en botones durante `isSubmitting`.

## Layout Responsivo
6. **Mobile-first:** `BottomNavbar` solo en móvil, Grid responsivo en desktop.
7. **Grid/Flex:** Usar `gap` y `flex-wrap`.
8. **Grids en móvil:** En contenedores tipo catálogo/galería usar `grid-cols-1` en móvil, `sm:grid-cols-2` en tablet, `md:grid-cols-3` en desktop. NUNCA empezar con `grid-cols-2` en móvil (las tarjetas quedan muy pequeñas).

## Estética Premium (Tailwind 4)
9. **Glassmorphism:** `bg-white/10 backdrop-blur-md border border-white/20`.
10. **Gradientes:** `bg-gradient-to-br from-[#1E3D51] to-[#B95221]`.
11. **Sombras:** `shadow-xl shadow-black/5`.
12. **Animaciones:** `transition-all duration-300 ease-out hover:scale-[1.02]`.

## 📱 Reglas Mobile-First (CRÍTICO)
13. **NUNCA usar hover para acciones críticas.** En móvil no existe hover. Botones de Editar/Eliminar deben ser SIEMPRE visibles (usar iconos `Pencil` + `Trash2` en la esquina de la tarjeta). El overlay oscuro con hover solo aplica como efecto visual extra en desktop.
14. **z-index de modales > z-index de BottomNavbar.** `BottomNavbar` usa `z-40`. Modales usan `z-[100]`. Modales sobre modales (ej. CropModal dentro de CatalogManager) usan `z-[999]`. NUNCA igualar z-index entre navbar y modales.
15. **Textareas con auto-grow.** Para campos de descripción multiline, usar `useRef` + `useEffect` para ajustar `style.height` automáticamente según el contenido. Agregar `maxLength` y un contador visual `{value.length}/{max}`.
16. **Subida de imágenes → siempre pasar por CropModal.** Cualquier input de imagen debe abrir `CropModal` para que el usuario recorte antes de subir. Usar `cropShape="rect"` para productos/catálogo y `cropShape="round"` (default) para avatares.
17. **Modales anidados → Fragmentos React.** Si un modal (ej. CatalogManager) abre otro modal (ej. CropModal), el segundo debe renderizarse FUERA del div backdrop del primero usando `<>...</>` (Fragment). De lo contrario, clicks en el modal hijo (zoom, drag) propagarán y cerrarán el modal padre.
18. **Descripciones largas → "Ver más".** Usar `line-clamp-2` por defecto + botón "Ver más" / "Ver menos" que alterna la clase. Detectar si el texto es largo con `text.length > 70`.
19. **Prevenir Overflow en Flex/Grid:** SIEMPRE usa `w-full` y `overflow-hidden` o `min-w-0` en contenedores anidados dentro de grids/flexbox en listados de tarjetas. Esto evita que textos muy largos (a pesar de usar `truncate` o `line-clamp`) expandan el contenedor y rompan el diseño responsivo en móviles.
20. **Gráficas Responsivas (Recharts):** En gráficos con muchas líneas o series de datos (ej. comparadores), SIEMPRE configura la `<Legend>` en la parte inferior (`verticalAlign="bottom"`) con un margen/padding top, y asegura un alto mínimo estricto al `<ResponsiveContainer>` (ej. `minHeight={450}`). Dejar la leyenda arriba en móviles provocará que esta se envuelva y empuje la gráfica ocultando las líneas.
21. **Flexbox en Cabeceras de Controles:** En barras de herramientas que contengan inputs nativos (fechas, calendarios, buscadores) y botones de acción (ej. "Descargar"), SIEMPRE usar `flex-wrap` en el contenedor principal. Los inputs nativos en pantallas pequeñas sin wrap desbordan la pantalla hacia la derecha, sacando los botones críticos fuera del área visible del móvil.