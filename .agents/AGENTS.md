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
