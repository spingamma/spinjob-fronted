# Project-Scoped Rules

## 1. Obligatoriedad Absoluta de `data-testid`
🚨 **CRÍTICO:** Cada vez que edites, modifiques o crees un componente de frontend (React/JSX), **DEBES** revisar si estás agregando o modificando elementos interactivos o contenedores principales (`<input>`, `<button>`, `<a>`, `<select>`, modales, etc.).
- **Si agregas un nuevo elemento interactivo**, es **OBLIGATORIO** incluir el atributo `data-testid="..."`.
- **Si modificas un componente**, haz una revisión rápida para garantizar que los elementos clave (incluyendo los que agregaste) posean su `data-testid`.
- No asumas que es opcional. El ecosistema de testing automatizado depende **estrictamente** de la existencia de este atributo. No debes dar por finalizada ninguna tarea en el frontend sin antes verificar los `data-testid`.
