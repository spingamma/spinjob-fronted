---
name: desarrollo-frontend
description: Guía paso a paso para crear, refactorizar o modificar vistas y componentes en el frontend.
---

# Skill: Desarrollo y Gestión de Frontend

## Cuándo usar
Esta habilidad debe activarse automáticamente cada vez que el usuario te pida interactuar con el código frontend visual. Esto incluye:
- "Crea un componente..."
- "Agrega un input/botón a..."
- "Edita la vista de..."
- "Refactoriza el modal de..."

## Flujo Secuencial (Paso a Paso)

### Paso 1: Verificación de Dependencias (Gate Backend-First)
Antes de escribir cualquier componente que envíe o reciba datos persistentes (ej. un formulario nuevo, un botón de estado):
1. Revisa el endpoint del backend, el modelo de BD y el schema/DTO.
2. Si el backend NO soporta el campo, DETÉN EL FRONTEND e implementa primero el backend (ver `04-backend-standards.md`).

### Paso 2: Configuración Inicial de UI
1. Consulta la paleta de colores del proyecto (`.agents/branding.json` o similar). Si no existe, pregúntale al usuario.
2. Aplica **siempre** los colores y marcas cargadas de manera dinámica en lugar de colores genéricos.
3. Asegura un diseño Mobile-First. Evita anchos fijos amplios, usa `flex-wrap` o `flex-col`.

### Paso 3: Estructuración del Componente (Clean Architecture)
1. Escribe el componente JSX.
2. 🚨 **Vigilancia de 300 líneas:** Si el archivo excede las 300 líneas, desmiémbralo inmediatamente en 3 capas (Hooks, Utils, Subcomponentes).
3. Asegúrate de añadir `data-testid` a todo elemento interactivo nuevo.
4. Las propiedades y variables desestructuradas deben coincidir exactamente con el padre (Coherencia de Props).

### Paso 4: Validaciones y UX Progresiva
1. Los campos requeridos vacíos **NO** deben mostrar alertas rojas agresivas antes de la interacción. Usa estilos neutros y sutiles (ej. asterisco rojo o badge "Requerido"). Las alertas agresivas solo aparecen al intentar enviar un formulario inválido.
2. Los modales pesados deben ocultar dinámicamente barras de acción flotantes para evitar clics accidentales (no dependas solo de `z-index`).
3. Bloquea y redirige acciones críticas al flujo de autenticación (Login) si el usuario no tiene sesión.
4. **Aislamiento por Rol (RBAC Visual):** Siempre que implementes botones o acciones que cambien el estado de una entidad, verifica cruzadamente que el rol/usuario actual tiene permisos lógicos para ver ese botón, no confíes solo en el estado del objeto.

### Paso 5: Micro-Linting y Verificación Final
Inmediatamente después de modificar un archivo JSX/TSX:
1. Asegúrate de haber importado todos los símbolos e íconos utilizados.
2. Ejecuta `npx eslint ruta/al/archivo_editado.jsx` para confirmar la ausencia de `ReferenceError`, imports muertos, o violaciones de dependencias en Hooks.

## Checklist Obligatorio antes de Finalizar
- [ ] ¿Se verificó que el backend soporta los nuevos datos antes de iniciar?
- [ ] ¿El componente principal se mantuvo por debajo de las 300 líneas (orquestador)?
- [ ] ¿Cada elemento interactivo nuevo posee su `data-testid`?
- [ ] ¿Los nombres de las props (firmas) coinciden exactamente entre padre e hijo?
- [ ] ¿Ejecutaste el micro-linting (`npx eslint ...`) tras los cambios y obtuviste 0 errores?
- [ ] ¿Se preservaron íntegramente los `id` de las entidades recibidas de la API?
- [ ] ¿Se usaron colores y texturas del branding oficial en lugar de genéricos?
- [ ] ¿Se validó el aislamiento por rol (Cross-Role UI) para asegurar que botones sensibles no se renderizan a usuarios no autorizados?

> **Nota:** Para conocer las restricciones formales de sintaxis, reglas de React y prohibiciones, consulta el archivo `rules/03-frontend-react.md`.
