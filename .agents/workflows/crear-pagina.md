---
description: Crear una nueva página completa (vista de ruta) siguiendo los estándares de diseño y arquitectura de la plantilla. Incluye componente, ruta, y navegación.
---

# Workflow: Crear Nueva Página (/crear-pagina)

## 1. Localizar la configuración de rutas
Busca el archivo centralizado de enrutamiento (ej. `src/App.jsx`, `src/routes.jsx`, o el enrutador por directorios en Next.js/Remix) para conocer las rutas y cargas perezosas (lazy imports) existentes.
```bash
# Ejemplo para inspeccionar el archivo de enrutamiento:
powershell -Command "Get-Content src/App.jsx | Select-Object -First 40"
```

## 2. Crear la carpeta y el componente de la página
Crea el archivo correspondiente en `src/pages/[NombrePagina]/[NombrePagina].jsx` (o la convención de rutas de tu stack).
**REGLA:** El componente principal NO debe exceder las 300 líneas de código.

```jsx
// Archivo: src/pages/[NombrePagina]/[NombrePagina].jsx
import { useState, useEffect } from 'react';

// Obtener la URL base de API desde la configuración de entorno del proyecto
const API_URL = import.meta.env.VITE_API_URL || '';

export default function NombrePagina() {
  // 1. Declarar todos los hooks al inicio (useState, useEffect, useMemo, etc.)
  
  // 2. Controladores de eventos (handlers) e interactividad

  // 3. Sentencias de retorno anticipado (early returns) si aplican

  // 4. JSX del Componente
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Contenido responsivo */}
      
      {/* 🚨 CRÍTICO: Todo botón, enlace interactivo e input debe incluir data-testid="ejemplo-btn" 🚨 */}
      <button 
        type="button" 
        onClick={() => {}} 
        data-testid="nombre-pagina-action-btn"
        className="px-4 py-2 bg-primary text-white rounded-lg transition-transform hover:scale-[1.02]"
      >
        Acción
      </button>
    </div>
  );
}
```

## 3. Registrar la ruta en la configuración del proyecto
Edita el enrutador principal para dar de alta la nueva página:
- Usa importación diferida (lazy loading/dynamic import) si se utiliza React Router o Vite: `const NombrePagina = lazy(() => import('./pages/NombrePagina/NombrePagina'));`
- Declara la ruta correspondiente en el árbol de navegación.

## 4. Vincular a la navegación principal (si aplica)
Si la página requiere acceso desde menús globales:
- Registra el nuevo enlace en el menú lateral, de cabecera o de navegación inferior móvil (`src/components/Navigation`, etc.) en paralelo.

## 5. Conectar con el backend
Si la página consume servicios externos:
- Confirma que el endpoint correspondiente existe en tu backend (localizado en el subdirectorio de backend del workspace).
- Si no existe, ve al backend y créalo directamente con transacciones seguras y esquemas de validación.
- Implementa llamados HTTP robustos usando `fetch` o tu librería cliente, manejando estados de carga (loading), errores de API estructurados y colecciones vacías.

## 6. Validar y construir localmente
Corre el build de producción para asegurarte de que no existan errores de compilación, de sintaxis JSX o de importación diferida:
```bash
npm run build
```
