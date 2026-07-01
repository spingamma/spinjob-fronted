# Clean Code React y Estructura

## Límites y Arquitectura
1. **LÍMITE ESTRICTO DE 300 LÍNEAS:** Ningún componente, hook o página debe exceder las 300 líneas. Si se acerca a esto, extrae lógica a un Custom Hook (`hooks/`) o a subcomponentes (`components/`). 1 responsabilidad por archivo.
2. **DRY + SRP:** Lógica repetida se vuelve Custom Hook. Componentes repetidos van a `src/components/`.

## Reglas Críticas de Testing e Interacción
3. **Testing Hooks (OBLIGATORIO EXTREMO):** 🚨 SIEMPRE agrega atributos `data-testid="..."` a TODOS los elementos interactivos (botones, inputs, `<a>`, modales). ES UN ERROR GRAVE olvidar esto.
4. **Reposición exacta (Oxc/Vite):** Cuidado al borrar JSX. Si borras un div de cierre `</div>` huérfano, romperás el árbol y causarás "Unexpected token". Lee el archivo con `view_file` hacia arriba si dudas.

## Estado, Hooks y Modales
5. **Early returns:** NUNCA retornes antes de que TODOS los hooks (useMemo, useEffect, etc.) hayan sido invocados.
6. **Listas con estado:** Si cada ítem necesita estado propio (ej. "Ver más"), extrae un sub-componente (`ProductCard`). No uses arrays de estado en el padre.
7. **Modales anidados:** Si un modal abre otro, usa React Fragment `<>...</>` como wrapper y renderiza el hijo FUERA del div backdrop del padre.
8. **Acciones protegidas:** Click en redes/WhatsApp sin sesión → forzar `AuthModal`.

## Lógica de Filtrado con IDs Mixtos (Base de datos vs Temporales)
9. **Filtros aislados:** Al trabajar con listas de elementos que mezclan registros ya guardados (con `id`) y temporales (con `tempId`), aísla la validación en el `.filter()`. 
**NUNCA USES ESTA FORMA:**
```javascript
// INCORRECTO: p.tempId !== product.tempId evaluará a 'undefined !== undefined' -> 'false'.
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
10. **Fechas Locales vs UTC:** NUNCA uses `new Date().toISOString().split('T')[0]` para obtener la fecha de "hoy" en el frontend si el backend usa fechas locales. Esto causa bugs de filtrado donde la fecha salta al "día siguiente" en la tarde-noche por la diferencia horaria con UTC. 
**FORMA CORRECTA:** Usa los métodos locales de `Date` para construir strings de fecha de forma robusta frente al timezone del navegador:
```javascript
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
```

## Formularios y Manejo de Errores
11. **Campos Obligatorios:** Todo campo obligatorio en un formulario debe indicar explícitamente su obligatoriedad usando un asterisco rojo (`<span className="text-red-500">*</span>`) en su label o a su lado.
12. **Validación Frontend (Prevención 422):** Nunca confíes solo en la validación del backend. Valida en el cliente (frontend) que los campos obligatorios no estén vacíos antes de hacer el fetch. Esto evita errores 422 (Unprocessable Entity).
13. **Parseo de Errores FastAPI:** NUNCA pases el `errData.detail` crudo a un `Error` o `alert()` sin verificar su tipo. Si FastAPI devuelve un error de validación (array de objetos), al convertirlo a string se verá como `[object Object]`. Parsea el array a un string legible:
```javascript
if (Array.isArray(errData.detail)) {
  errorMessage = errData.detail.map(e => `${e.loc ? e.loc[e.loc.length-1] : 'Campo'}: ${e.msg}`).join('\n');
}
```
