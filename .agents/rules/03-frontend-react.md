# Clean Code React y Estructura

## Límites y Arquitectura (Clean UI Architecture)
1. **LÍMITE ESTRICTO DE 300 LÍNEAS:** Ningún componente de React (archivo) debe exceder las 300 líneas de código. Si se aproxima a esta cantidad, tienes **ESTRICTAMENTE PROHIBIDO** mantenerlo como un monolito. Aplica inmediatamente el patrón de separación en 3 capas:
   - **Capa Lógica (Hooks):** Extraer estado (`useState`), fetching (`useEffect`) y controladores a `hooks/useNombre.js`.
   - **Capa de Utilidades (Utils):** Extraer algoritmos puros a `utils/`.
   - **Capa de Presentación:** Separar grandes bloques JSX en `components/`.
   - **Objetivo:** El componente principal queda como enrutador de props.
2. **DRY + SRP:** La lógica repetida se debe encapsular en Custom Hooks. Los componentes reutilizables deben residir en `src/components/`.
3. **Prohibición de Barrel Files (Anti-Barrel-Files):** Queda estrictamente prohibido crear archivos `index.js`, `index.ts`, `index.jsx` o `index.tsx` dentro de carpetas de componentes (ej. `components/index.js`) para re-exportar (`export * from ...`). Las importaciones deben ser directas al archivo (ej. `import Boton from './components/Boton/Boton'`).

## Testing e Integración
4. **Testing Hooks (Obligatoriedad Absoluta):** 🚨 SIEMPRE agrega el atributo `data-testid="..."` a TODOS los elementos interactivos nuevos (botones, inputs, enlaces, modales). No asumas que es opcional.
5. **Vías de Acción Directa:** Queda estrictamente prohibido presentar estados "pendientes" en listados (ej. pedidos pendientes de pago) como simples etiquetas estáticas. Todo elemento en estado pendiente **DEBE** incluir un botón de acción directo (con `data-testid`) hacia la vista de resolución.

## Estabilidad JSX e Imports
6. **Verificación Obligatoria de Imports (Micro-Linting):** Cada vez que insertes un nuevo componente o ícono (ej. `<Send />`), **DEBES OBLIGATORIAMENTE** agregarlo al `import`. Vite no detecta `ReferenceError` en tiempo de compilación. Tras editar un JSX, **ESTÁS OBLIGADO** a ejecutar un Micro-Linting rápido en ese archivo.
7. **Reposición exacta y Balanceo de JSX:** Presta extrema atención al editar JSX. NUNCA envuelvas condicionalmente bloques de código que contengan etiquetas de apertura o cierre desparejadas de contenedores padres.
8. **Coherencia Estricta de Props (Anti-Prop-Mismatch):** Al conectar un componente padre con un hijo, **DEBES OBLIGATORIAMENTE** verificar que los nombres de las props (prop signatures) coincidan exactamente en ambos lados.

## Estado, Efectos y Hooks
9. **Anti-Eslint-Disable:** Queda terminantemente prohibido usar `// eslint-disable-next-line react-hooks/exhaustive-deps`. Refactoriza usando `useCallback` o `useMemo`.
10. **Pureza de Render (Anti-Set-State-In-Effect):** Prohibido usar `useEffect` simplemente para "escuchar" una prop y actualizar otro estado local (cascading renders). Usa "Derivación de Estado". Prohibidas las funciones impuras (`Date.now()`, `Math.random()`) en el render directo; usa inicialización perezosa.
11. **Pureza en Actualizadores de Estado (State Updaters):** 🚨 Queda estrictamente prohibido ejecutar efectos secundarios (side-effects) o invocar callbacks inyectados por el componente padre dentro de una función de actualización de estado (ej. `setState(prev => ...)`). Esto evita errores de ciclo de render cruzado.
12. **Estabilidad de Dependencias en Efectos (Hooks Loops):** 🚨 Todo callback inyectado que se ejecute dentro de un `useEffect` debe estar estrictamente memoizado (`useCallback`) en su origen. Si esto no es posible por arquitectura, exclúyelo conscientemente del arreglo de dependencias (con supresión justificada de linting) para prevenir bucles de inicialización múltiple.
13. **Early returns:** NUNCA uses `return` anticipados antes de que TODOS los hooks del componente hayan sido invocados.
14. **Sincronización de Literales:** Queda prohibido asumir lógica condicional en el frontend basada en literales (ej. `if (status === 'pendiente')`) sin validar la sintaxis exacta con el backend.

## Flujo de Datos y Persistencia
15. **Recepción de Identificadores (Anti-Ghosting de IDs):** Está **ESTRICTAMENTE PROHIBIDO** filtrar manualmente los payloads del servidor descartando propiedades estructurales clave. Si recibes una entidad, siempre preserva explícitamente el `id` o usa mapeo integral (`...data`).
16. **Formularios (Gate Backend-First):** Antes de enviar nuevos campos de datos persistentes, verifica que el backend ya los soporta. No dejes datos flotando solo en memoria RAM si su fin es persistir.
17. **Parseo de Errores API:** NUNCA pases el string de error crudo devuelto por la API. Muestra mensajes amigables parseando los `detail` del backend.
18. **Lógica de Filtros Mixtos (tempId vs id):** Al filtrar listas, aísla validaciones si usas `id` (BD) y `tempId` (local). `if (item.id) return p.id !== item.id; return p.tempId !== item.tempId;`.
19. **Fechas Locales vs UTC:** NUNCA uses `new Date().toISOString().split('T')[0]` en el frontend para fechas locales. Usa los métodos locales (`getFullYear()`, `getMonth()`).
