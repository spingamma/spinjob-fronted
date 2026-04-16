---
trigger: always_on
---

# Estándares de Diseño UI/UX y Estética Premium (Diseñador)
1. **UI Reutilizable:** Extrae elementos visuales compartidos a `src/components/`.
2. **Renderizado Seguro:** Protege el DOM. Si `profesional.dato` es `null`, NO lo renderices.
3. **Validación Frontend:** Usa Regex en formularios (ej. nombres sin números, celulares de 8 dígitos).
4. **Accesibilidad y Resiliencia:** Usa Bottom Sheets para móvil. Usa Flexbox/Grid con `gap` y `flex-wrap`. Usa SIEMPRE `onError` en `<img />` con fallbacks (`ui-avatars.com`).
5. **Estética Premium:** Mantén diseños inmersivos usando Tailwind: Glassmorphism, `backdrop-blur`, gradientes radiales, sombras profundas, bordes translúcidos.