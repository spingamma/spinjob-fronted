---
name: crear-modulo-api
description: Guía secuencial para generar un módulo API completo (Modelos, Esquemas, Rutas y Servicios) adaptado a las tecnologías del proyecto.
---

# Skill: Crear Módulo API

## Cuándo usar
Utiliza esta habilidad cuando el usuario solicite añadir una nueva entidad o recurso al sistema que requiera almacenamiento y exposición mediante endpoints.

## Flujo Secuencial (Paso a Paso)

### Paso 1: Pre-vuelo y Detección de Stack
1. Revisa el archivo `.agents/tech-stack.json`. Si no existe, pregúntale al usuario qué stack utilizar.
2. Analiza los modelos y enrutadores actuales para entender el patrón del proyecto.

### Paso 2: Capa de Base de Datos (Modelos)
1. Crea o edita el modelo de la entidad en su módulo respectivo (ej. `models/nueva_entidad.py` o `schema.prisma`).
2. Define las claves primarias (`id` UUIDv4) y las relaciones (Foreign Keys físicas).
3. 🚨 **Zero Orphans:** Si actualizas modelos, DEBES crear y ejecutar el script de migración (`ALTER TABLE` o Alembic/Prisma).

### Paso 3: Capa de Validación (Schemas / DTOs)
1. Crea los esquemas de validación (Pydantic, Zod) en la carpeta `schemas/`. NO uses un único archivo `schemas.py` gigante (Anti-God-Objects).
2. Genera los esquemas de entrada (`Create`, `Update`) y de salida (`Response`).
3. 🚨 **Anti-Ghosting de IDs:** Asegúrate de que el esquema `Response` SIEMPRE incluya el campo `id`.

### Paso 4: Capa Lógica (Servicios)
1. Crea la lógica de negocio pesada en la carpeta `services/` (ej. `services/nueva_entidad_service.py`).
2. Incluye aquí operaciones transaccionales, consultas complejas y llamadas a terceros.
3. Asegura el uso de bloques `try/except` con `db.rollback()` explícito.

### Paso 5: Capa de Presentación API (Routers / Controllers)
1. Crea el router en `routers/` (Skinny Routers).
2. Inyecta dependencias (base de datos, usuario actual) y llama a la capa de servicios.
3. 🚨 **Anti-Anonymous-Returns:** Tipa explícitamente el valor de retorno en la firma de la función (ej. `-> schemas.EntidadResponse`).

### Paso 6: Integración con Cliente (Opcional si aplica)
1. Si la tarea también incluye frontend, actualiza los servicios de red (`api.js`, `fetch`) del cliente para que envíen el payload correcto según los nuevos esquemas.

## Checklist Obligatorio antes de Finalizar
- [ ] ¿El modelo de BD, el Schema y la firma del Router coinciden 100%?
- [ ] ¿Se ejecutó o planeó la migración de la base de datos?
- [ ] ¿El Router delega la lógica pesada a `services/`?
- [ ] ¿Los esquemas están modularizados en `schemas/` y no en un archivo gigante?
- [ ] ¿El endpoint retorna explícitamente el `id`?
- [ ] ¿La firma del endpoint tiene el tipado de retorno explícito?
- [ ] ¿Las importaciones son explícitas (`from models import X` en lugar de `import models`)?

> **Nota:** Para conocer las restricciones formales de arquitectura, transacciones y seguridad, consulta el archivo `rules/04-backend-standards.md`.
