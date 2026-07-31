# Estándares de Arquitectura Backend y Base de Datos

## Detección y Consulta de Tecnologías
1. **Verificación Inicial del Stack:** Al iniciar el trabajo en un nuevo proyecto, el agente debe auto-detectar las tecnologías utilizadas leyendo la estructura del repositorio (archivos como `package.json`, `requirements.txt`, `Cargo.toml`, etc.).
   - Si no se encuentra un stack preconfigurado, **pregunta activamente al usuario** qué tecnologías se utilizarán.
   - **Opciones por defecto:** Frontend (React+Vite), Backend (FastAPI+SQLAlchemy), BD (PostgreSQL/Neon).
   - Registra el stack en `.agents/tech-stack.json`.

## Infraestructura y Entorno (Anti-Infra-Naive)
2. **Orden Seguro de Carga de Entorno (Anti-Side-Effect):** 🚨 Cuando un módulo ejecuta side-effects a nivel de módulo (conexiones a BD, lectura de envs), está **ESTRICTAMENTE PROHIBIDO** importarlo antes de haber cargado y validado el entorno (`override=True`). Usa importación diferida (lazy import).
3. **Completitud de Entorno:** Cada vez que crees un `.env.example`, **DEBES OBLIGATORIAMENTE** escanear todas las variables requeridas en el código e incluirlas.
4. **Puertos y Healthchecks:** Usa puertos no estándar para testing. Todo servicio Docker **DEBE** incluir un healthcheck. Los scripts de infra deben usar "Fail-Fast" (`sys.exit(1)`).

## Arquitectura Limpia (Clean Architecture)
5. **Anti-God-Endpoints (Fat Services, Skinny Routers) y Refactor-On-Touch:** 🚨 Los controladores/routers **NUNCA** deben contener lógica de negocio compleja, iteraciones pesadas, llamadas a APIs externas o transacciones complejas. Debes delegar la lógica a `services/`. Adicionalmente, **si al modificar un router existente notas que incumple esta regla**, tienes el deber (Refactor-On-Touch) de extraer primero la lógica a un servicio antes de añadir tu nueva funcionalidad.
6. **Anti-God-Objects (Schemas/Models):** Está prohibido agrupar todos los esquemas, tipos o modelos en un solo archivo (ej. `schemas.py` de 500 líneas). Modulariza en directorios (ej. `schemas/user.py`, `schemas/business.py`).
7. **Importaciones Explícitas:** Prohibidas importaciones genéricas (ej. `import models`). Usa `from models import Business`.

## Bases de Datos (Resiliencia y Esquemas)
8. **Resiliencia de Conexión:** En SQLAlchemy usa `pool_pre_ping=True, pool_recycle=300`.
9. **Migración Obligatoria de Datos (Anti-Orphaned Data):** 🚨 Cuando modifiques, renombres o extraigas atributos de un modelo persistido en una base de datos relacional:
    - **Asume Schema Drift:** Comprende que las herramientas de sincronización aditiva (como ORMs sin migraciones) NO eliminarán las columnas antiguas ni migrarán automáticamente sus datos.
    - **Script Obligatorio:** Es ESTRICTAMENTE OBLIGATORIO crear y ejecutar un script de migración de datos para trasladar la información heredada a la nueva estructura. No asumas que funcionará para registros preexistentes sin este paso.
    - **Limpieza Pos-Migración:** Tras la ejecución exitosa, elimina inmediatamente el script de migración transitorio.
10. **Normalización:** Evita redundancia de datos. Vincula por FKs y expón por getters/properties. Prohibido aplicar `.ilike()` sobre propiedades virtuales.
11. **Aislamiento de Propiedades Virtuales en ORM:** 🚨 Nunca utilices propiedades calculadas a nivel de lenguaje (`@property`, getters virtuales) como condiciones en las cláusulas de filtro nativas del ORM (`filter()`, `or_()`). Las consultas deben realizar siempre un `JOIN` explícito con la tabla/entidad donde reside la columna real, y el filtro debe aplicarse estrictamente sobre entidades de la base de datos para evitar `TypeError`.
11b. **Instanciación Estricta de Modelos ORM (Anti-Invalid-Kwargs):** 🚨 Queda ESTRICTAMENTE PROHIBIDO pasar parámetros inventados o heredados de DTOs al instanciar un modelo de base de datos. Antes de instanciar y persistir una entidad (ej. en SQLAlchemy), **DEBES OBLIGATORIAMENTE** consultar la definición real del modelo (ej. `models.py`) para:
    1. Asegurar que no se envíen argumentos/atributos que no existan como columnas.
    2. Garantizar que **TODOS** los campos obligatorios (`nullable=False`) estén siendo poblados.
    3. Asegurar que los datos importantes del DTO/Schema entrante sean asignados explícitamente y no queden huérfanos (ej. IDs de trazabilidad).

## Autenticación, Seguridad e IDs
12. **Emisión de Identificadores (Anti-Ghosting):** 🚨 Al desarrollar endpoints que retornen datos, especialmente Autenticación, **ESTÁS OBLIGADO** a incluir el `id` primario en el payload/DTO de respuesta.
13. **Hashing Seguro:** Usa `bcrypt` o `argon2`.
13b. **Autorización Multi-Rol (Anti-Hardcoded-Ownership):** 🚨 Al filtrar entidades en la base de datos para validar permisos de acceso o modificación, queda **ESTRICTAMENTE PROHIBIDO** asumir ciegamente un único campo de propiedad (ej. filtrando solo por `propietario_id == actual.id`) si la lógica de negocio involucra roles secundarios. **DEBES OBLIGATORIAMENTE** inspeccionar el modelo para identificar si existen otros actores vinculados (ej. colaboradores, empresas asignadas, delegados) e incorporar todos los IDs válidos en la consulta (usando `or_()`), garantizando que ningún actor legítimo reciba un Falso Negativo (HTTP 404/403).

## Transacciones y API
14. **Transacciones Seguras:** Operaciones de escritura (POST, PUT, DELETE) deben realizarse dentro de bloques `try/except` con `db.rollback()` explícito en caso de error.
15. **Tipado de Retorno Explícito:** 🚨 Prohibido que un endpoint devuelva diccionarios crudos (`{"valid": True}`). Todos deben tipar su retorno explícitamente (`-> schemas.MiRespuesta:`) y devolver instancias validadas (DTO/Pydantic).
16. **Validación con Esquemas:** Toda petición entrante/saliente debe validarse estrictamente (Pydantic, Zod).
17. **Límites de Búsqueda:** Incorporar `limit(50)` o paginación por defecto.
18. **Validación de Variables Externas:** Verifica credenciales de terceros.
19. **Resiliencia en Rutas y Prevención de Enmascaramiento CORS:** 🚨 Nunca dejes variables de entorno o configuraciones faltantes como excepciones no manejadas (`ValueError`, `KeyError` raw) en la ruta crítica. Siempre intercepta estos errores y eleva un `HTTPException` adecuado (ej. 401 o 500) para permitir que los middlewares de CORS agreguen los encabezados necesarios, evitando que el frontend disfrace el crash del servidor como un simple error de CORS.
20. **Protección de Integridad Relacional (Anti-FK-Violation):** 🚨 Antes de implementar un endpoint de eliminación (`DELETE`), debes OBLIGATORIAMENTE revisar el esquema de base de datos para identificar todas las tablas que referencian al registro (Foreign Keys). Para evitar errores 500 por `ForeignKeyViolation`, debes desvincular los registros dependientes (ej. `SET NULL`) o implementar un borrado lógico (Soft Delete), según la lógica de negocio, **antes** de ejecutar la eliminación física del registro principal.

## Organización y Almacenamiento (Cloud & Assets)
21. **Organización Estructural de Recursos (Anti-Messy-Storage):** 🚨 Cada vez que propongas o modifiques rutas para guardar archivos, imágenes o assets en proveedores de nube (S3, Cloudinary, etc.) o sistemas de archivos, **ESTÁ ESTRICTAMENTE PROHIBIDO** inventar carpetas raíz globales de forma arbitraria. 
    - Debes OBLIGATORIAMENTE escanear e inferir la jerarquía óptima buscando usos previos de la herramienta de almacenamiento en el código base.
    - Se debe priorizar y respetar la arquitectura de separación por inquilinos (multi-tenant), estructurando las rutas alrededor de identificadores principales (ej. IDs de negocio o usuario) para mantener la base de datos y la nube siempre ordenadas.
22. **Zero Orphan Assets (Limpieza del Ciclo de Vida):** 🚨 Siempre que implementes la eliminación de un registro en la base de datos, o cuando limpies (`null` / `None`) una columna que referencie a un asset externo (imágenes, documentos en Cloudinary/S3), **ESTÁS OBLIGADO** a programar también la eliminación física de ese recurso a través de la API del proveedor, evitando dejar "huérfanos" (basura digital) que consuman almacenamiento innecesario.
