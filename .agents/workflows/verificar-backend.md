---
description: Verificación pre-deploy del backend — Revisa database.py, auth.py, requirements.txt, limpieza de esquemas de BD y rutas antes de que exploten en producción.
---

# Workflow: Verificar Backend (/verificar-backend)

// turbo-all

Ejecuta esta checklist antes de deploy o al terminar un feature complejo que involucró base de datos.

## 1. Resiliencia de conexión (Neon DB)

Abrir `database.py` y confirmar `create_engine()` con:
- `pool_pre_ping=True`
- `pool_recycle=300`

Sin estos → `OperationalError: SSL connection has been closed unexpectedly`.

## 2. Hashing de contraseñas (auth.py)

Confirmar que:
- Usa `import bcrypt` (NO `passlib`)
- Funciones: `bcrypt.hashpw()` y `bcrypt.checkpw()` directamente
- NO existe referencia a `passlib` ni `pwd_context`

## 3. Dependencias (requirements.txt)

Confirmar que:
- NO contiene `passlib`
- Dependencias pinneadas: `bcrypt>=4.0,<6.0`
- Contiene `bcrypt` como dep directa

## 4. Gestión Estricta de Esquemas de BD (Zero Orphans & Normalization)

Si modificaste `models.py`:
- **¿Renombraste o eliminaste una columna?**: Revisa inmediatamente si dejaste columnas huérfanas en Neon DB. Ejecuta un script de limpieza de migración en Python usando `text('ALTER TABLE x DROP COLUMN y')`. Asegúrate de que tu script **no contenga emojis** para no causar problemas de `UnicodeEncodeError`.
- **¿Usas Foreign Keys?**: Revisa en los modelos actualizados si estás guardando datos redundantes (como `user_phone` o `user_name`). Transfórmalos a relaciones usando `user_id = Column(String, ForeignKey("users.id"))`.

## 5. Manejo de errores en escrituras

Revisar endpoints POST/PUT/DELETE en `routers/`:
- `db.commit()` dentro de `try/except`
- `db.rollback()` en CADA `except` ANTES del `raise HTTPException`

## 6. Arquitectura limpia

- **SRP:** ¿Hay endpoints con lógica compleja? → Mover a `services/`.
- **DRY:** ¿Código repetido? → Extraer a utilidades compartidas.
- **Validación:** ¿Schemas Pydantic tienen validaciones suficientes?

## 7. Servidor arranca

```bash
cd c:\Users\jhona\Desktop\spinjob-backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Si arranca sin errores → verificación pasada. Error de importación/config → corregir primero.
