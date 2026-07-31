---
description: Verificación rápida del frontend — Revisa build, imports, marcas placeholders y estructura de componentes antes de deploy a entornos productivos.
---

# Workflow: Verificar Frontend (/verificar-frontend)

Ejecuta esta lista de comprobación antes de realizar despliegues (deploy) o al terminar el desarrollo de una funcionalidad relevante.

## 1. Verificación Estricta de Variables e Imports (Linter)
Antes de construir el proyecto, DEBES ejecutar el linter para atrapar `ReferenceError` y variables no definidas en JSX. 

> [!WARNING]
> **Falsos Positivos de Vite:** Herramientas como Vite empaquetan archivos JSX sin arrojar errores en tiempo de compilación si olvidaste importar un componente o ícono. ¡Un `npm run build` exitoso NO garantiza que la app no tenga fallos por `ReferenceError`!

```bash
npx eslint src/
```
Corrige cualquier variable, ícono (como `<Send />`) o componente no importado que reporte ESLint de forma inmediata.

## 2. Construcción Limpia (Build)
Ejecuta el script de compilación en el directorio del frontend para validar optimización:
```bash
npm run build
```
Corrige cualquier fallo antes de continuar.

## 2. Verificar Rutas y Lazy Imports
Inspecciona el enrutador principal (`App.jsx` o similar) y confirma:
- Las páginas se importan con carga diferida (lazy loading / dynamic imports) para optimizar el rendimiento.
- Todas las rutas están debidamente registradas y no existen declaraciones duplicadas.

## 3. Variables de Entorno y Configuración
- Compara los archivos `.env` y `.env.development` con `.env.example` (si existe).
- Verifica que todas las variables requeridas (ej. URLs de API base, IDs de autenticación de proveedores, etc.) tengan valores válidos y no placeholders de desarrollo.

## 4. Metadatos, Manifiesto y PWA
Si el proyecto cuenta con un manifiesto de PWA o configuraciones en el bundler (ej. `vite.config.js`):
- Confirma que el nombre del sitio web y los metadatos de accesibilidad correspondan al nombre de marca actual definido en `.agents/branding.json`.
- Valida que los iconos y rutas al directorio `public/` sean correctos y existan físicamente en el disco.

## 5. Eliminar Referencias a Marcas Anteriores o Boilerplates
Busca si hay nombres placeholders de plantillas o marcas heredadas que no coincidan con la marca configurada:
```bash
# Ejemplo de búsqueda de términos placeholder en el directorio de código:
npx -y grep -ri "marca-anterior-o-boilerplate" src/ --include="*.jsx" --include="*.js"
```
Reemplázalos por la marca correcta definida dinámicamente en tu configuración de branding.

## 6. Prevenir "God Components" (Límite de 300 Líneas)
Identifica si existen archivos que rompan el límite de 300 líneas en el código de frontend:
```bash
# Comando en Bash para identificar componentes gigantes en la carpeta src:
find src -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.tsx" -o -name "*.ts" \) -exec wc -l {} + | awk '$1 > 300'
```
Si se detecta algún archivo que sobrepase el límite, refactorízalo extrayendo componentes hijos o custom hooks.

## 7. Pruebas de Ejecución Local
Arranca el servidor de desarrollo y valida que inicie correctamente sin advertencias críticas de consola:
```bash
npm run dev
```

## 8. Preservación, Integridad de Módulos y Limpieza
Al realizar inserciones, refactorizaciones o imports de librerías:
- **Limpieza de Archivos Residuales**: Elimina de la raíz cualquier archivo temporal o script de ejecución única que hayas creado durante el desarrollo antes de marcar el trabajo como completado.
- **Robustez de Layout (Evitar Desbordamiento)**: Verifica visualmente y en simuladores móviles que las etiquetas horizontales, entradas (inputs) y botones de formularios usen `flex-wrap` o `flex-col` en móvil, garantizando que no se desborden de los límites del contenedor o el viewport.
- Evita duplicar importaciones en la parte superior del archivo.
- Mantener los módulos en inglés para consistencia técnica, y los textos para el usuario en español.
- En la terminal de Windows, no uses caracteres Unicode especiales (emojis complejos) al imprimir salidas o ejecutar scripts en la consola para prevenir problemas de codificación.

## 9. Verificación de Atributos de Testing (data-testid)
Asegura que todos los elementos con los que el usuario interactúa (botones, enlaces, inputs) tengan su atributo de pruebas unitarias:
```bash
# Ejemplo para buscar botones que carecen de data-testid en la carpeta src:
npx -y grep -rn "<button" src/ --include="*.jsx" | grep -v "data-testid"
```
Agrega los `data-testid` faltantes en los componentes modificados o nuevos.

## 10. Linter y Verificación de Duplicidad de Lógica
- Ejecuta `npx eslint src/` para garantizar que no haya imports faltantes o referencias sin declarar.
- Después del lint, utiliza `grep` o `rg` para buscar lógica duplicada antes de finalizar la tarea.
- Refactoriza cualquier código repetido en hooks o componentes reutilizables y actualiza los lugares donde se usa.
- Sólo después de pasar estos chequeos, procede a pruebas locales.

## 11. Revisión de Coherencia de Props (Prop-Drilling)
Si acabas de dividir o crear subcomponentes:
- Abre simultáneamente el archivo del componente padre y del componente hijo.
- Revisa manualmente que los atributos (props) que inyecta el padre coincidan letra por letra con las props que recibe el hijo.
- Recuerda que en arquitecturas JSX sin TypeScript estricto, enviar una prop mal nombrada no arrojará un error de compilación, pero romperá la aplicación para el usuario.

## 12. Inspección de Programación Defensiva y Simetría
- **Colecciones dinámicas:** Asegura que cualquier iteración sobre arreglos provenientes de respuestas de API posean fallbacks a arrays vacíos (`|| []`) antes de ejecutar métodos funcionales como `.map()` o `.filter()`.
- **Estado compartido:** Verifica que si tu componente lee datos de la URL (query params) o del LocalStorage, las claves coincidan exactamente con las que otros componentes (o hooks) usan para escribir esos datos.
