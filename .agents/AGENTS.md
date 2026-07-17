# Project-Scoped Rules

## 1. Obligatoriedad Absoluta de `data-testid`
🚨 **CRÍTICO:** Cada vez que edites, modifiques o crees un componente de frontend (React/JSX), **DEBES** revisar si estás agregando o modificando elementos interactivos o contenedores principales (`<input>`, `<button>`, `<a>`, `<select>`, modales, etc.).
- **Si agregas un nuevo elemento interactivo**, es **OBLIGATORIO** incluir el atributo `data-testid="..."`.
- **Si modificas un componente**, haz una revisión rápida para garantizar que los elementos clave (incluyendo los que agregaste) posean su `data-testid`.
- No asumas que es opcional. El ecosistema de testing automatizado depende **estrictamente** de la existencia de este atributo. No debes dar por finalizada ninguna tarea en el frontend sin antes verificar los `data-testid`.

## 2. Persistencia Vertical Completa (Full-Stack Data Slicing)
🚨 **CRÍTICO:** Cada vez que añadas, edites o implementes un nuevo campo de datos interactivo en la interfaz de usuario (ej. inputs de cantidades, textos, estados booleanos), **DEBES OBLIGATORIAMENTE** garantizar que la característica se implemente de extremo a extremo en todo el stack. Está prohibido dejar el dato existiendo únicamente en la memoria local (estado) del frontend si su propósito es ser persistente.

Antes de dar por finalizada la tarea, debes verificar:
1. **Base de Datos:** Los modelos, entidades o esquemas de la base de datos se actualizaron para incluir la nueva columna/campo. Y se previó el script de migración necesario si la base de datos ya está en producción.
2. **Capa de Lógica / API:** Los DTOs, esquemas de validación y los Controladores/Rutas se actualizaron para recibir, procesar y devolver el nuevo dato.
3. **Capa de Cliente (Frontend):** Las peticiones de red (JSON o FormData) envían efectivamente el nuevo valor a la API.

## 3. Transparencia de Skills Utilizadas
🚨 **CRÍTICO:** Cada vez que ejecutes una acción o des una respuesta al usuario, es **OBLIGATORIO** que declares explícitamente qué skills utilizaste (ej. `Para esto usé la skill desarrollo-frontend` o `generalizar-agente-base`). Esto le permite al usuario auditar el origen de tu comportamiento.

## 4. Prohibición de `git push` Autónomo
🚨 **CRÍTICO:** Está estrictamente **prohibido** que el agente ejecute el comando `git push` de forma autónoma o automática.
- El agente solo debe limitar su actividad a crear ramas, staging (`git add`), commits locales (`git commit`) y validaciones del build.
- La acción de subir los cambios al repositorio remoto (`git push`) debe ser siempre delegada al usuario, o bien solicitar aprobación explícita previa en el chat antes de ejecutarla.

## 5. Prevención de Duplicidad Funcional y de Efectos
🚨 **CRÍTICO:** Antes de escribir una nueva función, endpoint, `useEffect`, hook, manejador de eventos o cualquier lógica de procesamiento tanto en el frontend como en el backend, **DEBES** escanear exhaustivamente la estructura de archivos relacionados para verificar si un mecanismo similar ya está implementado en componentes superiores, controladores adyacentes o archivos de utilidad.
- Está estrictamente prohibido duplicar lógica funcional o disparadores de efectos que puedan inducir comportamientos redundantes, peticiones repetidas a APIs o inconsistencias en los datos.
- En su lugar, debes **reutilizar, extender o centralizar** el código en el módulo o componente de jerarquía correspondiente.


