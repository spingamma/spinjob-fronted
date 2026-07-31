---
name: desarrollo-backend
description: Guía secuencial para desarrollar en el backend (crear nuevos módulos o modificar/refactorizar existentes), asegurando Clean Architecture y previniendo controladores gigantes (Spaghetti Routers).
---

# Skill: Desarrollo Backend (Creación y Modificación)

## Cuándo usar
Utiliza esta habilidad cuando el usuario solicite añadir, modificar o refactorizar una entidad, recurso o endpoint del backend.

## 🚨 REGLA DE ORO: Refactor-On-Touch
Si estás aquí para **modificar** un endpoint existente y notas que el Router contiene lógica pesada (queries a base de datos, parseos manuales, interacciones con nube), **ESTÁS OBLIGADO a extraer esa lógica a la capa `services/` ANTES de añadir tu nueva funcionalidad**.

---

## Flujo Secuencial (Paso a Paso)

### Paso 1: Pre-vuelo y Normativas (Obligatorio)
1. Antes de escribir una sola línea de código, lee `rules/04-backend-standards.md`.
2. Si vas a modificar algo existente, lee el código actual. Si no respeta el patrón de delegación (`Router -> Service`), avisa al usuario que primero harás una refactorización de limpieza.

### Paso 2: Capa de Base de Datos (Modelos)
1. Crea o edita el modelo de la entidad en su módulo respectivo (ej. `models/nueva_entidad.py` o `schema.prisma`).
2. Define claves primarias e índices.
3. 🚨 **Zero Orphans:** Si actualizas modelos, DEBES crear y ejecutar el script de migración (`ALTER TABLE` o Alembic/Prisma).

### Paso 3: Capa de Validación (Schemas / DTOs)
1. Crea/edita los esquemas de validación (Pydantic, Zod) en `schemas/`. NO uses un único archivo gigante.
2. 🚨 **Anti-Ghosting de IDs:** Asegúrate de que el esquema de respuesta SIEMPRE incluya el campo `id`.

### Paso 4: Capa Lógica (Servicios) - ¡Aquí va la lógica pesada!
1. Crea o modifica la lógica en la carpeta `services/` (ej. `services/user_service.py`).
2. Incluye aquí operaciones transaccionales, consultas complejas, límites de negocio y llamadas a terceros (ej. Cloudinary).
3. 🚨 **Anti-FK-Violation:** Si desarrollas un servicio de eliminación, asegúrate de desvincular o hacer soft-delete de las relaciones dependientes antes de borrar el registro padre.

### Paso 5: Capa de Presentación API (Routers / Controllers) - ¡Skinny Routers!
1. Modifica o crea el router en `routers/`.
2. El Router **SOLO** debe encargarse de:
   - Validar la entrada (vía inyección de dependencias).
   - Inyectar la sesión de Base de Datos (`db`) y el Usuario Actual.
   - Retornar el resultado del Servicio.
3. 🚨 **Anti-God-Endpoints:** ESTÁ PROHIBIDO poner `db.query()`, bucles `for` complejos o variables temporales masivas dentro del Router.

## Checklist Obligatorio antes de Finalizar
- [ ] ¿Modificaste un endpoint existente? Si es así, ¿extrajiste su lógica heredada a `services/` primero?
- [ ] ¿El modelo de BD, el Schema y la firma del Router coinciden 100%?
- [ ] ¿El Router delega toda la lógica pesada a `services/` (Skinny Router)?
- [ ] ¿El endpoint de eliminación gestiona correctamente las llaves foráneas?
- [ ] ¿Comprobaste la sintaxis (ej. `python -m py_compile`) de los archivos modificados?
