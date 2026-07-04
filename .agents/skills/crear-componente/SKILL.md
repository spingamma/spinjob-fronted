---
name: crear-componente
description: Genera un nuevo componente UI en el frontend respetando la paleta de branding dinámica y el límite estricto de 300 líneas.
---

# Skill: Crear Componente

## Cuándo usar
Utiliza esta habilidad cuando el usuario te pida crear o estructurar componentes visuales o modulares (ej. "Agrega una tarjeta para mostrar X", "Crea un modal interactivo para Y", "Crea un componente de lista de Z").

## Pasos

### 1. Inicialización y Carga Estética (Branding)
- Revisa el archivo de configuración `.agents/branding.json` para obtener los colores primarios, secundarios y el nombre de la marca.
- Si no existe el archivo, **pregunta activamente al usuario** por el nombre de la marca y los colores, y crea el archivo `.agents/branding.json`.
- Aplica la paleta cargada dinámicamente en los estilos y textos del componente.

### 2. Ubicación y Estructura del Componente
- Crea el archivo dentro del directorio de componentes comunes (ej. `src/components/`) o dentro de una subcarpeta dedicada de una página o sección (ej. `src/pages/Panel/components/`).
- **LÍMITE ESTRICTO DE 300 LÍNEAS:** El componente nuevo no debe sobrepasar las 300 líneas. Si notas que la complejidad requiere más espacio, sepáralo de inmediato en múltiples subcomponentes pequeños en archivos separados y organízalos de manera modular.

### 3. Diseño y Estilos Reutilizables
- Usa las clases de tu motor de estilos (ej. Tailwind CSS).
- Implementa diseños responsivos enfocados en móviles (mobile-first).
- Evita anchos fijos amplios (ej. `w-32` o botones con ancho fijo) en etiquetas o inputs alineados horizontalmente. Usa `flex-wrap` o `flex-col` en móvil, con anchos adaptables (`w-full sm:flex-1`, `w-full sm:w-auto` para botones) para evitar que los elementos se desborden de los márgenes en pantallas pequeñas.
- Incorpora efectos estéticos modernos si el diseño del proyecto lo requiere (ej. glassmorphism `bg-white/10 backdrop-blur-md`, transiciones suaves de hover `transition-all duration-300`, y gradientes fluidos).
- Para imágenes y avatares de usuario, añade siempre un fallback mediante el evento `onError` apuntando a placeholders genéricos (ej. `ui-avatars.com`).

### 4. Robustez de Código y Testing
- **Atributos de Testing:** Es obligatorio agregar `data-testid="identificador-unico"` a todos los elementos con los que el usuario interactúa (botones, enlaces, modales, formularios, inputs).
- **Programación Defensiva:** Protege el renderizado de datos dinámicos utilizando encadenamiento opcional (`?.`) o evaluaciones lógicas (`&&`) para evitar que campos nulos o no definidos rompan el flujo de la aplicación.
