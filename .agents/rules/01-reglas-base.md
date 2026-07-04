# Reglas de Agente y Sincronización

## Eficiencia y Velocidad del Agente
1. **Paralelizar SIEMPRE:** Si necesitas leer N archivos o editar N archivos independientes, lanza TODAS las llamadas en paralelo.
2. **Direct Edit:** Cuando necesites buscar y reemplazar un texto global, usa `grep_search` y lanza los `replace_file_content` directos SIN leer los archivos enteros.
3. **Ediciones multi-chunk:** Si un archivo tiene múltiples cambios, usa `multi_replace_file_content` en 1 sola llamada.
4. **No leas para editar si ya sabes el contenido:** Un `grep_search` da línea exacta + contenido. Úsalo directo.
5. **Idioma:** Variables, funciones, archivos → inglés. Textos al usuario → español.

## Sincronización Full-Stack (Frontend ↔ Backend)
6. **Edición Cross-Repo / Monorepo:** Tienes acceso local al código de frontend y backend (normalmente en la raíz o en directorios hermanos como `./frontend` y `./backend`, o carpetas adyacentes en el workspace). Si un cambio en el frontend requiere modificar la base de datos o crear un endpoint, localiza el directorio del backend y aplica el cambio tú mismo. NO des un prompt para que el usuario lo haga.

## Confirmación Obligatoria de Decisiones (Alineación Preventiva)
7. **Confirmar Dudas y Planes:** Antes de realizar cualquier cambio en archivos fuente del proyecto, el agente debe presentar su propuesta/plan de cambios y formular preguntas aclaratorias detalladas si existe alguna duda o ambigüedad sobre la implementación, el diseño, la lógica o el alcance. Esto asegura una alineación absoluta con el usuario antes de alterar el código.

## Limpieza de Archivos Temporales y Scripts
8. **Limpieza de Archivos Temporales y Scripts**: Todos los archivos temporales de ejecución única (como scripts de migración manual, scripts de prueba rápidos, inserts temporales, etc.) creados en la raíz del proyecto **deben ser eliminados** inmediatamente después de haber sido ejecutados con éxito. No se deben dejar archivos huérfanos que ensucien la estructura del proyecto a menos que formen parte de una carpeta estructurada y permanente (como herramientas de migración automatizadas tipo *Alembic*).
