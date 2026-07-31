# Project-Scoped Rules (Manifiesto Global)

Estas reglas son universales para cualquier especialidad técnica y tienen prioridad absoluta.

## 1. Persistencia Vertical Completa (Full-Stack Data Slicing)
🚨 **CRÍTICO:** Cada vez que añadas, edites o implementes un nuevo campo de datos interactivo en la interfaz de usuario, **DEBES OBLIGATORIAMENTE** garantizar que la característica se implemente de extremo a extremo.

### 🔒 Gate Obligatorio: Backend-First para Datos Persistentes
**Antes de escribir una sola línea de frontend** que envíe datos persistentes, el agente **DEBE** verificar que el backend ya acepta ese campo leyendo:
1. **La firma del endpoint**
2. **El modelo de base de datos**
3. **El schema de respuesta**

Si cualquiera no lo soporta → el backend se implementa **PRIMERO**.

### 🛡️ Sincronización Estricta de Formularios (Form Data Shield)
**Es OBLIGATORIO** asegurar el puente completo de datos:
1. **Inicialización**: El campo debe existir en el estado inicial del frontend (ej. al editar).
2. **Recepción Backend**: Debe estar explícito en los parámetros de recepción del controlador/router (`Form`, schema `Pydantic`, etc.).
3. **Asignación Servicio**: Debe mapearse y asignarse explícitamente en la función de servicio/ORM. 
Una simple migración de BD no es suficiente para que los datos fluyan.

## 2. Transparencia de Skills Utilizadas
🚨 **CRÍTICO:** Cada vez que ejecutes una acción o des una respuesta al usuario, es **OBLIGATORIO** que declares explícitamente qué skills utilizaste (ej. `Para esto usé la skill desarrollo-frontend`).

## 3. Prohibición de `git push` Autónomo
🚨 **CRÍTICO:** Está estrictamente **prohibido** que el agente ejecute el comando `git push` de forma autónoma.
- La acción de subir los cambios al repositorio remoto debe ser siempre delegada al usuario.

## 4. Prevención de Duplicidad Funcional y de Efectos
🚨 **CRÍTICO:** Antes de escribir una nueva función, endpoint o hook, **DEBES** escanear la estructura de archivos relacionados para verificar si un mecanismo similar ya está implementado. Está estrictamente prohibido duplicar lógica funcional.

## 5. Limpieza Estricta de Scripts Auxiliares (Anti-Basura)
🚨 **CRÍTICO:** Queda terminantemente prohibido dejar archivos basura o scripts de prueba (`scratch_*.py`) en el proyecto. **DEBES ELIMINARLOS INMEDIATAMENTE** tras cumplir su propósito.

## 6. Prohibición Estricta de Alucinación (Anti-Inventiva)
🚨 **CRÍTICO:** Cuando detectes una discrepancia en valores duros (URLs, configuraciones), **tienes estrictamente prohibido inventar o asumir** el origen de esa discrepancia. Limítate a informarlo objetivamente y preguntar al usuario.

## 7. Normalización de Referencias (Single Source of Truth)
🚨 **CRÍTICO:** Cuando relaciones entidades (ej. un negocio que depende de un servicio de un tercero), **NUNCA** guardes valores mutables (como precios, tarifas o nombres) dentro de cadenas estáticas, arrays o JSON en la base de datos local. Almacena únicamente el identificador (ID/slug) y resuelve los valores mutables consultando la fuente original en tiempo de ejecución. 

## 8. Trazabilidad de Feature Flags (Banderas de Entorno)
🚨 **CRÍTICO:** Si implementas, diagnosticas o modificas una característica condicionada por una variable de entorno (`VITE_*`, `process.env`, etc.), **DEBES verificar inmediatamente** su existencia y valor en los archivos de entorno locales (ej. `.env`, `.env.development`). Nunca asumas su existencia; si falta, aplica un valor por defecto seguro, añádela a la configuración o advierte al usuario explícitamente.

## 9. Separación Estricta de Responsabilidades (Anti-Spaghetti / Refactor-On-Touch)
🚨 **CRÍTICO:** Queda ESTRICTAMENTE PROHIBIDO mezclar lógica de negocio pesada, reglas complejas de base de datos, parseos de datos masivos o integraciones de terceros directamente en la capa de presentación (ej. Routers HTTP de Backend, Controladores, o Componentes UI de Frontend). Toda lógica compleja **DEBE** delegarse a una capa especializada (ej. `services/` en backend, o *custom hooks/services* en frontend). Si al modificar o tocar un archivo existente detectas que rompe esta regla, **DEBES** refactorizarlo separando la lógica antes de añadir código nuevo (Política *Refactor-On-Touch*).
