# Estándares de Arquitectura Backend y Base de Datos

## Detección y Consulta de Tecnologías
1. **Verificación Inicial del Stack:** Al iniciar el trabajo en un nuevo proyecto, el agente debe auto-detectar las tecnologías utilizadas leyendo la estructura del repositorio (archivos como `package.json`, `requirements.txt`, `Cargo.toml`, etc.).
   - **Flujo de Inicialización (Si no se detecta stack claro):**
     - Si no se encuentra un stack preconfigurado, **pregunta activamente al usuario** qué tecnologías se utilizarán en el frontend, backend y base de datos.
     - **Recomienda las tres opciones recomendadas por defecto:**
       - **Frontend:** React + Vite (con Tailwind CSS)
       - **Backend:** FastAPI + SQLAlchemy
       - **Base de Datos:** PostgreSQL / Neon DB
     - Registra el stack acordado en el archivo `.agents/tech-stack.json` en este formato para evitar futuras consultas:
       ```json
       {
         "frontend": "react-vite",
         "backend": "fastapi-sqlalchemy",
         "database": "postgresql-neon"
       }
       ```

## Bases de Datos (Resiliencia y Esquemas)
2. **Resiliencia de Conexión:** En bases de datos relacionales, asegura siempre configuraciones de pooling y reconexión activa.
   - En SQLAlchemy: `create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)`.
   - Evita desconexiones por inactividad (`OperationalError: SSL connection has been closed unexpectedly`).
3. **Zero Orphans (Gestión de Esquemas de BD):** Si eliminas, renombras o modificas una columna en los esquemas de código, ejecuta inmediatamente el script de migración correspondiente en el motor de base de datos para no dejar columnas ni tablas huérfanas. 
   - *Nota de compatibilidad:* No uses emojis ni caracteres complejos en los logs de los scripts ejecutados en consolas Windows para evitar excepciones de codificación (`UnicodeEncodeError`).
4. **Normalización (Relaciones y Llaves Foráneas):** Evita la redundancia de datos (no guardes nombres ni teléfonos de relaciones en la tabla hijo). Vincula tablas mediante llaves foráneas (`Foreign Keys`) y expón las propiedades necesarias mediante getters o propiedades dinámicas (ej. `@property` en Python).
5. **Filtros e Indexación:** No intentes aplicar filtros de consulta directa en base de datos (como `.ilike()`) sobre propiedades calculadas o getters virtuales; realiza la indexación y los filtros sobre columnas físicas.

## Autenticación y Seguridad
6. **Hashing Seguro de Contraseñas:** Usa algoritmos de hashing modernos y seguros directamente (`bcrypt`, `argon2`, etc.). NUNCA utilices librerías obsoletas o inseguras (como `passlib` sin parches).
7. **Identificadores (IDs):** Utiliza identificadores únicos robustos (`UUIDv4` o equivalentes de alta entropía) como clave primaria en lugar de enteros autoincrementales expuestos públicamente.

## Transacciones y API
8. **Transacciones Seguras:** Todas las operaciones de escritura (POST, PUT, DELETE) deben realizarse dentro de bloques `try/except` o gestores de contexto transaccionales. Asegúrate de ejecutar un rollback explícito en caso de error antes de propagar la excepción HTTP o retornar el error.
   - *Ejemplo en Python/SQLAlchemy:*
     ```python
     try:
         db.add(item)
         db.commit()
     except Exception as e:
         db.rollback()
         raise HTTPException(status_code=500, detail=str(e))
     ```
9. **Validación con Esquemas / DTOs:** Toda petición entrante y saliente del servidor debe estar validada mediante esquemas estrictos (ej. Pydantic en FastAPI, Zod/Joi en Node.js). Utiliza mapeos automáticos eficientes (ej. `from_attributes = True` o `orm_mode` en Pydantic).
10. **Límites de Búsqueda y Paginación:** Toda consulta de listados para la interfaz de usuario debe incorporar límites razonables de datos por defecto (`limit(50)` o paginación explícita) para prevenir sobrecarga de memoria o fallos en componentes de visualización.
11. **Validación Robusta de Variables de Entorno de Terceros (OAuth / SMTP):** Toda funcionalidad que dependa de credenciales o configuraciones externas en el `.env` (como `GOOGLE_CLIENT_ID`, `SMTP_PASSWORD`, etc.) debe verificar su existencia y validez de forma segura:
    * **NUNCA** lances excepciones no controladas de Python (como `ValueError` o `KeyError`) fuera de bloques `try/except` o fuera del flujo de excepciones HTTP de FastAPI.
    * Captura estas faltas de configuración y eleva excepciones HTTP estructuradas (ej: `HTTPException(status_code=500, detail="Configuración de autenticación faltante en servidor")`). Esto garantiza que el middleware de CORS pueda adjuntar los headers de respuesta correctos en la respuesta de error en lugar de generar un bloqueo silencioso en el navegador con un error `500 / net::ERR_FAILED`.

