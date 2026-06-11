---
trigger: always_on
---

# Contexto Base: Tarjetoso Backend

* **Proyecto:** Tarjetoso — API RESTful para Directorio de Tarjetas Digitales.
* **Stack:** FastAPI + SQLAlchemy + Neon DB (PostgreSQL serverless).
* **Integraciones:** Cloudinary (imágenes), bcrypt (hashing), JWT (autenticación).
* **Frontend:** React (repo: `c:\Users\jhona\Desktop\spinjob-fronted`).

---

# 🗺️ MAPA DE ARCHIVOS CLAVE

## Raíz
| Archivo | Propósito |
|---------|-----------|
| `main.py` | Entrada FastAPI, CORS, registro de routers |
| `models.py` | Modelos SQLAlchemy (tablas de la BD) |
| `schemas.py` | Esquemas Pydantic (validación I/O) |
| `database.py` | Conexión a Neon DB (pool_pre_ping, pool_recycle) |
| `auth.py` | Hashing bcrypt, JWT, autenticación |
| `requirements.txt` | Dependencias pinneadas |

## `routers/` (Endpoints por dominio)
| Archivo | Propósito |
|---------|-----------|
| `auth.py` | Login, registro, Google OAuth |
| `businesses.py` | CRUD de negocios/profesionales |
| `users.py` | Gestión de usuarios |
| `admin.py` | Panel de administración |
| `tarjetero.py` | Tarjetero (guardar/quitar tarjetas) |
| `reviews.py` | Reseñas e interacciones de usuarios |

## Otros
| Archivo | Propósito |
|---------|-----------|
| `migrate_businesses.py` | Script de migración de datos |
| `upgrade_db.py` | Script de actualización de esquema BD |
| `backup_to_drive.py` | Backup a Google Drive |

---

# ⚡ REGLAS DE BÚSQUEDA RÁPIDA

1. **Archivo conocido → `view_file` directo.** NUNCA `grep_search` en un solo archivo.
2. **Patrón en muchos archivos → `grep_search`** con `Includes: ["*.py"]`.
3. **Lecturas paralelas:** 3+ archivos → lanzar TODOS en paralelo.
4. **Limita líneas:** Solo imports → `StartLine=1, EndLine=20`.
5. **Modelo/Tabla → `models.py`.** Esquema → `schemas.py`. Endpoint → `routers/`.

---

# 🏗️ ESTÁNDARES DE ARQUITECTURA Y BASES DE DATOS

## Código Backend
1. **Inyección de dependencias:** SIEMPRE `db: Session = Depends(get_db)`.
2. **Esquemas Pydantic:** Todo payload validado. Usar `from_attributes = True` en ResponseModels.
3. **Transacciones:** `db.commit()` SIEMPRE en `try/except` con `db.rollback()` en el except.
4. **IDs:** `generate_uuid()` basada en `uuid.uuid4()` para PKs.
5. **Hashing:** `bcrypt` directo. PROHIBIDO `passlib`.
6. **SRP:** Lógica compleja → `services/`. Rutas delgadas.
7. **KISS + DRY:** No sobre-ingenierizar. No duplicar lógica.
8. **Validación temprana:** Falla rápido con Pydantic (Field, regex, min_length).

## Diseño de Base de Datos (Reglas Estrictas)
9. **Zero Orphans (Gestión de Esquemas):** Si eliminas un campo de un modelo SQLAlchemy en `models.py`, **SIEMPRE** debes crear y ejecutar un script de migración temporal (ej. usando `ALTER TABLE DROP COLUMN`) para eliminarlo de la base de datos real Neon DB. Nunca dejes columnas huérfanas en la base de datos que ya no mapean al modelo.
10. **Normalización (Relaciones vs Duplicación):** Está completamente prohibido guardar datos de un usuario replicados (como `user_phone` o `user_name`) en tablas hijas. Siempre usa un `user_id` de tipo Foreign Key relacionando la tabla a `users.id`. En caso de necesitar exponer los datos de ese usuario en el schema de respuesta de la tabla hija, utiliza propiedades derivadas en el modelo (ej. `@property def user_name(self): return self.user.name if self.user else "Anónimo"`).
11. **Pool resiliente (Neon DB):** `create_engine(URL, pool_pre_ping=True, pool_recycle=300)`. Si `database.py` NO tiene estos parámetros → CORREGIR INMEDIATAMENTE.

## Scripts y Mantenimiento en Terminal (Windows)
12. **Scripts Windows (Compatibilidad de Terminal):** En cualquier script de saneamiento, migración o limpieza escrito en Python o Bash que vaya a correrse en consola local, está **ESTRICTAMENTE PROHIBIDO usar emojis** (ej. ✅, 🗑️, 🎉). Esto causará invariablemente `UnicodeEncodeError` debido a la codificación nativa `cp1252` de Windows. Utiliza prefijos de texto plano seguro como `[INFO]`, `[ERROR]`, `[WARN]` o `[SUCCESS]`.

## Hashing (auth.py)
```python
import bcrypt
def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password: return False
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
```

---

# 🚨 REGLA DE SINCRONIZACIÓN FRONTEND
Dado que estás operando en el repositorio del frontend (`spinjob-fronted`) pero tienes acceso local a `spinjob-backend`, si determinas que un cambio que te pidieron en React requiere modificar la base de datos o crear un nuevo endpoint en FastAPI, ve al backend y aplícalo tú mismo. Sigue el workflow y los comandos estándares de Python.

# 📦 FORMATO DE ENTREGA
- Comienza CADA bloque con: `# Archivo: ruta/del/archivo.py`.
- PROHIBIDO `# ... resto del código`. Entrega archivos completos si la modificación es extensa.
- Dependencias: SIEMPRE pinneadas con rango (ej. `bcrypt>=4.0,<6.0`). NUNCA incluir `passlib`.
