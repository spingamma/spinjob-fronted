---
name: crear-modulo-api
description: Genera un módulo API completo (Modelos de BD + Esquemas de Validación/DTOs + Rutas CRUD) adaptado a las tecnologías del proyecto.
---

# Skill: Crear Módulo API

## Cuándo usar
Utiliza esta habilidad cuando el usuario solicite añadir una nueva entidad o recurso al sistema que requiera almacenamiento y exposición mediante endpoints (ej. "Agrega un sistema de comentarios", "Crea la entidad de productos", "Necesito guardar visitas en perfiles").

## Pre-vuelo (Inicialización y Detección de Stack)
1. **Verificación de Stack:** Revisa el archivo `.agents/tech-stack.json` para conocer las tecnologías seleccionadas.
   - Si no existe el archivo, **pregunta al usuario** qué tecnologías se utilizarán, sugiriendo las recomendadas por defecto (React/Vite, FastAPI/SQLAlchemy, PostgreSQL/Neon DB).
   - Crea el archivo con el resultado.
2. **Inspección de Archivos Existentes:** Analiza los esquemas de bases de datos y enrutadores actuales para mantener la coherencia y convenciones del codebase.

---

## Estructura por Stack Tecnológico

### Opción A: FastAPI + SQLAlchemy (Python)

#### 1. Modelo de Base de Datos (`models.py` o módulo equivalente)
Crea o edita la clase del modelo heredando de tu base declarativa.
```python
class NuevaEntidad(Base):
    __tablename__ = "nueva_entidades"  # Nombre de tabla en plural
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    
    # Regla de Normalización: Vincula mediante FKs físicas
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    user = relationship("User")
    
    # Propiedades dinámicas para retornar información relacionada de forma limpia
    @property
    def user_name(self):
        return self.user.name if self.user else "Anónimo"
```

#### 2. Esquemas de Validación (`schemas.py` o similar)
Genera las clases de validación con Pydantic.
```python
class EntidadBase(BaseModel):
    campo_texto: str
    campo_opcional: Optional[int] = None

class EntidadCreate(EntidadBase):
    pass

class EntidadResponse(EntidadBase):
    id: str
    user_id: str
    user_name: str # Exposición directa de la propiedad dinámica
    
    class Config:
        from_attributes = True
```

#### 3. Enrutador y Lógica CRUD (`routers/nueva_entidad.py`)
Implementa las rutas CRUD básicas con validaciones transaccionales.
```python
router = APIRouter(prefix="/nueva-entidad", tags=["NuevaEntidad"])

@router.post("/", response_model=EntidadResponse)
def create_entidad(data: EntidadCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Validación Obligatoria en el Servidor:
    if not data.campo_texto: 
        raise HTTPException(status_code=400, detail="El campo_texto es obligatorio")

    try:
        new_item = NuevaEntidad(**data.dict(), user_id=current_user.id)
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item
    except Exception as e:
        db.rollback() # Rollback transaccional ante fallos
        raise HTTPException(status_code=500, detail=f"Error en base de datos: {str(e)}")
```

---

### Opción B: Node.js + Express/NestJS + Prisma (JavaScript/TypeScript)

#### 1. Modelo en Prisma (`schema.prisma`)
Define el modelo e inicializa las migraciones:
```prisma
model NuevaEntidad {
  id        String   @id @default(uuid())
  campoText String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

#### 2. Controlador y Enrutador (Express)
Crea la lógica del endpoint gestionando la persistencia y validaciones.
```typescript
import { Request, Response } from 'express';
import { prisma } from '../database';

export async function createEntidad(req: Request, res: Response) {
  const { campoText } = req.body;
  const userId = req.user?.id; // Obtener usuario de la sesión

  if (!campoText) {
    return res.status(400).json({ error: 'El campoText es requerido' });
  }

  try {
    const newItem = await prisma.nuevaEntidad.create({
      data: {
        campoText,
        userId,
      },
      include: { user: true }
    });
    return res.status(201).json(newItem);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al persistir la entidad: ' + error.message });
  }
}
```

---

## Reglas Generales de Calidad
- **Límite de Líneas:** Ningún archivo nuevo o modificado para la API debe exceder las 300 líneas. Si la lógica de negocio se complejiza, sepárala e impleméntala en un directorio de servicios/controladores independientes (`services/`).
- **Zero Orphans:** Si actualizas o remueves columnas en los modelos, genera los scripts de migración correspondientes.
- **Validaciones en cliente:** Al finalizar el backend, actualiza o crea las integraciones HTTP en el frontend sincronizando los campos validados.

## Errores Críticos Comunes (Filtro Meta-Cognitivo)

### 1. Sincronización de Esquemas de Base de Datos (ORM)
- 🚨 **CRÍTICO:** Siempre que modifiques un modelo de datos lógico añadiendo o alterando columnas, es obligatorio generar o ejecutar un script de migración estructural en la base de datos subyacente (ej. `ALTER TABLE` o usar la herramienta de migraciones del ORM). No asumas que el ORM actualizará esquemas existentes en caliente.

### 2. Firmas Explícitas de Parámetros (Multipart/Form-Data)
- 🚨 **CRÍTICO:** Cuando modifiques un envío de datos que utiliza `multipart/form-data`, es absolutamente crítico que actualices explícitamente la firma de la función del controlador o mecanismo de enrutamiento del backend para aceptar el nuevo parámetro. Los frameworks de backend (ej. FastAPI usando `Form(...)`) ignorarán silenciosamente cualquier parámetro nuevo que no esté declarado en la firma de la ruta.

### 3. Auditoría Reactiva de Campos Huérfanos (Datos que "se pierden")
- 🚨 **CRÍTICO:** Al debuggear un campo que "se pierde", "llega vacío" o "desaparece al recargar", el **primer paso obligatorio** antes de investigar el frontend es verificar si el backend tiene el campo declarado en los tres niveles: (a) firma del endpoint (parámetro declarado), (b) modelo de BD (columna/campo existente), (c) schema de respuesta (campo expuesto en el DTO). Este es el escenario más común de "campos huérfanos": código frontend que envía datos a un backend que los ignora silenciosamente porque nunca se declararon.
