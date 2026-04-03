---
trigger: always_on
---

# Estándares de Arquitectura (Arquitecto)
1. **Arquitectura DRY:** Si detectas lógica repetida (ej. métricas, estados), extráela a un Custom Hook.
2. **API y Estado:** Usa SIEMPRE `import.meta.env.VITE_API_URL`. El estado de sesión se lee de `localStorage.getItem('spingamma_user')`. 
3. **Rutas Protegidas:** Los clics en redes o WhatsApp DEBEN interceptarse. Si no hay sesión, fuerza el `AuthModal`.
4. **Manejo de Errores:** Incluye SIEMPRE bloques `.catch()` para manejar caídas del servidor o códigos `403`.
5. **APIs Nativas:** Usa `navigator.share` y limpia números para WhatsApp (`.replace(/[^0-9]/g, '')`).
6. **Orden Estricto de Hooks (TDZ):** NUNCA leas constantes o variables extraídas de un `useMemo` / `useCallback` dentro de un `useEffect` que haya sido declarado ANTES en el código. Esto provoca el error "Cannot access 'X' before initialization". Mantén siempre las dependencias y sus Hooks consumidores en estricto orden semántico descendente.