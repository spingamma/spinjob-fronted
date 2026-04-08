---
trigger: always_on
---

# Estándares de Arquitectura (Arquitecto)
1. **Arquitectura DRY:** Si detectas lógica repetida (ej. métricas, estados), extráela a un Custom Hook.
2. **API y Estado:** Usa SIEMPRE `import.meta.env.VITE_API_URL`. El estado de sesión se lee de `localStorage.getItem('spingamma_user')`. El JWT se almacena en `localStorage.getItem('spingamma_token')`.
3. **Rutas Protegidas:** Los clics en redes o WhatsApp DEBEN interceptarse. Si no hay sesión, fuerza el `AuthModal`.
4. **Manejo de Errores:** Incluye SIEMPRE bloques `.catch()` para manejar caídas del servidor o códigos `403`.
5. **APIs Nativas:** Usa `navigator.share` y limpia números para WhatsApp (`.replace(/[^0-9]/g, '')`).
6. **Orden Estricto de Hooks (TDZ):** NUNCA leas constantes o variables extraídas de un `useMemo` / `useCallback` dentro de un `useEffect` que haya sido declarado ANTES en el código. Esto provoca el error "Cannot access 'X' before initialization". Mantén siempre las dependencias y sus Hooks consumidores en estricto orden semántico descendente.
7. **Early Returns DESPUÉS de Hooks:** NUNCA coloques un `return null` o cualquier early return ANTES de que todos los Hooks (`useState`, `useEffect`, `useContext`, `useGoogleLogin`, etc.) hayan sido invocados. Los early returns van SIEMPRE después de la última llamada a Hook. Esto incluye hooks de librerías externas como `@react-oauth/google`. Si un componente necesita un early return condicional (ej. `if (!isOpen) return null`), asegúrate de que TODOS los hooks estén arriba.
8. **Scripts de Terceros — No Duplicar:** NUNCA cargues manualmente un `<script>` en `index.html` si una librería de React ya lo carga automáticamente (ej. `@react-oauth/google` carga `accounts.google.com/gsi/client`). Duplicar scripts causa errores como `initialize() called multiple times` y crashes por estado corrupto.
9. **Props de Librerías Externas:** Antes de usar props de un componente de librería externa, verifica la documentación o tipos de la API. Errores comunes: pasar `"100%"` (string) donde se espera un número en píxeles, pasar valores inválidos en `text`, `locale`, etc. Si no estás seguro, omite el prop y usa el default.