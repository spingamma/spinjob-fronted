---
name: generalizar-agente-base
description: Analiza el historial de la conversación o los errores recientes para extraer, generalizar y refactorizar reglas, habilidades y flujos de trabajo. Úsala de forma OBLIGATORIA siempre que debas crear o corregir una regla/skill tras cometer un error, garantizando que la nueva instrucción sea agnóstica y reutilizable.
---

# Skill: Generalizar Agente Base y Filtro Meta-Cognitivo

## Propósito
Esta habilidad tiene dos objetivos principales:
1. **Filtro Meta-Cognitivo (Trigger Automático):** Actuar como un paso obligatorio *antes* de que el agente escriba o modifique cualquier regla (`rules/`) o habilidad (`skills/`) tras cometer un error. Su función es asegurar que la nueva regla no quede acoplada a una tecnología específica.
2. **Refactorización Global:** Analizar la conversación actual, extraer lecciones aprendidas y generalizarlas de forma abstracta para que puedan ser reutilizadas en otros proyectos.

## Flujo Secuencial (Paso a Paso)

### Paso 1: Leer el Transcript de la Conversación
1. Identifica el **ID de la conversación** actual (ubicado en tus variables de entorno o `<user_information>`).
2. Lee el archivo `transcript.jsonl` usando `grep_search` o `view_file` en `<appDataDir>/brain/<conversation_id>/.system_generated/logs/` para entender los problemas discutidos y los acuerdos alcanzados.

### Paso 2: Conciencia de Dominio y Análisis de Entorno (Context Awareness)
Antes de proponer o crear una nueva regla o skill, debes entender la lógica del repositorio en el que operas:
1. **Auditoría:** Revisa las carpetas `rules/` y `skills/` existentes (así como los flujos de trabajo actuales).
2. **Definición de Dominio:** Deduce de qué trata el repositorio (ej. "Este es un repositorio exclusivo de pruebas E2E", o "Este es un frontend").
3. **Alerta de Fuera de Contexto (Out-of-Scope Warning):** Si el requerimiento para crear una nueva regla o skill está **fuera de la lógica del ecosistema actual** (por ejemplo, crear una skill de desarrollo en un repositorio de testing, o reglas E2E en un frontend), tú, como Experto en IA, **DEBES detenerte y advertir al usuario explícitamente**. No crees la skill/regla a menos que el usuario apruebe esta anomalía.
4. **Preferencia por Mejora:** Evalúa a fondo las reglas existentes. Siempre es preferible fusionar, mejorar o adaptar una regla/skill existente antes que crear una nueva y desconectada.

### Paso 3: Diseño de Abstracción (Filtro Agnóstico)
Diseña las nuevas reglas o habilidades aplicando este filtro:
- **Agnosticismo de Framework:** 
  - ❌ `main.py` o `App.jsx` → ✅ `entry point` o `archivo principal`.
  - ❌ `useEffect` → ✅ `ciclo de vida del componente`.
  - ❌ `APIRouter` → ✅ `mecanismo de enrutamiento`.
- **Referencias a Repositorios:** Reemplaza nombres quemados por referencias genéricas (ej. `[repositorio_de_pruebas]`).

### Paso 4: Mapeo Contextual (Skills vs Global)
- NUNCA acumules reglas específicas de framework, UI o infraestructura en el archivo global `AGENTS.md`.
- Deposita las reglas específicas exclusivamente en los archivos correspondientes dentro de `rules/` (ej. `03-frontend-react.md` o `testing-standards.md`).
- Deja solo directivas universales y conductuales en `AGENTS.md`.

### Paso 5: Confirmación Interactiva (OBLIGATORIA)
1. **NUNCA modifiques las reglas sin antes confirmarlo con el usuario.**
2. Formula un plan o preguntas aclaratorias listando qué archivos vas a modificar y qué reglas genéricas vas a añadir.
3. Espera la aprobación explícita del usuario mediante el botón "Proceed" o en el chat.

### Paso 6: Escritura y Actualización
1. Tras la aprobación, realiza las modificaciones en `rules/` o `skills/`.
2. Valida que las nuevas reglas no entren en conflicto con las existentes.

## Directriz Especial de Testing
- **Testing First:** NUNCA utilices esta habilidad para documentar aprendizajes MIENTRAS haya pruebas fallando. La prioridad SIEMPRE es arreglar los tests. Sólo cuando el test pase (verde), puedes proceder a documentar.

## Checklist Obligatorio antes de Finalizar
- [ ] ¿Analizaste el dominio del repositorio y advertiste al usuario si la regla/skill estaba fuera de contexto?
- [ ] ¿La regla/skill nueva fue purgada de nombres específicos de frameworks o archivos?
- [ ] ¿El cambio se ubicó en `rules/` en lugar de inflar `AGENTS.md`?
- [ ] ¿Esperaste y recibiste la aprobación del usuario antes de editar los archivos?
- [ ] ¿Declaraste explícitamente en el chat que estás usando la skill `generalizar-agente-base`?
