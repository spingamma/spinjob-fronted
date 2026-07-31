---
name: analizar-riesgo
description: Ejecuta la herramienta code-review-graph para analizar el impacto y riesgos de dependencias antes de realizar modificaciones profundas en el código.
---

# Workflow: Análisis de Riesgo con Code Graph

Estás ejecutando el workflow de análisis de impacto utilizando la herramienta local de grafos del usuario. 
Debes seguir estos pasos estrictamente ANTES de proponer o escribir cualquier código.

## Paso 1: Ejecutar la herramienta de análisis
Utiliza la herramienta `run_command` para ejecutar el análisis de riesgos siguiendo esta lógica condicional:

1. **Intento Principal (Requiere Git):** Ejecuta el siguiente comando:
   ```bash
   source /home/jhona/Desktop/code-review-graph-main/.venv/bin/activate && cd /home/jhona/Desktop/tarjetoso && code-review-graph detect-changes --brief
   ```
2. **Fallback (Si no hay Git):** Si el comando anterior falla indicando que no es un repositorio git, **NO te detengas**. En su lugar:
   - Ejecuta la construcción del grafo desde cero:
     ```bash
     source /home/jhona/Desktop/code-review-graph-main/.venv/bin/activate && cd /home/jhona/Desktop/tarjetoso && code-review-graph build
     ```
   - Luego, identifica qué archivos planeas modificar y ejecuta el análisis de impacto explícito:
     ```bash
     source /home/jhona/Desktop/code-review-graph-main/.venv/bin/activate && cd /home/jhona/Desktop/tarjetoso && code-review-graph impact --files [rutas/a/tus/archivos]
     ```

## Paso 2: Analizar los resultados
Lee detenidamente la salida del comando del Paso 1.
- Identifica qué componentes, archivos o módulos se ven afectados según el grafo.
- Presta especial atención a si el cambio solicitado podría romper dependencias en otros archivos que el usuario no mencionó.

## Paso 3: Reporte y Confirmación (Gate Obligatorio)
Redacta un mensaje para el usuario resumiendo el impacto.
- **NO escribas ni modifiques ningún código fuente todavía.**
- Informa al usuario sobre los riesgos encontrados (qué otros archivos se ven afectados por el cambio solicitado).
- Solicita permiso explícito al usuario para proceder con la codificación teniendo en cuenta estos riesgos.

## Paso 4: Ejecución
Solo después de que el usuario haya aprobado el reporte de riesgos del Paso 3, procede a realizar las modificaciones de código solicitadas, aplicando automáticamente las Skills correspondientes (como desarrollo-frontend o reglas globales).
