---
name: crear-componente
description: Genera un nuevo componente UI React respetando el branding de Tarjetoso y el límite estricto de 300 líneas.
---

# Skill: Crear Componente

## Cuándo usar
- "Agrega un componente para mostrar X", "Crea una tarjeta de Y", "Haz un modal para Z".

## Pasos

### 1. Ubicación y Estructura
- Crea el archivo en `src/components/` o en una subcarpeta si pertenece a una vista específica (ej. `src/pages/AdminPanel/components/`).
- **LÍMITE ESTRICTO:** El componente NO debe exceder las 300 líneas. Si parece que lo hará, divídelo en subcomponentes antes de empezar.

### 2. Diseño y Branding (Tarjetoso)
- Usa los colores oficiales: `#1E3D51` y `#B95221`.
- Aplica Tailwind 4: Usa flex/grid responsivos (mobile-first).
- Glassmorphism: `bg-white/10 backdrop-blur-md` si el diseño lo amerita.
- Para avatares/imágenes, agrega `onError` de `ui-avatars.com`.

### 3. Código y Testing
- Asegura que todos los `<button>`, `<a>`, e inputs tengan `data-testid="nombre-del-elemento"`.
- Protege los renderizados con `?.` o `&&`.
