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
6. **JWT:** `localStorage.getItem('spingamma_token')` → token Bearer.
7. **Errores:** SIEMPRE `try/catch` o `.catch()` en fetches. Manejar 4xx/5xx explícitamente.

## Reglas React
8. **Hooks en orden:** Nunca leas variables de `useMemo`/`useCallback` dentro de un `useEffect` declarado ANTES. Orden semántico descendente.
9. **Early returns:** NUNCA antes de que TODOS los hooks hayan sido invocados.
10. **Acciones protegidas:** Clic en redes/WhatsApp sin sesión → forzar `AuthModal`.

## Terceros y APIs Nativas
11. **Scripts:** NUNCA cargar `<script>` manual si ya lo gestiona una librería React (ej. GSI).
12. **Compartir:** Usar `navigator.share` cuando esté disponible.
13. **WhatsApp:** Limpiar números con `.replace(/[^0-9]/g, '')`.

## Eficiencia del Agente
14. **Ediciones en lote:** Si una tarea toca N archivos independientes → editar TODOS en paralelo. Nunca secuencialmente.
15. **No leer para editar si ya conoces el contenido.** Un `grep_search` con `MatchPerLine=true` da línea exacta + contenido suficiente para `replace_file_content` directo.
16. **Multi-chunk para mismo archivo.** Si un archivo necesita 2+ ediciones no contiguas → usar `multi_replace_file_content` en 1 sola llamada.