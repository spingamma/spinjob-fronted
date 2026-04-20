---
description: Crear una nueva página completa (vista de ruta) siguiendo los estándares de Tarjetoso. Incluye componente, ruta, y navegación.
---

# Workflow: Crear Nueva Página (/crear-pagina)

// turbo-all

## 1. Leer App.jsx (para conocer imports y rutas existentes)

```
cd c:\Users\jhona\Desktop\spinjob-fronted && powershell -Command "Get-Content src/App.jsx | Select-Object -First 40"
```

## 2. Crear carpeta y componente

Crear `src/pages/[NombrePagina]/[NombrePagina].jsx` con la estructura base:

```jsx
// Archivo: src/pages/[NombrePagina]/[NombrePagina].jsx
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function NombrePagina() {
  // 1. Todos los hooks primero
  // 2. Lógica y handlers
  // 3. Early returns (si aplica, DESPUÉS de hooks)
  // 4. JSX
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Contenido */}
    </div>
  );
}
```

## 3. Registrar ruta en App.jsx (edición directa, no leer de nuevo)

Agregar en `src/App.jsx`:
1. Lazy import: `const NombrePagina = lazy(() => import('./pages/NombrePagina/NombrePagina'));`
2. Route: `<Route path="/ruta" element={<NombrePagina />} />`

> Usar `multi_replace_file_content` para agregar ambos cambios (import + route) en 1 sola llamada.

## 4. Agregar navegación (si aplica)

Si la página debe ser accesible desde navegación global, editar EN PARALELO:
- `src/components/NavMenu.jsx` — Agregar enlace al menú
- `src/components/BottomNavbar.jsx` — Agregar icono si es página principal

## 5. Conectar con backend (si aplica)

Si la página consume un endpoint:
1. Verificar que el endpoint existe en el backend (`c:\Users\jhona\Desktop\spinjob-backend`)
2. Si no existe → ir al backend y crearlo directamente
3. Usar `fetch` con `try/catch` y manejar estados de loading/error/empty

## 6. Verificar

```
cd c:\Users\jhona\Desktop\spinjob-fronted && npm run build
```
