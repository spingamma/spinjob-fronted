---
trigger: always_on
---

# Estándares de Arquitectura y Clean Code

## Código
1. **DRY + SRP:** Lógica repetida → Custom Hook. Máx 300-400 líneas por archivo. 1 responsabilidad por componente/hook.
2. **Idioma:** Variables, funciones, archivos → inglés. Textos al usuario → español.
3. **Estructura:** `pages/` vistas, `components/` reutilizables, `hooks/` lógica, `plantillas/` templates de perfil, `utils/` utilidades puras.

## API y Estado
4. **Base URL:** `import.meta.env.VITE_API_URL` (nunca hardcodeado).
5. **Sesión:** `localStorage.getItem('spingamma_user')` → objeto usuario.
15. **JWT:** `localStorage.getItem('spingamma_token')` → token Bearer.
16. **Errores:** SIEMPRE `try/catch` o `.catch()` en fetches. Manejar 4xx/5xx explícitamente.
17. **Fechas Robustas:** NUNCA uses `.split('T')[0]` ciegamente para extraer `YYYY-MM-DD` de respuestas del backend, ya que el backend puede enviar `YYYY-MM-DD HH:MM:SS` (con espacio). Usa SIEMPRE `.substring(0, 10)` para evitar bugs de parseo o chequea bien el formato.
18. **Strings Exactos (Hardcodes):** Cuando compares literales (`platform === "Visita Perfil"` vs `perfil_view`), verifica la coincidencia EXACTA con lo que emite/guarda el backend en sus routers. No asumas traducciones ni formatos.

## Reglas React
19. **Hooks en orden:** Nunca leas variables de `useMemo`/`useCallback` dentro de un `useEffect` declarado ANTES. Orden semántico descendente.
20. **Early returns:** NUNCA antes de que TODOS los hooks hayan sido invocados.
21. **Acciones protegidas:** Clic en redes/WhatsApp sin sesión → forzar `AuthModal`.
22. **Modales anidados:** Si un modal abre otro modal (ej. CatalogManager → CropModal), usar React Fragment `<>...</>` como wrapper y renderizar el modal hijo FUERA del div backdrop del padre. Esto evita que `onClick={onClose}` del fondo oscuro capture clicks del modal hijo.
23. **Componentes con estado local en listas:** Si cada ítem de una lista necesita estado propio (ej. "Ver más"), extraer un sub-componente (ej. `ProductCard`) que maneje su propio `useState`. No manejar estado por índice en el padre.

## Terceros y APIs Nativas
24. **Scripts:** NUNCA cargar `<script>` manual si ya lo gestiona una librería React (ej. GSI).
25. **Compartir:** Usar `navigator.share` cuando esté disponible.
26. **WhatsApp:** Limpiar números con `.replace(/[^0-9]/g, '')`.

## z-index Hierarchy (OBLIGATORIO)
27. **Escala de z-index del proyecto:**
    - `z-40` → `BottomNavbar` (navegación inferior móvil)
    - `z-50` → Dropdowns, tooltips, barras flotantes
    - `z-[100]` → Modales principales (CatalogManager, CatalogModal, AuthModal, ReviewModal, QR modal)
    - `z-[999]` → Modales sobre modales (CropModal que se abre desde otro modal)
    - NUNCA igualar z-index entre BottomNavbar y modales. Los modales SIEMPRE deben estar por encima.

## Eficiencia del Agente
28. **Ediciones en lote:** Si una tarea toca N archivos independientes → editar TODOS en paralelo. Nunca secuencialmente.
29. **No leer para editar si ya conoces el contenido.** Un `grep_search` con `MatchPerLine=true` da línea exacta + contenido suficiente para `replace_file_content` directo.
30. **Multi-chunk para mismo archivo.** Si un archivo necesita 2+ ediciones no contiguas → usar `multi_replace_file_content` en 1 sola llamada.