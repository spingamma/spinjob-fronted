# 🚀 Frontend de Tarjetoso

¡Bienvenido al código del frontend de la plataforma Tarjetoso! 💻✨
Este proyecto es la interfaz de usuario de la aplicación, una PWA (Progressive Web App) rápida, moderna y responsiva construida con React, Vite y Tailwind CSS.

---

## 🛠️ ¿Qué necesitas tener instalado?

### En Windows
1. **Node.js (versión LTS recomendada)**:
   - Puedes descargarlo e instalarlo desde [nodejs.org](https://nodejs.org/).
   - O instalarlo desde la terminal con winget:
     ```powershell
     winget install OpenJS.NodeJS
     ```
2. **NPM** (se instala automáticamente con Node.js).

### En Fedora
1. **Node.js y NPM**: Ejecuta el siguiente comando en la terminal:
   ```bash
   sudo dnf install nodejs
   ```

---

## 🚀 Pasos para hacerlo funcionar en tu computadora

### 1. Descargar dependencias (Librerías)
Abre la terminal en la carpeta del proyecto y descarga los módulos necesarios para que funcione:

**En Windows (CMD / PowerShell):**
```cmd
npm install
```

**En Fedora / Linux:**
```bash
npm install
```

### 2. Configurar variables de entorno (Opcional/Recomendado)
Para conectarse con el backend y servicios externos:
1. Crea o edita el archivo `.env.development` en la raíz del proyecto.
2. Agrega las URLs del backend:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

### 3. ¡Arrancar la aplicación!
Una vez instaladas las dependencias, inicia el servidor de desarrollo local:

**En Windows (CMD / PowerShell):**
```cmd
npm run dev
```

**En Fedora / Linux:**
```bash
npm run dev
```

### 4. Abrir en el navegador
Una vez que el comando esté corriendo, abre tu navegador y visita:
👉 **[http://localhost:5173/](http://localhost:5173/)**

---

## 🛑 Detener la Aplicación
Para apagar el servidor de desarrollo, presiona `Ctrl + C` en la terminal.

## 🛠️ Comandos Útiles

| Acción | Comando | Descripción |
| :--- | :--- | :--- |
| **Desarrollo** | `npm run dev` | Inicia el servidor de desarrollo con recarga rápida (HMR). |
| **Construcción** | `npm run build` | Compila y optimiza la aplicación para producción. |
| **Vista previa** | `npm run preview` | Previsualiza localmente la compilación de producción. |
| **Linter** | `npm run lint` | Analiza el código en busca de errores de formato y sintaxis. |

---
¡Mucho éxito con el proyecto! 💻🚀
