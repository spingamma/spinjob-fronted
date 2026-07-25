# Project-Scoped Rules

## 1. Obligatoriedad Absoluta de `data-testid`
🚨 **CRÍTICO:** Cada vez que edites, modifiques o crees un componente de frontend (React/JSX), **DEBES** revisar si estás agregando o modificando elementos interactivos o contenedores principales (`<input>`, `<button>`, `<a>`, `<select>`, modales, etc.).
- **Si agregas un nuevo elemento interactivo**, es **OBLIGATORIO** incluir el atributo `data-testid="..."`.
- **Si modificas un componente**, haz una revisión rápida para garantizar que los elementos clave (incluyendo los que agregaste) posean su `data-testid`.
- No asumas que es opcional. El ecosistema de testing automatizado depende **estrictamente** de la existencia de este atributo. No debes dar por finalizada ninguna tarea en el frontend sin antes verificar los `data-testid`.

## 2. Persistencia Vertical Completa (Full-Stack Data Slicing)
🚨 **CRÍTICO:** Cada vez que añadas, edites o implementes un nuevo campo de datos interactivo en la interfaz de usuario (ej. inputs de cantidades, textos, estados booleanos), **DEBES OBLIGATORIAMENTE** garantizar que la característica se implemente de extremo a extremo en todo el stack. Está prohibido dejar el dato existiendo únicamente en la memoria local (estado) del frontend si su propósito es ser persistente.

### 🔒 Gate Obligatorio: Backend-First para Datos Persistentes
**Antes de escribir una sola línea de frontend** que envíe datos persistentes (FormData, JSON con campos nuevos, uploads de archivos), el agente **DEBE** verificar que el backend ya acepta ese campo leyendo:
1. **La firma del endpoint** destino (parámetros declarados en la ruta/controlador).
2. **El modelo de base de datos** (columnas/campos de la entidad).
3. **El schema de respuesta** (DTO/Pydantic/Prisma que devuelve el dato al frontend).

Si **cualquiera** de los tres no soporta el nuevo campo → el backend se implementa **PRIMERO**, incluyendo migración de BD si es necesario. Solo después de confirmar la cadena completa (firma → modelo → schema) se procede a tocar el frontend.

### Checklist Pre-Cierre de Tarea
Antes de dar por finalizada la tarea, debes verificar:
1. **Base de Datos:** Los modelos, entidades o esquemas de la base de datos se actualizaron para incluir la nueva columna/campo. Y se previó el script de migración necesario si la base de datos ya está en producción.
2. **Capa de Lógica / API:** Los DTOs, esquemas de validación y los Controladores/Rutas se actualizaron para recibir, procesar y devolver el nuevo dato.
3. **Capa de Cliente (Frontend):** Las peticiones de red (JSON o FormData) envían efectivamente el nuevo valor a la API.
4. **Integridad de Props & Re-sincronización:** Los setters de props que comunican componentes deben propagar la totalidad de parámetros emitiendo archivos binarios/dataURL, y todo `useEffect` de reseteo debe mapear explícitamente el 100% de los campos de la entidad.

## 3. Transparencia de Skills Utilizadas
🚨 **CRÍTICO:** Cada vez que ejecutes una acción o des una respuesta al usuario, es **OBLIGATORIO** que declares explícitamente qué skills utilizaste (ej. `Para esto usé la skill desarrollo-frontend` o `generalizar-agente-base`). Esto le permite al usuario auditar el origen de tu comportamiento.

## 4. Prohibición de `git push` Autónomo
🚨 **CRÍTICO:** Está estrictamente **prohibido** que el agente ejecute el comando `git push` de forma autónoma o automática.
- El agente solo debe limitar su actividad a crear ramas, staging (`git add`), commits locales (`git commit`) y validaciones del build.
- La acción de subir los cambios al repositorio remoto (`git push`) debe ser siempre delegada al usuario, o bien solicitar aprobación explícita previa en el chat antes de ejecutarla.

## 5. Prevención de Duplicidad Funcional y de Efectos
🚨 **CRÍTICO:** Antes de escribir una nueva función, endpoint, `useEffect`, hook, manejador de eventos o cualquier lógica de procesamiento tanto en el frontend como en el backend, **DEBES** escanear exhaustivamente la estructura de archivos relacionados para verificar si un mecanismo similar ya está implementado en componentes superiores, controladores adyacentes o archivos de utilidad.
- Está estrictamente prohibido duplicar lógica funcional o disparadores de efectos que puedan inducir comportamientos redundantes, peticiones repetidas a APIs o inconsistencias en los datos.
## 6. Vías de Resolución para Estados Pendientes en Listados
🚨 **CRÍTICO:** Queda estrictamente prohibido presentar estados "pendientes" (ej. pedidos pendientes de pago, borradores o solicitudes no completadas) como simples etiquetas de texto estáticas.
- Todo elemento con estado pendiente dentro de un listado, historial o tarjeta **DEBE** incluir un botón de acción directo (`data-testid="pay-order-btn-..."` / `data-testid="resuelva-entidad-btn"`) que permita navegar inmediatamente a la vista de pago, seguimiento o completado del proceso.
## 7. Verificación Obligatoria de Imports (Prevención de ReferenceError)
🚨 **CRÍTICO:** Cada vez que insertes un nuevo componente de React, un ícono de una librería (ej. `lucide-react`, `heroicons`), un hook o cualquier símbolo externo dentro del código JSX/TSX, **DEBES OBLIGATORIAMENTE** subir a la cabecera del archivo y agregarlo a la sentencia `import` correspondiente.
- **Prohibido el "Fire and Forget":** No puedes asumir que el ícono o componente ya estaba importado. Siempre debes revisar las primeras líneas del archivo para confirmarlo o agregarlo.
- 🚨 **Vite Build es insuficiente:** Las herramientas de build como `vite build` a menudo NO detectan variables no definidas (`ReferenceError`) en tiempo de compilación si no están en archivos TypeScript estricto.
- Tras realizar cualquier modificación visual o agregar símbolos, **ESTÁS OBLIGADO** a ejecutar el linter (`npx eslint .` o el equivalente) **antes** de notificar al usuario que la tarea está lista, ya que es el único mecanismo que detectará variables y componentes no declarados antes de que la app falle en tiempo de ejecución.

## 8. Limpieza Estricta de Scripts Auxiliares (Anti-Basura)
🚨 **CRÍTICO:** Queda terminantemente prohibido dejar archivos basura, scripts de prueba (`scratch_*.py`, `test_*.js`) o scripts de migración únicos (`add_column_*.py`) en la raíz del proyecto tras finalizar una tarea.
- **Acción Obligatoria:** Si creas un archivo temporal para probar una función, extraer datos, o ejecutar un `ALTER TABLE` rápido en la base de datos, **DEBES ELIMINARLO INMEDIATAMENTE** usando comandos del sistema (ej. `rm -f archivo.py`) tan pronto como el script haya cumplido su propósito.
- Nunca des una tarea por concluida si el directorio de trabajo (frontend o backend) tiene archivos residuales que el usuario no debería subir al repositorio.
