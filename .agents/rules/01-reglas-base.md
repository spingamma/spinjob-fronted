# Reglas de Agente y Sincronización

## Eficiencia y Velocidad del Agente
1. **Paralelizar SIEMPRE:** Si necesitas leer N archivos o editar N archivos independientes, lanza TODAS las llamadas en paralelo.
2. **Direct Edit:** Cuando necesites buscar y reemplazar un texto global, usa `grep_search` y lanza los `replace_file_content` directos SIN leer los archivos enteros.
3. **Ediciones multi-chunk:** Si un archivo tiene múltiples cambios, usa `multi_replace_file_content` en 1 sola llamada.
4. **No leas para editar si ya sabes el contenido:** Un `grep_search` da línea exacta + contenido. Úsalo directo.
5. **Idioma:** Variables, funciones, archivos → inglés. Textos al usuario → español.

## Sincronización Full-Stack (Frontend ↔ Backend)
6. **Edición Cross-Repo:** Tienes acceso local al backend en `c:\Users\jhona\Desktop\spinjob-backend` y al frontend en `c:\Users\jhona\Desktop\spinjob-fronted`. Si un cambio en el frontend requiere modificar la base de datos o crear un endpoint, VE AL BACKEND y aplícalo tú mismo. NO des un prompt para que el usuario lo haga.
