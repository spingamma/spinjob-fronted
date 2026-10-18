# 🚀 Frontend de Tarjetoso (SPA & PWA)

Cliente web y Progressive Web App (PWA) de **Tarjetoso**, construido con **React 19**, **Tailwind CSS 4** y **Vite 8**.

---

## 🛠️ Stack Tecnológico
- **Core:** React 19.2 (`react`, `react-dom`).
- **Build Tool:** Vite 8.0 con `@vitejs/plugin-react` y `@tailwindcss/vite`.
- **Estilos:** Tailwind CSS 4.2 nativo.
- **Enrutamiento:** React Router DOM 7.13 (SPA con Lazy Loading y Splash Screen nativo).
- **PWA:** `vite-plugin-pwa` con Service Worker para caché offline y notificaciones Web Push.
- **Gráficos & PDF:** Recharts 3.8, jsPDF y auto-table para analítica de negocio.

---

## 📦 Instalación y Configuración
1. Ubícate en el directorio `spinjob-fronted/`:
   ```bash
   npm install
   ```

2. Variables de entorno:
   - `.env`: Configuración local por defecto (`VITE_API_URL=http://localhost:8000`).
   - `.env.remote.local`: Conexión directa hacia el backend en producción.

---

## 💻 Ejecución y Scripts

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia servidor Vite local en [http://localhost:5173/](http://localhost:5173/) |
| `npm run dev:prod` | Inicia Vite apuntando al backend de producción en la nube |
| `npm run build` | Genera bundle optimizado de producción en `dist/` |
| `npm run lint` | Ejecuta auditoría estática con ESLint 9 |
| `npm run preview` | Previsualiza el build de producción localmente |

> **Nota:** La forma unificada y recomendada de levantar el frontend desde la raíz del proyecto es:
> ```bash
> ./tarjetoso.sh frontend start
> ```

---

## 📚 Documentación de Arquitectura
Para explorar el árbol de componentes, hooks especializados, tabla de rutas y branding dinámico, consulta:
- [Arquitectura Frontend React (`ops/docs/04-frontend.md`)](../ops/docs/04-frontend.md)
- [Reglas de UI y Branding (`.agents/rules/10-frontend-ui.md`)](../.agents/rules/10-frontend-ui.md)
- [Reglas de Clean Code React (`.agents/rules/11-frontend-react.md`)](../.agents/rules/11-frontend-react.md)

