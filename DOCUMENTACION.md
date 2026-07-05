# Documentación Técnica y Arquitectura del Proyecto "Tarjetoso"

## 1. Resumen del Proyecto
Tarjetoso es una plataforma web (PWA) de directorio de servicios y profesionales enfocada en Bolivia. Permite a profesionales y negocios crear "tarjetas digitales" públicas, recibir reseñas, mostrar sus enlaces (redes sociales, WhatsApp, ubicación) y ser descubiertos mediante un buscador con filtros avanzados.

El proyecto incorpora un panel de administración para moderación de contenido, una **plantilla premium unificada** ([PlantillaGenerica.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/plantillas/PlantillaGenerica.jsx)) con soporte de **Modo Edición Inline** (para editar datos, redes, especialidades y catálogo en tiempo real sin salir de la tarjeta), una funcionalidad de **Catálogo de Productos** integrado, un **Dashboard de Métricas** avanzado y un **Sistema de Pedidos (Shopping Cart y Checkout)** completo que permite a los clientes realizar compras directamente a través de la tarjeta del profesional.

---

## 2. Stack Tecnológico
- **Backend:** Python 3.8+, FastAPI, SQLAlchemy (ORM), psycopg2 (PostgreSQL).
- **Frontend:** React 19 (Vite), Tailwind CSS 4, React Router DOM 7, Lucide React (Iconos), Recharts (Visualización de datos).
- **Base de Datos:** PostgreSQL alojada en Neon DB.
- **Almacenamiento de Medios:** Cloudinary (imágenes de perfil, reseñas y catálogo de productos).
- **Autenticación:** JWT (JSON Web Tokens), Google OAuth2 con flujo nativo Google Identity Services (GSI), verificación SMTP (Gmail).
- **Infraestructura Adicional:** Script de backups automáticos hacia Google Drive (`pg_dump`).

---

## 3. Arquitectura de la Base de Datos (Modelos SQLAlchemy)
El sistema relacional se basa en 10 tablas principales ([models.py](file:///c:/Users/jhona/Desktop/spinjob-backend/models.py)):

- **Users (`users`):** Almacena la información de usuarios del sistema. Campos: `id` (UUID), `email`, `phone` (celular), `name`, `verification_code`, `is_verified` (booleano crucial para permisos), `is_admin`, y `is_vendedor`.
- **Businesses (`businesses`):** Contiene la información del profesional o negocio. Campos clave:
  - `slug` (identificador único para URLs).
  - `status` ("pendiente", "aprobado", "rechazado").
  - `owner_id` (FK a Users).
  - `referred_by` (FK a Users, ID del vendedor que refirió el negocio).
  - `premium` (booleano) y `plan_months` / `expiration_date` para vigencia.
  - `rating` (promedio) y `reviews_count`.
  - Campos de ubicación: `country` (por defecto "Bolivia"), `state` (departamento), `home_delivery` (booleano) y `ubicacion_url` (Google Maps).
  - Contacto y redes: `phone`, `whatsapp_numbers` (array JSON que permite múltiples números de WhatsApp), `facebook`, `instagram`, `linkedin`, `website`, `tiktok`, `github` y `catalog_url` externo.
  - E-E-A-T SEO Fields: `experience_years` (años de experiencia) y `credentials` (matrícula/credencial).
  - Configuración: `genero` y `creation_date`.
- **Specialties (`specialties`):** Catálogo central de categorías y subcategorías del directorio. Campos: `id`, `category` (Categoría), `subcategory` (Subcategoría), y `source` ("system" o "user_other").
- **business_specialties (`business_specialties`):** Tabla de asociación para la relación Muchos a Muchos entre negocios y especialidades.
- **Products (`products`):** Mapea los productos de los catálogos. Guarda `id`, `name`, `description`, `price`, `image_url`, `is_visible` (booleano), `carousel_name` (sección del catálogo) y tiene relación directa con `business_id` (FK a Businesses).
- **Resenas (`resenas`):** Relaciona valoraciones a un negocio. Guarda `id`, `user_id` (FK a Users), `rating` (1-5 estrellas), `descripcion`, `image_url` y `business_id` (FK a Businesses). Cuenta con la restricción de unicidad `_userid_business_resena_uc` para evitar calificaciones duplicadas por el mismo usuario.
- **Interactions (`interactions`):** Registro de métricas reales (Visitas al perfil, clics en WhatsApp/Redes, etc.). Relaciona `id`, `platform` (tipo de interacción/clic), `date`, `user_id` (FK a Users) y `business_id` (FK a Businesses).
- **SavedCards (`saved_cards`):** Tarjetas guardadas en "Mi Tarjetero" de un usuario. Relaciona `user_id` con `business_id` (FK a Businesses), incluyendo la fecha `saved_date` y restricción de unicidad `_user_business_saved_uc`.
- **Orders (`orders`):** Registra los pedidos generados por clientes. Campos: `id`, `user_id` (FK a Users), `business_id` (FK a Businesses), `customer_name` (nombre ingresado al hacer checkout), `status` ("pendiente", "entregado", "cancelado"), `total_price` y `created_at` (timestamp con huso horario de Bolivia).
- **OrderItems (`order_items`):** Detalle de productos solicitados en un pedido. Campos: `id`, `order_id` (FK a Orders), `product_id` (FK a Products, nullable), `product_name` (nombre del producto en el momento de la compra), `quantity` (cantidad), `price_at_time` (precio unitario histórico) y `subtotal`.

---

## 4. Lógica de Negocio y Flujos del Backend (FastAPI)
- **Autenticación y Seguridad ([auth.py](file:///c:/Users/jhona/Desktop/spinjob-backend/auth.py) & [routers/auth.py](file:///c:/Users/jhona/Desktop/spinjob-backend/routers/auth.py)):**
  - Autenticación simplificada mediante Google OAuth2. Al autenticarse exitosamente con Google, el usuario se crea de forma automática en la base de datos y se le marca como verificado (`is_verified = True`).
  - Si el usuario requiere completar sus datos de contacto, el backend expone el flujo `/usuarios/completar-celular` ([routers/users.py](file:///c:/Users/jhona/Desktop/spinjob-backend/routers/users.py)), requiriendo un número telefónico único de 8 dígitos (Bolivia) antes de continuar a ciertas acciones restringidas.
  - Soporte SMTP para envío de códigos de verificación de 6 dígitos.
- **Moderación de Negocios ([routers/admin.py](file:///c:/Users/jhona/Desktop/spinjob-backend/routers/admin.py)):** Los negocios creados se registran inicialmente en estado `pendiente`. Los administradores pueden cambiar el estado a `aprobado` (para publicarlos en el directorio) o `rechazado` (especificando un motivo `rejection_reason`).
- **Gestión de Catálogos ([routers/products.py](file:///c:/Users/jhona/Desktop/spinjob-backend/routers/products.py)):** Rutas CRUD completas. Lógica de cuotas integrada: límite estricto de **3 productos** para negocios estándar (Gratis) y de **15 productos** para negocios Premium.
- **Sistema de Pedidos / Orders ([routers/orders.py](file:///c:/Users/jhona/Desktop/spinjob-backend/routers/orders.py)):**
  - Permite a los clientes autenticados crear un pedido con múltiples productos del catálogo mediante `POST /businesses/{slug}/orders`.
  - Permite a los dueños de negocios listar los pedidos de su comercio mediante `GET /businesses/{slug}/orders`, con soporte para filtros de fecha específicos.
  - Permite actualizar el estado del pedido mediante `PUT /businesses/{slug}/orders/{order_id}/status` (pendiente/entregado).
- **Métricas e Interacciones ([routers/businesses.py](file:///c:/Users/jhona/Desktop/spinjob-backend/routers/businesses.py)):** Registra clics en enlaces digitales y visitas de perfiles mediante la ruta `/businesses/{slug}/interaccion`.
- **SEO y Sitemaps Dinámicos ([routers/seo.py](file:///c:/Users/jhona/Desktop/spinjob-backend/routers/seo.py)):** Endpoint `/sitemap.xml` dinámico para indexación en Google de categorías y departamentos, y el generador de Open Graph en `/og/{slug}`.

---

## 5. Arquitectura del Frontend (React)

### 5.1. Componentes y Vistas Principales ([src/App.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/App.jsx))
- **[Directory.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/pages/Directory/Directory.jsx):** Landing page y buscador principal con filtros. Mapea categorías y departamentos directamente en la URL (`/directorio/:categoria/:estado`) para maximizar el SEO.
- **[Profile.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/pages/Profile/Profile.jsx):** Ruta dinámica (`/perfil/:slug`) que inyecta los datos JSON-LD estructurados para buscadores de internet. Carga la plantilla unificada de visualización.
- **[PlantillaGenerica.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/plantillas/PlantillaGenerica.jsx):** Plantilla Premium Unificada. Si el usuario actual es el dueño del negocio o un administrador, se habilita el **Modo Edición Inline** que permite modificar directamente títulos, descripciones, redes sociales, ubicación, especialidades y catálogo de productos sin recargar la página. Divide la visualización en los siguientes componentes modulares de [src/plantillas/components/](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/plantillas/components):
  - **[ProfileHero.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/plantillas/components/ProfileHero.jsx):** Contiene la sección superior, foto de avatar con soporte de recorte, título principal, años de experiencia y matrícula/credencial.
  - **[ProfileAbout.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/plantillas/components/ProfileAbout.jsx):** Muestra la descripción/biografía y gestiona la visualización de especialidades/subcategorías.
  - **[ProfileContact.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/plantillas/components/ProfileContact.jsx):** Administra los enlaces a redes sociales, sitio web y ubicación.
  - **[ProfileCatalogEdit.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/plantillas/components/ProfileCatalogEdit.jsx):** Panel CRUD interactivo para añadir, modificar y eliminar productos del catálogo directamente en el perfil.
  - **[ProfileQRModal.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/plantillas/components/ProfileQRModal.jsx):** Modal de código QR para escanear o descargar la tarjeta digital en alta resolución.
- **[OrderSummary.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/pages/OrderSummary/OrderSummary.jsx) (`/perfil/:slug/orden`):** Resumen del pedido y checkout. El cliente revisa los productos y cantidades agregadas, completa su nombre de contacto y procesa la compra.
- **[MyOrders.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/pages/MyOrders/MyOrders.jsx) (`/mis-compras`):** Panel para compradores. Muestra la lista de compras del usuario autenticado y el estado de entrega en tiempo real.
- **[BusinessOrders.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/pages/MyBusinesses/BusinessOrders.jsx) (`/mis-pedidos/:slug`):** Panel para vendedores. Permite al comerciante supervisar los pedidos entrantes, filtrarlos por fecha (Hoy, Todos, Calendario) y marcarlos como "Entregado" o "Pendiente".
- **[CreateBusiness.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/pages/CreateBusiness/CreateBusiness.jsx):** Formulario de creación inicial para nuevos profesionales, vinculando geolocalización.
- **[AdminPanel.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/pages/AdminPanel/AdminPanel.jsx):** Panel administrativo para la aprobación, rechazo y auditoría de negocios creados.
- **[MyBusinesses.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/pages/MyBusinesses/MyBusinesses.jsx) & [BusinessCardHolder.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/pages/BusinessCardHolder/BusinessCardHolder.jsx):** Paneles para administrar los comercios propios del usuario y su tarjetero de favoritos.
- **[MetricsDashboard.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/pages/MetricsDashboard/MetricsDashboard.jsx):** Dashboard de analítica estilo SaaS corporativo con gráficos de Recharts.

### 5.2. Modales del Sistema
- **[AuthModal.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/components/AuthModal.jsx):** Modal multifase adaptativo para gestionar el inicio de sesión e integración de Google.
- **[ModalVerificacion.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/components/ModalVerificacion.jsx):** Maneja el flujo OTP de verificación de cuenta de 6 dígitos.
- **[ReviewModal.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/components/ReviewModal.jsx):** Modal interactivo para dejar opiniones con estrellas e imágenes.
- **[CropModal.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/components/CropModal.jsx):** Aísla la lógica de recorte fotográfico (`react-easy-crop`) en forma rectangular para catálogo o circular para avatar.

### 5.3. Custom Hooks
- **[useDirectoryFilters.js](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/hooks/useDirectoryFilters.js):** Sincroniza la barra de búsqueda y filtros avanzados en la URL mediante Query Params.
- **[useAccionesPerfil.jsx](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/hooks/useAccionesPerfil.jsx):** Centraliza acciones recurrentes de perfiles (compartir, guardar, calificar y clicks analíticos).
- **[useSEO.js](file:///c:/Users/jhona/Desktop/spinjob-fronted/src/hooks/useSEO.js):** Inyecta meta-tags Open Graph, Twitter y Schema.org en el `<head>`.

---

## 6. Características Especiales
- **Modo Edición Inline Unificado:** Los profesionales administran, editan, reordenan especialidades y cargan catálogos directamente desde la interfaz visual de su propia tarjeta, sin necesidad de redirigir a complicados formularios externos.
- **Shopping Cart y Checkout Nativo:** Los clientes pueden añadir múltiples ítems de un catálogo al carrito y formalizar un pedido directamente desde la tarjeta del profesional. Los pedidos se registran en la base de datos y notifican al vendedor.
- **PWA (Progressive Web App):** Instalación con banner personalizado interceptando `beforeinstallprompt` y cacheado inteligente de activos para rendimiento offline.
- **Deferred Actions (Acciones Diferidas):** Guarda la acción de un usuario no logueado (como dar clic a WhatsApp, calificar o hacer un pedido) en `localStorage`, levanta el modal de autenticación y ejecuta la acción automáticamente tras un inicio de sesión exitoso.

---
 
## 7. Planes de Suscripción (Gratis vs Premium)
El sistema diferencia el acceso a las funciones comerciales y de analítica según el estado del campo `premium` (booleano) en el modelo del negocio:

- **Plan Gratis (`premium = false`):**
  - **Perfil público:** Activo en el directorio.
  - **Catálogo de productos:** Límite estricto de **3 productos**.
  - **Pedidos:** No disponible (carrito y botón de orden ocultos; creación de pedidos bloqueada en backend).
  - **Métricas:** No disponible (acceso bloqueado a `/metricas/:slug` mediante pantalla de bloqueo/paywall y API).
  - **WhatsApp:** Registro de máximo **2 números** de contacto en edición.
  - **Insignia 'Verificado':** No se muestra en perfil ni tarjetas.

- **Plan Premium (`premium = true`):**
  - **Catálogo de productos:** Límite ampliado de **15 productos**.
  - **Pedidos:** Habilitados en el perfil (carrito y formulario de checkout visibles). El backend cuenta y limita la recepción de pedidos a **150 pedidos mensuales** por negocio.
  - **Gestión de Pedidos:** Habilitado (acceso al panel `/mis-pedidos/:slug` para control de entregas y filtros).
  - **Métricas:** Acceso completo al Dashboard interactivo de tráfico e interacciones.
  - **WhatsApp:** Registro de máximo **2 números** (igual al plan Gratis).
  - **Insignia 'Verificado':** Incluida y visible en perfil y tarjetas profesionales.

---
 
## 8. Guía de Inicio Rápido

¡Hola! Bienvenido al proyecto **Tarjetoso**. Esta guía te ayudará a instalar y ejecutar el proyecto en tu computadora de la forma más sencilla posible.

### 🛠️ Requisitos Previos

#### En Windows
1. **Node.js (versión LTS recomendada)**:
   - Descárgalo de [nodejs.org](https://nodejs.org/).
   - O instálalo desde la terminal con:
     ```powershell
     winget install OpenJS.NodeJS
     ```

#### En Fedora
1. **Node.js y NPM**: Instálalo ejecutando:
   ```bash
   sudo dnf install nodejs
   ```

### 🚀 Pasos para Ejecutar

1. **Instalar dependencias:** Abre una terminal en la carpeta del proyecto y ejecuta:
   - **En Windows (CMD / PowerShell):**
     ```cmd
     npm install
     ```
   - **En Fedora / Linux:**
     ```bash
     npm install
     ```

2. **Arrancar la aplicación:** Una vez instaladas las dependencias, ejecuta:
   - **En Windows (CMD / PowerShell):**
     ```cmd
     npm run dev
     ```
   - **En Fedora / Linux:**
     ```bash
     npm run dev
     ```

3. **Ver en el navegador:** Abre [http://localhost:5173/](http://localhost:5173/) en tu navegador.

### 🛑 Detener la Aplicación
Presiona `Ctrl + C` en la terminal para detener el servidor de desarrollo.

---

## 9. Almacenamiento y Estructura de Medios (Cloudinary)
Las imágenes asociadas a cada negocio (foto de perfil y catálogo de productos) se almacenan de forma organizada en carpetas a nivel de raíz dentro de Cloudinary usando el identificador único (`id`) del negocio. Esto optimiza el consumo y mantiene la consistencia visual:

- **Estructura de Directorios:**
  - **Directorio Raíz del Negocio:** `business_{business_id}/`
  - **Foto de Perfil:** Almacenada como `business_{business_id}/profile` (utiliza el metadato `asset_folder` asignado a `business_{business_id}`).
  - **Catálogo de Productos:** Almacenada como `business_{business_id}/products/product_{product_id}` (utiliza el metadato `asset_folder` asignado a `business_{business_id}/products`).

- **Funcionamiento y Sincronización:**
  - **Creación/Edición:** El backend genera el ID del negocio y sube el archivo a Cloudinary aplicando el `public_id` estructurado y el parámetro `asset_folder` respectivo. Esto asegura que el archivo se coloque visualmente dentro de la carpeta correspondiente en el panel de Cloudinary (Dynamic Folder Mode).
  - **Eliminación:** Al eliminar un producto o negocio, el sistema extrae el `public_id` de la URL guardada en la base de datos y envía una solicitud de destrucción a Cloudinary, garantizando la eliminación limpia del almacenamiento.
