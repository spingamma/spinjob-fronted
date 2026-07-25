---
name: generalizar-agente-base
description: Analiza el historial de la conversación o los errores recientes para extraer, generalizar y refactorizar reglas, habilidades y flujos de trabajo. Úsala de forma OBLIGATORIA (como Filtro Meta-Cognitivo silencioso) siempre que debas crear o corregir una regla/skill tras cometer un error, para garantizar que la nueva instrucción sea agnóstica a la tecnología y reutilizable en otros proyectos.
---

# Skill: Generalizar Agente Base y Documentar Aprendizajes (Filtro Meta-Cognitivo)

## Propósito
Esta habilidad tiene dos objetivos principales:
1. **Filtro Meta-Cognitivo (Trigger Automático)**: Actuar como un paso obligatorio *antes* de que el agente escriba o modifique cualquier regla (en `AGENTS.md`) o habilidad (en `SKILL.md`) tras cometer un error. Su función es asegurar que la nueva regla pase por un filtro de generalización y no quede acoplada a una tecnología específica.
2. **Refactorización Global**: Analizar la trayectoria de la conversación, abstraer las soluciones particulares hacia reglas, skills o workflows genéricos, y actualizar la configuración de personalización del agente.

---

## 🛠️ Directrices de Abstracción Genérica

Para que el agente pueda ser utilizado de forma efectiva como base en otro proyecto, debes documentar las reglas siguiendo estos principios de generalización:

### 1. Desacoplamiento de Identidad de Marca (Branding Dinámico)
* **Regla**: No codificar valores de forma rígida (hardcodear) en el código como colores (ej. `#1A535C` o `#6A431F`) ni copys textuales específicos directamente en las reglas universales.
* **Generalización**: Documentar que el sistema de diseño debe leer dinámicamente un archivo de configuración centralizado (ej. `.agents/branding.json` o variables de entorno) y que los componentes deben adaptarse automáticamente a esa paleta.

### 2. Estándares de Diseño y UI Flexibles
* **Evitar truncamiento rígido de texto**: Documentar que los textos importantes (como títulos de tarjetas o nombres de entidades) deben permitir envolturas automáticas de palabra (`break-words`) y expansión a múltiples líneas en lugar de recortarse con elipsis rígidas.
* **Componentes Minimalistas**: Documentar que los estados de entidad (como verificaciones, medallas) deben usar iconografía minimalista circular (`rounded-full`) sin etiquetas textuales redundantes para optimizar el espacio visual.
* **Distribución de Filtros Compactos**: Documentar que en layouts de filtrado móvil se debe priorizar una barra de filtros de fila única, adaptando el tamaño de los elementos y envolviendo el texto de los badges activos en multilínea para que entren de forma prolija.

### 3. Lógica Crítica y Condicionales de Dispositivo (Geolocalización)
* **Detección Dinámica de Coordenadas**: Documentar la precedencia y prioridades al procesar URLs geográficas (priorizar siempre la chincheta exacta `!3d/!4d` sobre el visor general `@`).
* **Visualización Condicional por GPS**: Documentar que los cálculos basados en geolocalización (como distancias y estimaciones de tiempo) solo deben activarse en dispositivos que cuenten con hardware de GPS (como móviles y tablets con soporte táctil) y únicamente si el usuario otorgó permisos de ubicación. En PCs de escritorio, esta visualización debe quedar completamente oculta.
* **Bypass de Filtros para Negocios de Entrega (Delivery)**: Documentar que cualquier filtro basado en distancia o tiempo de viaje debe contar con una excepción (bypass) para negocios con modalidad de entrega a domicilio, asegurando que sigan apareciendo en las búsquedas independientemente de su distancia física.

### 4. Robustez en Validaciones Coincidentes
* **Validación Concurrente**: Los límites de longitud en campos de texto clave (ej. nombres limitado a 30 caracteres) deben aplicarse concurrentemente:
  * **Físicamente en Frontend**: Mediante restricciones de caracteres en inputs (`maxLength`).
  * **Lógicamente en Frontend**: Mediante validaciones al enviar el formulario mostrando alertas descriptivas.
  * **Estrictamente en Backend**: Mediante excepciones estructuradas (HTTP 400) para evitar registros maliciosos o corruptos.

---

## 📋 Proceso de Ejecución (Paso a Paso)

Cuando ejecutes este skill, debes seguir estrictamente los siguientes pasos:

### Paso 1: Lectura e Investigación del Historial
* Lee el archivo de logs de la conversación actual (`transcript.jsonl`) o repasa los checkpoints anteriores.
* Identifica:
  * Decisiones clave de diseño.
  * Bugs de persistencia resueltos.
  * Lógicas condicionales implementadas (ej. el cálculo de Haversine y el bypass de delivery).
  * Validaciones críticas.

### Paso 2: Diseño de la Propuesta de Generalización y Distribución Contextual
* Diseña los textos o las estructuras de carpetas a modificar aplicando el filtro meta-cognitivo de abstracción de arquitectura pura:
  * **Sustituye términos acoplados**:
    * ❌ `main.py` o `app.js` → ✅ `entry point` o `archivo principal de configuración`.
    * ❌ `APIRouter` o `Express router` → ✅ `mecanismo de enrutamiento` o `route config files`.
    * ❌ `useEffect`, `initState`, etc. → ✅ `ciclo de vida del componente`.
  * **Referencias a Repositorios**: Reemplazarlas por referencias genéricas como `[repositorio_de_pruebas]` o parametrizarlas con `.env`.
* **Mapeo Contextual (Skills vs Global)**: NUNCA acumules reglas específicas de framework, UI o infraestructura en el archivo global `AGENTS.md`. 
  * Las reglas específicas deben depositarse exclusivamente en los archivos de las skills correspondientes (ej. `.agents/skills/desarrollo-frontend/SKILL.md` o `crear-modulo-api/SKILL.md`).
  * Solo las reglas absolutas, filosóficas o conductuales universales (que apliquen a cualquier petición, sin importar el código) deben ir a `.agents/AGENTS.md`.
* Redacta las propuestas de forma genérica (sin mencionar nombres del proyecto actual).

### Paso 3: Confirmación Interactiva Obligatoria ⚠️
> [!IMPORTANT]
> **NUNCA modifiques las reglas, skills o workflows sin antes confirmarlo con el usuario.**
> Debes formular una serie de preguntas aclaratorias detalladas en la conversación, listando las reglas que planeas agregar o modificar y esperando su aprobación explícita.

### Paso 4: Escritura y Actualización
* Una vez el usuario apruebe las propuestas, realiza las modificaciones correspondientes en los archivos de configuración:
  * Agrega o edita las reglas generales en los archivos de la carpeta [.agents/rules/](file:///.agents/rules/) (ej. `01-reglas-base.md`, `02-frontend-ui.md`, etc.).
  * Crea o pule skills en [skills/](file:///.agents/skills/).
  * Adapta las plantillas de workflows en [workflows/](file:///.agents/workflows/).
* Compila o valida que no haya errores de formato y resume los cambios realizados al usuario.
