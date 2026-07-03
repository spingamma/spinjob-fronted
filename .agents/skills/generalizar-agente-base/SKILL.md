---
name: generalizar-agente-base
description: Analiza la conversación actual para generalizar y documentar aprendizajes, adaptando reglas (.agents/rules/), skills y workflows para que sirvan de base reutilizable en otros proyectos, obligando siempre a confirmar dudas con el usuario antes de editar.
---

# Skill: Generalizar Agente Base y Documentar Aprendizajes

Este skill se activa cuando el usuario solicita inmortalizar, generalizar o estructurar las lecciones, decisiones de diseño y lógicas críticas de la conversación actual para su reutilización como plantilla base en futuros proyectos.

## Objetivo
Analizar la trayectoria de la conversación, abstraer las soluciones particulares (colores específicos de marca, textos de saludos, cálculos de geolocalización) hacia reglas, skills o workflows genéricos, y actualizar la configuración de personalización del agente (`.agents/rules/`, `.agents/skills/`, `.agents/workflows/`).

---

## 🛠️ Directrices de Abstracción Genérica

Para que el agente pueda ser utilizado de forma efectiva como base en otro proyecto, debes documentar las reglas siguiendo estos principios de generalización:

### 1. Desacoplamiento de Identidad de Marca (Branding Dinámico)
* **Regla**: No hardcodear valores de colores (como `#1A535C` o `#6A431F`) ni copys textuales específicos directamente en las reglas universales.
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

### Paso 2: Diseño de la Propuesta de Generalización
* Diseña los textos o las estructuras de carpetas a modificar.
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
