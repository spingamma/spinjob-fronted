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
- 🚨 **Auditoría Estricta de Símbolos (Linter Obligatorio):** Al agregar elementos visuales o componentes de librerías externas (`lucide-react`, `heroicons`, etc.) en JSX/TSX, **ESTÁS OBLIGADO a ejecutar el linter (`npx eslint .`)** para validar tu código. Vite o bundlers similares NO detectan `ReferenceError`s por variables no importadas en archivos JSX puros, por lo que una construcción exitosa no garantiza que la aplicación no falle en tiempo de ejecución. No asumas que el componente está importado; verifícalo con el linter.

### 5. Persistencia Vertical Completa (Full-Stack Data Slicing)
- 🚨 **Si añades, modificas o sugieres un nuevo campo de estado interactivo** (ej. un campo de cantidad, un botón de visibilidad, un checkbox de configuración):
   **0. 🔒 Verificación Bloqueante Pre-Frontend (Gate Backend-First):** Al detectar que una feature involucra persistencia de archivos o datos nuevos, **ANTES** de tocar cualquier archivo de componente visual, el agente **DEBE** escanear: (a) la firma del endpoint destino del backend (parámetros declarados), (b) el modelo de BD (columnas de la entidad), (c) el schema/DTO de respuesta. Si **cualquiera** de los tres no soporta el nuevo campo → implementar backend **PRIMERO** (modelo + migración + schema + firma del endpoint). Solo entonces proceder al frontend. **Está terminantemente prohibido** crear lógica de envío, preview o almacenamiento local de un dato en frontend sin confirmar que el backend lo persiste.
   1. **Frontend:** Asegúrate de que el componente envíe correctamente la carga útil (JSON o FormData) a la API de backend.
   2. **Backend (Logica):** Dirígete inmediatamente a los Esquemas/DTOs de validación y a los Controladores (API Routers) para aceptar y retornar este nuevo campo.
   3. **Backend (Base de datos):** Modifica los Modelos/Entidades. Si la base de datos requiere migración (PostgreSQL, SQLite sin sincronización automática de columnas) asegúrate de ejecutar una instrucción `ALTER TABLE` o script de migración, informando al usuario. 
   4. **Mapeo Completo en Re-sincronización de Estado:** Al re-sincronizar el estado local de un formulario desde una entidad remota o props (ej. en `useEffect` al alternar entre lectura y edición), **todos y cada uno de los campos persistentes** deben ser mapeados explícitamente en el objeto de reinicialización. Omitir propiedades en los bloques de reseteo causa pérdida silenciosa de datos.
   5. **Conversión Multipart para Cargas de Archivos:** Al enviar imágenes/medios seleccionados mediante `<input type="file">`, si la entrada se lee inicialmente como dataURL/base64, el frontend debe convertir la cadena base64 en un objeto `Blob/File` binario real antes de adjuntarlo a `FormData`. Enviar cadenas base64 directas a endpoints que esperan subida binaria (`UploadFile`) causa que la API rechace o ignore el archivo.
   6. **Protección e Hidratación Inteligente de Borradores:** 
      - Mecanismos de borrador local (`localStorage.setItem`) deben omitir objetos `File` pesados y cadenas base64 gigantes antes de serializar JSON, para evitar fallos por `QuotaExceededError` en el navegador.
      - **Fallback a la Entidad Servidor:** Al restaurar borradores locales al abrir/editar un formulario, **ningún campo vacío o vaciado en el borrador debe sobreescribir datos válidos del servidor**. Todo atributo restaurado desde borrador debe aplicar un fallback explícito hacia la entidad remota (`draft.campo || serverEntity.campo`) para evitar que borradores obsoletos borren la información oficial.
   7. Está absolutamente **prohibido** dejar un dato interactivo "flotando" solo en la memoria RAM (estado del frontend) si la intención es ser persistente.

---

## Ejecución Segura
- Al modificar código existente, **nunca borres callbacks (`onClose`, `onSubmit`, etc.) o `props` previamente implementadas** a menos que estés 100% seguro o que el usuario lo solicite expresamente, para evitar romper el flujo del componente padre.
- 🚨 **Integridad de Firmas en Callbacks Props:** Al definir callbacks inline en props para componentes hijos (ej. `setPaymentQrImage={(val, fileObj) => ...}`), la firma de la función prop debe aceptar y propagar explícitamente **todos los argumentos** emitidos por el componente hijo. Truncar parámetros en la declaración de la prop (ej. ignorar el segundo parámetro `fileObj`) rompe la comunicación y pierde datos silenciosamente.

## Reglas Específicas de Experiencia de Usuario (Errores Comunes)

### 6. Permisos de Ventanas Emergentes en Entornos de Desarrollo
- 🚨 **CRÍTICO:** Al implementar flujos de autenticación de terceros mediante ventanas emergentes (OAuth como Google/Firebase), debes asegurar explícitamente que el servidor de desarrollo (ej. Vite en `vite.config.js`) envíe las cabeceras `Cross-Origin-Opener-Policy: same-origin-allow-popups` para evitar bloqueos del navegador en `window.postMessage`.

### 7. Validación de Ciclo de Vida y UX Progresiva en Sub-componentes
- 🚨 **CRÍTICO:** Las validaciones críticas de sub-componentes interactivos o modales complejos deben evaluarse en el momento en que el usuario intenta interactuar con los mecanismos de salida locales (ej. botón de cerrar "X", clic en el fondo oscuro o tecla `Esc`), en lugar de delegar la responsabilidad únicamente al envío del formulario global (Submit) del componente padre.
- 🎨 **UX Progresiva para Campos Requeridos Vacíos:** Los campos requeridos pero vacíos en estado de reposo **jamás deben presentar estilos de error o alarma agresivos** (exceso de texto rojo, bordes rojos pronunciados o banners alarmistas) antes de la interacción. Deben emplear la paleta neutra del sistema de diseño, bordes sutiles y distintivos discretos (`*` o badge `Requerido`). Las alertas de alto contraste (rojo) únicamente deben aparecer de forma dinámica cuando el usuario intente guardar o salir sin completar el campo.

### 8. Jerarquía de Capas (Z-Index) y Sincronización Visual
- 🚨 **CRÍTICO:** Al abrir modales de pantalla completa o sub-flujos intensivos, cualquier barra de acción global o persistente (floating action bars) debe ocultarse dinámicamente sincronizando su estado (renderizado condicional) con la apertura del modal. Depender exclusivamente de una jerarquía de `z-index` es insuficiente y propenso a inducir clics accidentales.

### 9. Sincronización Automática con Repositorio de Pruebas (E2E) y Protocolo de Comunicación
- 🚨 **CRÍTICO:** Cada vez que finalices cambios en el frontend, debes aplicar la skill `sync-ui-changes` del repositorio `tarjetoso-tests` para mantener la consistencia de las pruebas.
- **Protocolo de Envío de Cambios (Handoff a QA):**
  1. Redacta un reporte consolidando las modificaciones del flujo de negocio realizadas.
  2. **Obligatoriamente**, detén tu ejecución y pide aprobación explícita al usuario en el chat antes de transmitir esta información al agente QA.
  3. Tras la aprobación, procede a enviar la información (o delegar la validación) al agente QA.
- **Regla de Granularidad E2E (El Filtro de Flujos Largos):**
  - Está strictly prohibido crear pruebas unitarias visuales o tests redundantes para pequeños cambios cosméticos (color de botón, tamaño, textos estáticos). Los escenarios BDD (`.feature`) solo deben representar flujos de negocio completos y largos de extremo a extremo.
  - Si un cambio cosmético rompe un localizador de un flujo largo existente, se debe actualizar el localizador en el Page Object Model (POM), pero sin añadir nuevos escenarios.

### 10. Vías de Acción Directa para Estados Pendientes en Listados
- 🚨 **CRÍTICO:** Todo listado, tabla, historial o tarjeta de cliente/negocio que renderice elementos en estado "pendiente" (ej. pedidos pendientes de pago, solicitudes pendientes de aprobación, registros en borrador) **debe incluir obligatoriamente un botón de acción directo y visible** (`data-testid="resuelva-entidad-btn"`) que conduzca al usuario a la vista de resolución o pago correspondiente. Queda estrictamente prohibido presentar estados pendientes como etiquetas estáticas sin mecanismos de interacción para completar o pagar la transacción.

