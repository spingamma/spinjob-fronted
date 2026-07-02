# Clean Code React y Estructura

## Límites y Arquitectura
1. **LÍMITE ESTRICTO DE 300 LÍNEAS:** Ningún componente, hook o página debe exceder las 300 líneas de código. Si se aproxima a esta cantidad, extrae la lógica a un Custom Hook (`hooks/`) o a subcomponentes (`components/`). Mantén una única responsabilidad por archivo.
2. **DRY + SRP:** La lógica repetida se debe encapsular en Custom Hooks. Los componentes reutilizables deben residir en `src/components/`.

## Reglas Críticas de Testing e Interacción
3. **Testing Hooks (OBLIGATORIO EXTREMO):** 🚨 SIEMPRE agrega atributos `data-testid="..."` a TODOS los elementos interactivos (botones, inputs, enlaces `<a>`, modales, etc.). Es considerado un error grave no hacerlo.
4. **Reposición exacta y Balanceo de JSX (Oxc/Vite):** 🚨 Presta extrema atención al editar, envolver o eliminar JSX.
   - Si borras una etiqueta de cierre `</div>` huérfana, romperás el árbol de renderizado de React.
   - **NUNCA** envuelvas condicionalmente bloques de código que contengan etiquetas de apertura o cierre desparejadas de contenedores padres (ej: abrir un fragmento `<>` dentro de un condicional, pero cerrar la etiqueta `</div>` del contenedor padre dentro de este fragmento).
   - Condiciona únicamente las etiquetas hijas específicas (de forma aislada) o asegúrate de que toda la estructura contenedora (apertura y cierre) quede autocontenida y balanceada dentro de la expresión condicional. Utiliza `view_file` si necesitas confirmar el árbol superior de etiquetas.

## Estado, Hooks y Modales
5. **Early returns:** NUNCA uses sentencias de retorno anticipado (early returns) antes de que TODOS los hooks (useState, useEffect, useMemo, etc.) del componente hayan sido invocados.
6. **Listas con estado:** Si los ítems de una lista requieren gestionar estado local individual (ej. "Ver más", "Editar"), extrae cada elemento a un subcomponente dedicado (ej. `ItemCard`). Evita usar colecciones/arrays de estados en el componente padre.
7. **Modales anidados:** Si un modal despliega un segundo modal encima, usa React Fragment `<>...</>` como contenedor de primer nivel y renderiza el modal secundario FUERA del contenedor de fondo (backdrop) del modal padre.
8. **Acciones protegidas:** Bloquea y redirige interacciones críticas que requieran sesión activa al flujo de login correspondiente (ej. desplegar un `LoginModal` o redirección de sesión).

## Lógica de Filtrado con IDs Mixtos (Base de datos vs Temporales)
9. **Filtros aislados:** Al trabajar con listas de elementos que mezclan registros ya guardados en BD (con `id`) y elementos locales temporales (con `tempId`), aísla y valida ambas variables por separado en el `.filter()`. 
**NUNCA USES ESTA FORMA:**
```javascript
// INCORRECTO: p.tempId !== item.tempId evaluará a 'undefined !== undefined' -> 'false'.
setItems(prev => prev.filter(p => p.id !== item.id && p.tempId !== item.tempId));
```
**FORMA CORRECTA:**
```javascript
setItems(prev => prev.filter(p => {
  if (item.id) return p.id !== item.id;
  return p.tempId !== item.tempId;
}));
```

## Manejo de Fechas y Timezones
10. **Fechas Locales vs UTC:** NUNCA uses `new Date().toISOString().split('T')[0]` en el frontend para calcular la fecha actual ("hoy") si tu API backend asume fechas en husos horarios locales. Esto causa desajustes de fecha (el día salta al día siguiente durante la tarde/noche debido a la desviación UTC).
**FORMA CORRECTA:** Usa los métodos de fecha local del objeto `Date` para construir representaciones robustas en el huso horario local del usuario:
```javascript
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
```

## Formularios y Manejo de Errores de API
11. **Campos Obligatorios:** Todo campo obligatorio en un formulario debe indicar explícitamente su estatus mediante un asterisco rojo (`<span className="text-red-500">*</span>`) en su etiqueta descriptiva.
12. **Validación en Cliente (Prevención de 422/BadRequest):** Valida en el cliente que los campos requeridos estén completos y cumplan los tipos esperados antes de realizar la petición HTTP.
13. **Parseo de Errores de API:** NUNCA pases el string de error crudo devuelto por la API sin verificar su tipo o estructura. Si el backend (FastAPI, Express, etc.) retorna un objeto estructurado o un array de errores de validación, renderízalos amigablemente al usuario en lugar de mostrar `[object Object]`.
**Ejemplo de parseo para validación estructurada (ej. FastAPI):**
```javascript
if (Array.isArray(errData.detail)) {
  errorMessage = errData.detail.map(e => `${e.loc ? e.loc[e.loc.length-1] : 'Campo'}: ${e.msg}`).join('\n');
} else {
  errorMessage = errData.detail || 'Ocurrió un error inesperado';
}
```
