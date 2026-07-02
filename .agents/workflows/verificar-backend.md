---
description: Verificación pre-deploy del backend — Revisa la conexión a base de datos, hashing, dependencias, limpieza de esquemas de BD y arranque de rutas según las tecnologías detectadas.
---

# Workflow: Verificar Backend (/verificar-backend)

Ejecuta esta lista de comprobación antes de realizar un deploy o al finalizar cambios que involucren base de datos y lógica del lado del servidor.

## 1. Identificar stack y configuraciones de conexión a BD
Revisa si la base de datos es relacional (PostgreSQL/MySQL/Neon DB) y valida la resiliencia en la configuración del pool de conexiones:
- **En FastAPI/SQLAlchemy (`database.py`):**
  - Asegura `pool_pre_ping=True` y `pool_recycle=300` al crear el engine.
- **En Node.js (Prisma/TypeORM/Sequelize):**
  - Valida configuraciones de reintento, tiempos de espera (timeouts) y límites del pool.
- *Propósito:* Evitar caídas y errores de conexión cerrada inesperadamente en el entorno de producción.

## 2. Hashing seguro y almacenamiento de contraseñas
Verifica que las contraseñas se almacenen utilizando algoritmos robustos y actualizados:
- **En Python:**
  - Asegura el uso de `bcrypt` o `argon2` directamente. NUNCA utilices `passlib` obsoleta.
- **En Node.js:**
  - Usa librerías modernas de hash como `bcrypt`, `argon2`, o la API criptográfica nativa.

## 3. Comprobación de Dependencias
- Abre el manifiesto de dependencias del backend (`requirements.txt`, `package.json`, `Pipfile`, etc.).
- Confirma que no se instalen paquetes inseguros, deprecados o duplicados.
- Asegura que las dependencias de hashing y conexión a base de datos estén explícitamente declaradas con versiones estables fijadas.

## 4. Gestión de Esquemas de BD y Transacciones (Zero Orphans)
Si realizaste modificaciones en los modelos de base de datos:
- **Sin Columnas Huérfanas:** Si removiste o cambiaste el nombre de un campo, escribe y ejecuta un script de migración estructurado en la base de datos del entorno correspondiente para sincronizarla. Evita usar caracteres especiales o emojis en consolas de Windows para prevenir fallos de codificación (`UnicodeEncodeError`).
- **Relaciones limpias:** Valida que no se guarden datos redundantes. Utiliza llaves foráneas (`Foreign Keys`) correspondientes.
- **Transacciones Seguras:** Asegúrate de que todas las escrituras se ejecuten dentro de bloques try/catch/except, llamando a la reversión transaccional (`rollback`) antes de levantar el error.

## 5. Legibilidad del Código y Sintaxis
- Revisa visualmente y con analizadores de código (linters) que la identación y los bloques de control de flujo estén bien formateados (especialmente crítico en lenguajes dependientes de indentación como Python).
- Asegúrate de que no haya código de desarrollo (como `print()` innecesarios, tokens hardcodeados o credenciales) expuesto en los commits.

## 6. Verificación de Inicio del Servidor
Ejecuta el comando correspondiente al backend para asegurar que la aplicación inicia y compila limpiamente sin fallos de importaciones o de configuración:
- **Para FastAPI/Python:**
  ```bash
  # Ejecuta en el directorio del backend:
  python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
  ```
- **Para Node.js/Express/NestJS:**
  ```bash
  # Ejecuta en el directorio del backend:
  npm run dev
  ```

Si el servidor inicia sin errores ni advertencias críticas, la verificación del backend ha pasado con éxito.
