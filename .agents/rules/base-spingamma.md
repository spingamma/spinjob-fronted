---
trigger: always_on
---

# Contexto Base: Tarjetoso Frontend

* **Proyecto:** Tarjetoso — Directorio de Tarjetas Digitales Profesionales.
* **Nombre de marca:** Tarjetoso (NUNCA usar "SpinJob" en textos visibles al usuario).
* **Stack:** React 19 + Vite 8 + Tailwind CSS 4 + react-router-dom 7.
* **PWA:** vite-plugin-pwa (Workbox, service worker autoUpdate).
* **Auth:** Google Identity Services vía `@react-oauth/google`. Botón custom + API nativa GSI.
* **Backend:** FastAPI (repo separado: `c:\Users\jhona\Desktop\spinjob-backend`).
* **Deploy:** Vercel (SPA con `vercel.json` rewrite `/*` → `/index.html`).

---

# 🏎️ REGLAS DE VELOCIDAD (MÁXIMA PRIORIDAD)

> **Meta:** Resolver TODO en la menor cantidad de tool calls posible. Cada llamada extra = tiempo perdido.

1. **Paralelizar SIEMPRE.** Si necesitas leer N archivos, grep en N rutas, o editar N archivos independientes → lanzar TODAS las llamadas en paralelo (sin `waitForPreviousTools`).
2. **grep → edit directo.** Cuando necesites buscar y reemplazar un texto global (ej. renombrar marca), usa `grep_search` UNA vez con `CaseInsensitive=true` en `src/`. Con los resultados, lanza TODOS los `replace_file_content` en paralelo en el mismo turno, SIN leer los archivos antes (la línea del grep ya da suficiente contexto).
3. **NO leer archivos completos si ya tienes la línea.** `grep_search` te da `LineNumber` + `LineContent`. Usa esos datos directamente para `StartLine`/`EndLine` en los reemplazos.
4. **Un solo grep basta.** No hacer múltiples búsquedas variando capitalización si puedes usar `CaseInsensitive=true`.
5. **Ediciones multi-chunk.** Si un archivo tiene 2+ cambios, usa `multi_replace_file_content` con todos los chunks en una sola llamada.
6. **Verificación final con 1 grep.** Después de todos los edits, confirma con un solo `grep_search` que no quedan ocurrencias.

---

# 🗺️ MAPA DE ARCHIVOS CLAVE (LEER ANTES DE BUSCAR)

## Raíz
| Archivo | Propósito |
|---------|-----------|
| `package.json` | Dependencias, scripts (`dev`, `build`) |
| `index.html` | HTML shell, SEO meta tags, tema |
| `vite.config.js` | Plugins (React, Tailwind, PWA manifest) |
| `vercel.json` | Rewrites SPA para Vercel |
| `.env` / `.env.development` | Variables de entorno |

## `src/`
| Archivo / Carpeta | Propósito |
|--------------------|-----------|
| `main.jsx` | Entrada React: StrictMode, GoogleOAuthProvider, BrowserRouter |
| `App.jsx` | Router principal (Routes + Suspense con lazy loading) |
| `App.css` | Estilos globales |
| `index.css` | Importación Tailwind |

## `src/pages/` (Vistas de ruta)
| Carpeta | Ruta | Descripción |
|---------|------|-------------|
| `Directory/` | `/` | Directorio principal, lista de profesionales |
| `Profile/` | `/perfil/:slug` | Perfil individual de un profesional |
| `CreateBusiness/` | `/crear-negocio` | Formulario de creación de negocio |
| `MyBusinesses/` | `/mis-negocios` | Negocios del usuario autenticado |
| `AdminPanel/` | `/admin` | Panel de administración |
| `BusinessCardHolder/` | `/tarjetero` | Tarjetero del usuario |

## `src/components/` (Piezas reutilizables)
| Archivo | Propósito |
|---------|-----------|
| `Header.jsx` | Cabecera global con logo y navegación |
| `BottomNavbar.jsx` | Navegación inferior móvil |
| `NavMenu.jsx` | Menú lateral / hamburguesa |
| `AuthModal.jsx` | Modal de login/registro (Google + email) |
| `DirectoryFilterBar.jsx` | Barra de filtros del directorio (categoría, ubicación, rating) |
| `ProfessionalCard.jsx` | Tarjeta de resumen de un profesional |
| `ReviewModal.jsx` | Modal de reseñas/calificaciones |
| `ModalVerificacion.jsx` | Modal de verificación de cuenta |
| `InstallPrompt.jsx` | Prompt de instalación PWA |

## `src/hooks/` (Lógica extraída)
| Archivo | Propósito |
|---------|-----------|
| `useDirectoryFilters.js` | Filtrado, búsqueda y agrupación del directorio |
| `useAccionesPerfil.jsx` | Acciones del perfil (compartir, contactar, guardar) |

## `src/plantillas/` (Templates de perfil por profesión)
| Archivo | Propósito |
|---------|-----------|
| `PlantillaGenerica.jsx` | Template base (todas las profesiones) |
| `PlantillaAbogado.jsx` | Template especializado: Abogados |
| `PlantillaInmobiliaria.jsx` | Template especializado: Inmobiliarias |

## `src/utils/`
| Archivo | Propósito |
|---------|-----------|
| `cropImage.js` | Utilidad de recorte de imágenes |

---

# ⚡ REGLAS DE BÚSQUEDA RÁPIDA (CRÍTICO)

1. **Archivo conocido → `view_file` directo.** NUNCA `grep_search` en un solo archivo.
2. **Patrón en muchos archivos → `grep_search` en `src/`** con `Includes` para filtrar (ej. `["*.jsx"]`).
3. **Lecturas paralelas:** Si necesitas revisar 3+ archivos, lánzalos TODOS en paralelo.
4. **Limita líneas:** Si solo necesitas ver imports/exports, usa `StartLine=1, EndLine=30`.
5. **Rutas → `App.jsx`.** Endpoints → `src/hooks/` o el componente que hace fetch.
6. **Estilos → `App.css`** para globales, inline Tailwind para componentes.

---

# 🚨 REGLA DE SINCRONIZACIÓN BACKEND
Tienes acceso al backend en `c:\Users\jhona\Desktop\spinjob-backend`. Si un cambio frontend requiere un nuevo endpoint o campo en la API, ve al backend y aplícalo tú mismo. NO des un prompt para el backend.

# 📦 FORMATO DE ENTREGA
- Comienza CADA bloque con: `// Archivo: src/ruta/Nombre.jsx`.
- PROHIBIDO `// ... resto del código`. Entrega archivos completos.