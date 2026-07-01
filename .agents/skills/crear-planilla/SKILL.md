---
name: crear-plantilla
description: Genera una nueva plantilla de perfil profesional basada en los estándares de diseño premium de Tarjetoso.
---

# Skill: Crear Plantilla Profesional

## Cuándo usar
- Usuario pide: "Crea una plantilla de Médico/Abogado/etc."

## Archivos de referencia OBLIGATORIOS
1. `src/plantillas/PlantillaGenerica.jsx` — Template base.
2. `src/pages/Profile/Profile.jsx` — Registro de plantillas.
3. `src/hooks/useAccionesPerfil.jsx` — Lógica de botones.

## Pasos

### 1. Crear el archivo
- Ruta: `src/plantillas/Plantilla[Profesion].jsx`.
- **LÍMITE ESTRICTO:** La plantilla NO debe exceder las 300 líneas.
- Usar `write_to_file` con el código completo.

### 2. Diseño premium (Tarjetoso)
- Usa los colores base (`#1E3D51`, `#B95221`).
- Glassmorphism, gradientes, sombras profundas.
- Avatar con `onError` fallback.
- Secciones protegidas con `?.`.
- 🚨 **CRÍTICO - TESTING:** SIEMPRE incluir atributos `data-testid="..."` en botones e inputs interactivos. JAMÁS crear un botón sin esto.

### 3. Registro Express
- Editar `src/pages/Profile/Profile.jsx` usando `multi_replace_file_content` para agregar el import y el caso en el renderizado.

### 4. Verificación
- Ejecutar `npm run build` para asegurar que el import dinámico funciona.