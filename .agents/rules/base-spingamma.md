---
trigger: always_on
---

# Contexto Técnico CRÍTICO: ProRed/SpinGamma
* **Misión:** Directorio de Tarjetas Digitales. Código Robusto, Arquitectura Experta, Clean Code y principios DRY.
* **Frontend:** React + Vite. Router: `react-router-dom`.
* **Backend:** FastAPI en Python (Repositorio y contexto separado).
* **Integración Base:** Respeta la estructura, enrutamiento y el ecosistema actual; no reinventes lo que ya funciona.
* **Formato de Entrega:** Comienza CADA bloque de código con la ruta exacta: `// Archivo: src/ruta/Nombre.jsx`. PROHIBIDO usar placeholders como `// ... resto del código`. Entrega archivos completos.

# 🚨 REGLA ESTRICTA DE SINCRONIZACIÓN BACKEND 🚨
Tienes acceso al código del backend (FastAPI) cruzando al directorio `spinjob-backend` (típicamente al mismo nivel, ej. `c:\Users\jhona\Desktop\spinjob-backend`). Si implementas un cambio en el frontend que requiere actualizar la API (ej. agregar un nuevo campo en un formulario, cambiar un JSON, o consumir un endpoint que no existe), DEBES ir de inmediato al backend y aplicar todos los cambios pertinentes allí también.
Si el cambio es netamente en frontend y no requiere ajustes en la API, entonces no es necesario.
NO me des un prompt para el backend; haz tú mismo ambas modificaciones (front y back) como parte de la misma tarea.