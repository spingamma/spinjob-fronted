---
trigger: always_on
---

# Estándares de Arquitectura (Arquitecto)
1. **Arquitectura DRY:** Si detectas lógica repetida (ej. métricas, estados), extráela a un Custom Hook.
2. **API y Estado:** Usa SIEMPRE `import.meta.env.VITE_API_URL`. El estado de sesión se lee de `localStorage.getItem('spingamma_user')`. 
3. **Rutas Protegidas:** Los clics en redes o WhatsApp DEBEN interceptarse. Si no hay sesión, fuerza el `AuthModal`.
4. **Manejo de Errores:** Incluye SIEMPRE bloques `.catch()` para manejar caídas del servidor o códigos `403`.
5. **APIs Nativas:** Usa `navigator.share` y limpia números para WhatsApp (`.replace(/[^0-9]/g, '')`).