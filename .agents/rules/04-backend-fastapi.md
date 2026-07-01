# Estándares de Arquitectura Backend (Tarjetoso)

## Bases de Datos (Neon DB)
1. **Resiliencia:** `create_engine(URL, pool_pre_ping=True, pool_recycle=300)`.
2. **Zero Orphans (Gestión de Esquemas):** Si eliminas un campo de un modelo SQLAlchemy, SIEMPRE ejecuta un script de migración temporal (`ALTER TABLE DROP COLUMN`) en Neon DB. Nunca dejes columnas huérfanas. NUNCA uses emojis en scripts de consola Windows (`cp1252`).
3. **Normalización (Relaciones):** Prohibido guardar datos replicados (`user_phone`, `user_name`). Usa `user_id` Foreign Key y expón con `@property`.
4. **Filtros en Properties:** NUNCA usar filtros `.ilike()` sobre campos calculados o properties de SQLAlchemy.

## Autenticación y Seguridad
5. **Hashing Estricto:** Usa `bcrypt` directo. PROHIBIDO `passlib`.
6. **IDs:** Usa `generate_uuid()` basada en `uuid.uuid4()`.

## Transacciones y API
7. **Transacciones Seguras:** `db.commit()` SIEMPRE en `try/except` con `db.rollback()` en el except ANTES del HTTPException.
8. **Esquemas Pydantic:** Todo payload validado. Usar `from_attributes = True` en ResponseModels.
9. **Límites de Búsqueda UI:** Usa límites razonables (`limit(50)`) para que las gráficas no fallen, no limites a 20.
