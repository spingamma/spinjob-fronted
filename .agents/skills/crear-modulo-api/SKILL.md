---
name: crear-modulo-api
description: Genera un módulo API completo (Modelo SQLAlchemy + Esquemas Pydantic + Rutas CRUD FastAPI). Úsala cuando el usuario pida agregar una nueva entidad al sistema.
---

# Skill: Crear Módulo API

## Cuándo usar
- "Crea un sistema de pagos", "Agrega categorías", "Necesito guardar visitas de perfiles".

## Pre-vuelo (leer en paralelo ANTES de escribir código)
1. `database.py` → Confirmar `pool_pre_ping=True`, `pool_recycle=300`.
2. `auth.py` → Si involucra auth, confirmar que usa `bcrypt` (NO `passlib`).
3. `requirements.txt` → Confirmar que NO contiene `passlib`.
4. `models.py` → Ver modelos existentes para mantener consistencia.
5. `schemas.py` → Ver esquemas existentes.

## Pasos

### 1. Modelo (`models.py`)
```python
class NuevaEntidad(Base):
    __tablename__ = "nueva_entidades"  # plural
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # ... campos propios de la entidad ...
    # REGLA CRÍTICA DE NORMALIZACIÓN:
    # Si esta entidad pertenece o es creada por un usuario, SIEMPRE usa Foreign Key.
    # NUNCA uses columnas "user_phone" o "user_name".
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    # Relaciones
    user = relationship("User")
    
    @property
    def user_name(self):
        """Propiedad derivada para evitar duplicidad de datos"""
        return self.user.name if self.user else "Anónimo"
```

### 2. Esquemas (`schemas.py`)
```python
class EntidadBase(BaseModel):
    campo: str

class EntidadCreate(EntidadBase):
    pass

class EntidadResponse(EntidadBase):
    id: str
    user_id: str
    user_name: str # Tomado de la @property
    
    class Config:
        from_attributes = True
```

### 3. Router (`routers/nueva_entidad.py`)
```python
router = APIRouter(prefix="/nueva-entidad", tags=["NuevaEntidad"])

@router.post("/", response_model=EntidadResponse)
def create(data: EntidadCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    try:
        # Extraemos datos del current_user, NO del payload
        entity = NuevaEntidad(**data.dict(), user_id=current_user.id)
        db.add(entity)
        db.commit()
        db.refresh(entity)
        return entity
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error BD: {str(e)}")
```

### 4. Registrar en `main.py`
```python
from routers.nueva_entidad import router as nueva_entidad_router
app.include_router(nueva_entidad_router)
```

### 5. Sincronizar frontend
Si el endpoint será consumido por el frontend, crea o modifica el componente React correspondiente en `spinjob-fronted` conectando mediante `fetchAuth` usando las reglas definidas.

### 6. Verificar
```bash
cd c:\Users\jhona\Desktop\spinjob-backend && uvicorn main:app --reload
```
Probar endpoints en `/docs` (Swagger UI).
