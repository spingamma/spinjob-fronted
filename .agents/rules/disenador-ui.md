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

## Formularios
4. **Validación Regex:** Nombres `/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/`, celulares 8 dígitos (Bolivia).
5. **Feedback visual:** Mostrar `Loader2` en botones durante `isSubmitting`.

## Layout Responsivo
6. **Mobile-first:** `BottomNavbar` solo en móvil, Grid responsivo en desktop.
7. **Grid/Flex:** Usar `gap` y `flex-wrap`.

## Estética Premium (Tailwind 4)
8. **Glassmorphism:** `bg-white/10 backdrop-blur-md border border-white/20`.
9. **Gradientes:** `bg-gradient-to-br from-[#1E3D51] to-[#B95221]`.
10. **Sombras:** `shadow-xl shadow-black/5`.
11. **Animaciones:** `transition-all duration-300 ease-out hover:scale-[1.02]`.