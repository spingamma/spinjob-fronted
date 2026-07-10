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
