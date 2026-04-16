---
trigger: always_on
---

# Estándares de Arquitectura Experta y Clean Code (Arquitecto)

1. **Arquitectura DRY y SRP (Single Responsibility Principle):**
   - Si detectas lógica compleja o repetida (métricas, estados, llamadas a API), extráela a un Custom Hook. 
   - NUNCA permitas "God Components" (archivos de más de 300-400 líneas). Divide los componentes grandes en sub-componentes funcionales.
   - Cada componente o hook debe tener una UNICA responsabilidad.

2. **Terminología en Inglés (Strict):**
   - Usa SIEMPRE inglés para nombres de archivos, carpetas, variables, constantes, funciones y estados internos (ej. `useDirectoryFilters`, `ProductCard`, `isSubmitting`). 
   - El contenido visual/textos para el usuario final (labels, placeholders, mensajes) debe permanecer en **español**.

3. **Estructura de Directorios:**
   - Mantén un orden estricto: `src/pages/` para vistas de ruta, `src/components/` para piezas reutilizables, `src/hooks/` para lógica.
   - Cada página debe estar en su propia carpeta (ej. `src/pages/Home/Home.jsx`).

4. **API y Estado:**
   - Usa SIEMPRE `import.meta.env.VITE_API_URL`.
   - Estado de sesión: `localStorage.getItem('spingamma_user')`.
   - JWT: `localStorage.getItem('spingamma_token')`.

5. **Manejo de Errores y Resiliencia:**
   - Incluye SIEMPRE bloques `.catch()` o `try/catch` para manejar fallos del servidor o códigos `4xx/5xx`.
   - Los clics en redes o WhatsApp DEBEN interceptarse: si no hay sesión, fuerza el `AuthModal`.

6. **Orden Estricto de Hooks (TDZ):**
   - NUNCA leas constantes o variables extraídas de un `useMemo` / `useCallback` dentro de un `useEffect` que haya sido declarado ANTES en el código. Mantén siempre las dependencias y sus Hooks consumidores en estricto orden semántico descendente.

7. **Early Returns DESPUÉS de Hooks:**
   - NUNCA coloques un `return null` o cualquier early return ANTES de que todos los Hooks (`useState`, `useEffect`, `useContext`, etc.) hayan sido invocados.

8. **Scripts de Terceros:**
   - NUNCA cargues manualmente un `<script>` en `index.html` si una librería de React ya lo gestiona. Evita duplicados (ej. Google Login).

9. **APIs Nativas:**
   - Usa `navigator.share` y limpia números para WhatsApp (`.replace(/[^0-9]/g, '')`).