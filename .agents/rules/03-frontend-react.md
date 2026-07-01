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
