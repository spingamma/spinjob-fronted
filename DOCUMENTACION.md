# Documentación Técnica y Arquitectura del Proyecto "Tarjetoso"

## 1. Resumen del Proyecto
Tarjetoso es una plataforma web (PWA) de directorio de servicios y profesionales enfocada en Bolivia. Permite a profesionales y negocios crear "tarjetas digitales" públicas, recibir reseñas, mostrar sus enlaces (redes sociales, WhatsApp, ubicación) y ser descubiertos mediante un buscador con filtros avanzados. Incluye un panel de administración para moderación de contenido, un sistema de plantillas dinámicas según el tipo de suscripción del profesional, una funcionalidad de **Catálogo de Productos** integrado, y un **Dashboard de Métricas** avanzado para seguimiento de rendimiento.

## 2. Stack Tecnológico
- **Backend:** Python 3.8+, FastAPI, SQLAlchemy (ORM), psycopg2 (PostgreSQL).
- **Frontend:** React (Vite), Tailwind CSS, React Router DOM, Lucide React (Iconos), Recharts (Visualización de datos).
- **Base de Datos:** PostgreSQL alojada en Neon DB.
- **Almacenamiento de Medios:** Cloudinary (imágenes de perfil, reseñas y catálogo de productos).
- **Autenticación:** JWT (JSON Web Tokens), bcrypt (hashing), Google OAuth2, verificación SMTP (Gmail).
- **Infraestructura Adicional:** Script de backups automáticos hacia Google Drive (`pg_dump`).

## 3. Arquitectura de la Base de Datos (Modelos SQLAlchemy)
El sistema relacional se basa en 6 tablas principales (`models.py`):
- **Users (`users`):** Almacena `id` (UUID), `email`, `phone`, `name`, `password_hash`, `verification_code`, `is_verified` (booleano crucial para permisos), `is_admin`, y `must_change_password`.
- **Businesses (`businesses`):** Contiene la información del profesional. Campos clave: `slug` (identificador único para URLs), `status` (pendiente, aprobado, rechazado), `owner_id` (FK a Users), `premium` (booleano), `plan_months`, `rating` (promedio), `reviews_count`. Incluye campos de ubicación, contacto y una amplia gama de redes sociales (ahora incluye `tiktok`, `github`, `spingamma_url` y `catalog_url` externo).
- **Products (`products`):** Modelo para la gestión de catálogos. Guarda `id`, `name`, `description`, `price`, `image_url` y tiene relación directa con `business_id` (FK a Businesses).
- **Resenas (`resenas`):** FK a `businesses.id`. Guarda el `rating`, `descripcion`, y `image_url`. Restricción de unicidad (`_userphone_business_resena_uc`) para que un usuario solo califique una vez a un negocio.
- **Interactions (`interactions`):** Registro de métricas reales (Visitas al perfil, clics en WhatsApp/Redes, etc.). Relaciona `user_id`, `business_id`, `platform` (origen del clic) y `date`.
- **SavedCards (`saved_cards`):** Funcionalidad de "Mi Tarjetero". Relaciona usuarios con negocios guardados.

## 4. Lógica de Negocio y Flujos del Backend (FastAPI)
- **Autenticación y Seguridad (`auth.py`):**
  - Flujo dual: Registro por correo/contraseña o Google Login.
  - Validación estricta de celular (requiere 8 dígitos). Si el usuario entra con Google, se retiene en un estado "completar celular" antes de otorgar acceso pleno.
  - Envío de correos transaccionales (SMTP) para códigos de verificación (6 dígitos) y contraseñas temporales (recuperación).
- **Moderación de Negocios:** Los usuarios crean negocios que nacen con estado `pendiente`. Un administrador debe usar el endpoint `/admin/businesses/{slug}/status` para pasarlos a `aprobado` (haciéndolos públicos) o `rechazado` (con un motivo `rejection_reason`).
- **Gestión de Catálogos (`products.py`):** Rutas CRUD completas para que el dueño suba fotos a Cloudinary, defina precios y descripciones de sus productos. Incorpora lógica de cuotas: límite de 5 productos para negocios estándar y 10 productos para negocios premium.
- **Métricas e Interacciones (`businesses.py`):** Endpoint nativo `/businesses/{slug}/metrics` para recuperar el historial de interacciones y alimentar gráficas de alto rendimiento en el cliente.
- **SEO y Sitemaps Dinámicos (`seo.py`):** Endpoint `/sitemap.xml` que genera un mapa del sitio en tiempo real cruzando todas las categorías y departamentos con negocios activos en la base de datos (e.g. `/directorio/abogados/la-paz`). Incluye también el generador de Open Graph en `/og/{slug}`.
- **Middlewares:** Configuración CORS amplia para permitir conexiones desde Vercel, localhost y el dominio oficial (tarjetoso.com).

## 5. Arquitectura del Frontend (React)
### 5.1. Componentes Principales
- **Directory.jsx:** Landing page y vista principal del directorio. Integrado profundamente con React Router para soportar URLs amigables (ej. `/directorio/:categoria/:estado`). Inyecta etiquetas SEO dinámicas según los parámetros de la URL y renderiza tarjetas usando `ProfessionalCard`.
- **Profile.jsx:** Renderizado dinámico (`/perfil/:slug`). Inyecta SEO dinámico (JSON-LD) para Google. Registra automáticamente interacciones de "Visita Perfil" en base de datos.
- **CreateBusiness.jsx:** Formulario de registro. Integra `navigator.geolocation` para generar enlaces de Google Maps. Solo permite el envío si el usuario es `is_verified` (comprobado en LocalStorage y validado contra el backend).
- **AdminPanel.jsx:** Dashboard para usuarios `is_admin`. Permite revisar formularios crudos (mediante `BusinessDetailsModal`), aprobar/rechazar negocios y verificar usuarios manualmente.
- **MyBusinesses.jsx & BusinessCardHolder.jsx:** Paneles de usuario para gestionar sus propias creaciones y sus perfiles guardados favoritos.
- **CatalogManager.jsx & CatalogModal.jsx:** Componentes dedicados para la creación de productos (por parte del dueño en su panel) y la visualización interactiva del catálogo dentro de la tarjeta del profesional.
- **MetricsDashboard.jsx:** Nuevo Dashboard analítico de estilo "SaaS Corporativo" que renderiza en base a la tabla `interactions`. Incorpora gráficas suavizadas con `Recharts`, totales dinámicos, y filtros temporales avanzados interactivos.

### 5.2. Modales del Sistema
- **AuthModal.jsx:** Modal multifase. Maneja Login, Registro, Recuperación de contraseña, Forzar cambio de contraseña temporal y Google Auth. Todo en una sola ventana emergente adaptativa (Dark/Light theme).
- **ModalVerificacion.jsx:** Maneja el flujo de envío y validación del código de 6 dígitos al correo electrónico del usuario.
- **ReviewModal.jsx:** Permite al usuario dejar calificación de 1 a 5 estrellas, texto descriptivo y evidencia fotográfica.
- **CropModal.jsx:** Extraído para aislar y reutilizar la lógica de recorte fotográfico (`react-easy-crop`) tanto en la imagen de avatar del profesional como en las fotos de los productos del catálogo.

### 5.3. Custom Hooks
- **useDirectoryFilters.js:** Motor de búsqueda del directorio. Lee la categoría y el departamento directamente de la URL (`useParams`) para potenciar el SEO, mientras que administra la subcategoría, barrio, texto libre y calificación mínima mediante Query Params en la URL (`useSearchParams`). Mantiene la navegación sincronizada en todo momento.
- **useAccionesPerfil.jsx:** Centraliza la lógica de los perfiles: compartir, guardar en tarjetero, calificar (verificando si el usuario es apto/verificado) y registrar clics en enlaces (Interacciones).
- **useSEO.js:** Inyecta etiquetas Meta (Open Graph, Twitter Cards) y Schema.org JSON-LD en el `<head>` para posicionamiento orgánico.

## 6. Características Especiales
- **PWA (Progressive Web App):** Lógica en `InstallPrompt.jsx` para detectar dispositivos (iOS/Android/Desktop) y mostrar un banner personalizado invitando a "Instalar la App", interceptando el evento `beforeinstallprompt`.
- **SEO Dinámico y Enrutamiento Inteligente:** Aunque es una SPA construida con Vite, usa parámetros de ruta estrictos en frontend (`/directorio/plomeros/santa-cruz`) respaldados por un `sitemap.xml` dinámico servido directamente desde FastAPI vía un proxy reescrito en `vercel.json`. Esto permite indexación profunda y etiquetas `<title>` y `<meta>` vivas.
- **Deferred Actions (Acciones Diferidas):** Si un usuario no logueado intenta calificar o dar clic a WhatsApp, el sistema guarda su intención en `localStorage`, levanta el `AuthModal`, y ejecuta la acción automáticamente una vez que el login es exitoso.

---

## 7. Guía de Inicio Rápido

¡Hola! Bienvenido al proyecto **Tarjetoso**. Esta guía te ayudará a instalar y ejecutar el proyecto en tu computadora de la forma más sencilla posible.

### 🛠️ Requisitos Previos
Para que el proyecto funcione, necesitas instalar **Node.js**:
1. Descarga la versión **LTS** de [nodejs.org](https://nodejs.org/es).
2. Instálalo siguiendo los pasos predeterminados.

### 🚀 Pasos para Ejecutar
1. **Instalar dependencias:** Abre una terminal en la carpeta del proyecto y ejecuta:
   ```bash
   npm install
   ```
2. **Arrancar la aplicación:** Una vez instaladas las dependencias, ejecuta:
   ```bash
   npm run dev
   ```
3. **Ver en el navegador:** Abre [http://localhost:5173/](http://localhost:5173/) en tu navegador.

### 🛑 Detener la Aplicación
Presiona `Ctrl + C` en la terminal para detener el servidor de desarrollo.
