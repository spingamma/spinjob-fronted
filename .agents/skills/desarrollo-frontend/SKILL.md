---
name: desarrollo-frontend
description: Úsala siempre que debas crear, estructurar, refactorizar o modificar cualquier componente o vista visual en el frontend. Regula el límite de líneas, el branding estricto y garantiza la persistencia vertical (full-stack).
---

# Skill: Desarrollo y Gestión de Frontend

## Cuándo usar
Esta habilidad es **obligatoria** y debe activarse automáticamente cada vez que el usuario te pida interactuar con el código frontend visual. Esto incluye:
- "Crea un componente..."
- "Agrega un input/botón a..."
- "Edita la vista de..."
- "Refactoriza el modal de..."

## Flujo Base (Aplica siempre)

### 1. Inicialización Estética (Branding Dinámico)
- El proyecto posee una paleta de branding estricta (usualmente en `.agents/branding.json` o similar). Si no existe, pregúntale al usuario sus colores y constrúyelo.
- Aplica SIEMPRE los colores y marcas cargadas de manera dinámica en lugar de quemar colores genéricos en los estilos.

### 2. Diseño, UI y Componentes Líquidos (Mobile-First)
- Usa tu motor de estilos base (Tailwind CSS, Vanilla, etc).
- Todos los diseños deben enfocarse primero en pantallas móviles.
- Evita fuertemente definir anchos fijos amplios (como `w-32` o botones de tamaño fijo en layouts flexibles). Usa `flex-wrap`, `flex-col`, o `sm:flex-1` para que los elementos se encojan y nunca se desborden.
- Incluye texturas modernas y micro-interacciones (hover, focus, transitions, glassmorphism) para ofrecer un look premium de fábrica.
- Los elementos multimedia o avatares SIEMPRE deben contar con fallbacks nativos (`onError`) apuntando a placeholders genéricos (ej. `ui-avatars.com`).

### 3. Integridad y Límite de Componente (Regla de las 300 Líneas)
- Un componente o vista individual **jamás debe superar las 300 líneas de código**.
- **Al crear:** Estructúralo desde un principio con abstracciones y modulación (varios archivos) si notas que el código crecerá más de este límite.
- **Al refactorizar/modificar:** Si al agregar código a un archivo existente superas este umbral, estás OBLIGADO a dividirlo extrayendo sus partes en subcomponentes antes de dar por finalizada la tarea.

---

## Flujo Estricto de Datos (Al agregar campos o interactividad)

### 4. Robustez de UI y Testing Automatizado
- Es obligatorio incluir el atributo `data-testid="tu-identificador"` en TODO elemento interactivo nuevo (botones, enlaces, modals, formularios). **Esta regla no es negociable.**
- Usa encadenamiento opcional (`?.`) y evaluaciones lógicas rígidas (`&&`) para prevenir caídas de aplicación por estados nulos.

### 5. Persistencia Vertical Completa (Full-Stack Data Slicing)
- 🚨 **Si añades, modificas o sugieres un nuevo campo de estado interactivo** (ej. un campo de cantidad, un botón de visibilidad, un checkbox de configuración):
   1. **Frontend:** Asegúrate de que el componente envíe correctamente la carga útil (JSON o FormData) a la API de backend.
   2. **Backend (Logica):** Dirígete inmediatamente a los Esquemas/DTOs de validación y a los Controladores (API Routers) para aceptar y retornar este nuevo campo.
   3. **Backend (Base de datos):** Modifica los Modelos/Entidades. Si la base de datos requiere migración (PostgreSQL, SQLite sin sincronización automática de columnas) asegúrate de ejecutar una instrucción `ALTER TABLE` o script de migración, informando al usuario. 
   4. Está absolutamente **prohibido** dejar un dato interactivo "flotando" solo en la memoria RAM (estado del frontend) si la intención es ser persistente.

---

## Ejecución Segura
- Al modificar código existente, **nunca borres callbacks (`onClose`, `onSubmit`, etc.) o `props` previamente implementadas** a menos que estés 100% seguro o que el usuario lo solicite expresamente, para evitar romper el flujo del componente padre.

## Reglas Específicas de Experiencia de Usuario (Errores Comunes)

### 6. Permisos de Ventanas Emergentes en Entornos de Desarrollo
- 🚨 **CRÍTICO:** Al implementar flujos de autenticación de terceros mediante ventanas emergentes (OAuth como Google/Firebase), debes asegurar explícitamente que el servidor de desarrollo (ej. Vite en `vite.config.js`) envíe las cabeceras `Cross-Origin-Opener-Policy: same-origin-allow-popups` para evitar bloqueos del navegador en `window.postMessage`.

### 7. Validación de Ciclo de Vida en Sub-componentes
- 🚨 **CRÍTICO:** Las validaciones críticas de sub-componentes interactivos o modales complejos deben evaluarse en el momento en que el usuario intenta interactuar con los mecanismos de salida locales (ej. botón de cerrar "X" o clic en el fondo oscuro), en lugar de delegar la responsabilidad únicamente al envío del formulario global (Submit) del componente padre.

### 8. Jerarquía de Capas (Z-Index) y Sincronización Visual
- 🚨 **CRÍTICO:** Al abrir modales de pantalla completa o sub-flujos intensivos, cualquier barra de acción global o persistente (floating action bars) debe ocultarse dinámicamente sincronizando su estado (renderizado condicional) con la apertura del modal. Depender exclusivamente de una jerarquía de `z-index` es insuficiente y propenso a inducir clics accidentales.
