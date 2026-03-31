---
trigger: always_on
---

# Contexto Técnico CRÍTICO: ProRed/SpinGamma
* **Misión:** Directorio de Tarjetas Digitales. Código robusto, principios DRY.
* **Frontend:** React + Vite. Router: `react-router-dom`.
* **Backend:** FastAPI en Python (Repositorio y contexto separado).
* **Integración Base:** Respeta la estructura, enrutamiento y el ecosistema actual; no reinventes lo que ya funciona.
* **Formato de Entrega:** Comienza CADA bloque de código con la ruta exacta: `// Archivo: src/ruta/Nombre.jsx`. PROHIBIDO usar placeholders como `// ... resto del código`. Entrega archivos completos.

# 🚨 REGLA ESTRICTA DE SINCRONIZACIÓN BACKEND 🚨
Dado que no tienes acceso al código del backend (FastAPI), si implementas un cambio en el frontend que requiere actualizar la API (ej. agregar un nuevo campo en un formulario, cambiar un JSON, o consumir un endpoint que no existe), DEBES hacer lo siguiente:
1. Escribe el código del frontend asumiendo que el backend ya fue actualizado.
2. Al final de tu respuesta, crea una sección llamada **"🚀 PROMPT PARA EL BACKEND"**.
3. En esa sección, redacta un prompt TÉCNICO y LISTO PARA COPIAR, indicando qué endpoint, modelo de SQLAlchemy o esquema de Pydantic debe crear/modificar la IA del backend para soportar los cambios del frontend.