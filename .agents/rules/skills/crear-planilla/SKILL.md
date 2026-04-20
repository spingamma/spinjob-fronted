---
name: crear-plantilla
description: Genera una nueva plantilla de perfil profesional basada en los estándares de diseño premium de Tarjetoso.
---

# Skill: Crear Plantilla Profesional

// turbo-all

## 🏎️ REGLAS DE VELOCIDAD
1. **Copia y Pega Masivo:** Lee `PlantillaGenerica.jsx` y crea el nuevo archivo con todo el contenido de una vez.
2. **Edición en Lote:** Registra la plantilla en `Profile.jsx` y crea el archivo `.jsx` en el mismo turno.
3. **No Preguntar Estilos:** Usa la paleta Tarjetoso (`#1E3D51`, `#B95221`) por defecto.

## Cuándo usar
- Usuario pide: "Crea una plantilla de Médico/Abogado/etc."

## Archivos de referencia OBLIGATORIOS
1. `src/plantillas/PlantillaGenerica.jsx` — Template base.
2. `src/pages/Profile/Profile.jsx` — Registro de plantillas.
3. `src/hooks/useAccionesPerfil.jsx` — Lógica de botones.

## Pasos

### 1. Crear el archivo
- Ruta: `src/plantillas/Plantilla[Profesion].jsx`.
- Usar `write_to_file` con el código completo.

### 2. Diseño premium
- Glassmorphism, gradientes, sombras profundas.
- Avatar con `onError` fallback.
- Secciones protegidas con `?.`.

### 3. Registro Express
- Editar `src/pages/Profile/Profile.jsx` usando `multi_replace_file_content` para agregar el import y el caso en el renderizado.

### 4. Verificación
- Ejecutar `npm run build` para asegurar que el import dinámico funciona.