# Documentación Técnica y Arquitectura del Proyecto "Tarjetoso"

> **Convención de rutas:** Ambos repositorios (`spinjob-fronted/` y `spinjob-backend/`) deben estar como carpetas hermanas dentro de un mismo directorio padre.
> ```
> <carpeta-padre>/
> ├── spinjob-fronted/    ← Este repositorio (Frontend)
> └── spinjob-backend/    ← Repositorio Backend
> ```

## 1. Resumen del Proyecto
Tarjetoso es una plataforma web (PWA) de directorio de servicios y profesionales enfocada en Bolivia. Permite a profesionales y negocios crear "tarjetas digitales" públicas, recibir reseñas, mostrar sus enlaces (redes sociales, WhatsApp, ubicación) y ser descubiertos mediante un buscador con filtros avanzados.

El proyecto incorpora un panel de administración para moderación de contenido, una **plantilla premium unificada** (`src/plantillas/PlantillaGenerica.jsx`) con soporte de **Modo Edición Inline** (para editar datos, redes, especialidades y catálogo en tiempo real sin salir de la tarjeta), una funcionalidad de **Catálogo de Productos** integrado, un **Dashboard de Métricas** avanzado y un **Sistema de Pedidos (Shopping Cart y Checkout)** completo que permite a los clientes realizar compras directamente a través de la tarjeta del profesional.

---

## 2. Stack Tecnológico
- **Backend:** Python 3.8+, FastAPI, SQLAlchemy (ORM), psycopg2 (PostgreSQL), Alembic (migraciones).
- **Frontend:** React 19 (Vite 8), Tailwind CSS 4, React Router DOM 7, Lucide React (Iconos), Recharts (Visualización de datos), react-helmet-async (SEO dinámico), react-easy-crop (Recorte de imágenes), qrcode.react (Generación de QR), jsPDF + jspdf-autotable (Exportación PDF).
- **Base de Datos:** PostgreSQL alojada en Neon DB.
- **Almacenamiento de Medios:** Cloudinary (imágenes de perfil, reseñas y catálogo de productos).
- **Autenticación:** JWT (JSON Web Tokens), Google OAuth2 con flujo nativo Google Identity Services (GSI) vía `@react-oauth/google`, verificación SMTP (Gmail).
- **Despliegue:** Frontend en Vercel (SPA con rewrites), Backend en servidor Oracle Cloud (IP: `129.80.108.184`).
- **Infraestructura Adicional:** Script de backups automáticos hacia Google Drive (`pg_dump`).

---

## 3. Arquitectura de la Base de Datos (Modelos SQLAlchemy)
El sistema relacional se basa en 13 tablas principales (`spinjob-backend/models.py`):

- **Users (`users`):** Almacena la información de usuarios del sistema. Campos: `id` (UUID), `email`, `phone` (celular), `name`, `verification_code`, `is_verified` (booleano crucial para permisos), `is_admin`, `is_vendedor`, `country` (país seleccionado, por defecto "Bolivia") y `state` (departamento/estado, nullable).
- **Businesses (`businesses`):** Contiene la información del profesional o negocio. Campos clave:
  - `slug` (identificador único para URLs).
  - `status` ("pendiente", "aprobado", "rechazado").
  - `owner_id` (FK a Users).
  - `referred_by` (FK a Users, ID del vendedor que refirió el negocio).
  - `verified` (booleano, insignia de verificación visual).
  - `rating` (promedio) y `reviews_count`.
  - Campos de ubicación: `country` (por defecto "Bolivia"), `state` (departamento), `home_delivery` (booleano), `national_delivery` (booleano, indica si realiza envíos a nivel nacional) y `ubicacion_url` (Google Maps).
  - Contacto: `phone`, `whatsapp_numbers` (array JSON que permite múltiples números de WhatsApp).
  - E-E-A-T SEO Fields: `experience_years` (años de experiencia) y `credentials` (matrícula/credencial).
  - Configuración y pedidos: `genero`, `orders_enabled` (booleano que indica si el negocio tiene habilitada la recepción de pedidos), `carousel_order` (orden de visualización de secciones en formato texto/JSON), `delivery_methods` (métodos de envío/entrega disponibles del negocio en formato array JSON), `qr_payment_url` (URL de imagen QR para pagos) y `pickup_fee` (tarifa de retiro en punto de recogida).
  - Catálogo externo: `catalog_url`.
  - **Propiedades computadas SEO:** `category` y `subcategories` se derivan dinámicamente de la relación con `specialties`. `canonical_url` y `json_ld` (Schema.org con `@graph` que incluye `LocalBusiness` + `BreadcrumbList`) se generan como `@property`.
  - **Redes sociales** se delegan a la tabla separada `BusinessSocialLinks` (ver abajo), accedidas mediante propiedades proxy (`facebook`, `instagram`, `linkedin`, `website`, `tiktok`, `github`).
  - **Suscripción** se delega a la tabla separada `BusinessSubscription` (ver abajo), accedida mediante propiedades proxy con setter (`premium`, `plan_months`, `expiration_date`, `creation_date`).
- **BusinessSocialLinks (`business_social_links`):** Tabla normalizada 1:1 con `businesses`. Almacena los enlaces de redes sociales: `facebook`, `instagram`, `linkedin`, `website`, `tiktok`, `github`. Relacionada vía `business_id` (FK con `ondelete=CASCADE`).
- **BusinessSubscription (`business_subscriptions`):** Tabla normalizada 1:1 con `businesses`. Almacena datos de suscripción: `creation_date`, `plan_months`, `expiration_date` y `premium` (booleano). Relacionada vía `business_id` (FK con `ondelete=CASCADE`).
- **Specialties (`specialties`):** Catálogo central de categorías y subcategorías del directorio. Campos: `id`, `category` (Categoría), `subcategory` (Subcategoría), y `source` ("system" o "user_other"). Restricción de unicidad `_category_subcategory_uc`.
- **business_specialties (`business_specialties`):** Tabla de asociación para la relación Muchos a Muchos entre negocios y especialidades.
- **Locations (`locations`):** Tabla de configuración geográfica para estructurar la jerarquía de países y departamentos/estados activos. Campos: `id` (String), `country` (String), `state` (String). Restricción de unicidad `_country_state_uc`.
- **Products (`products`):** Mapea los productos de los catálogos. Guarda `id`, `name`, `description`, `price` (String), `image_url`, `is_visible` (booleano), `carousel_name` (sección del catálogo, default "Catálogo"), `stock` (Integer, nullable, representando la cantidad de inventario disponible; si es nulo, significa stock infinito) y tiene relación directa con `business_id` (FK a Businesses).
- **Resenas (`resenas`):** Relaciona valoraciones a un negocio. Guarda `id`, `user_id` (FK a Users), `rating` (1-5 estrellas), `descripcion`, `image_url` y `business_id` (FK a Businesses). Cuenta con la restricción de unicidad `_userid_business_resena_uc` para evitar calificaciones duplicadas por el mismo usuario. Incluye propiedad computada `user_name` derivada de la relación con User.
- **Interactions (`interactions`):** Registro de métricas reales (Visitas al perfil, clics en WhatsApp/Redes, etc.). Relaciona `id`, `platform` (tipo de interacción/clic), `date`, `user_id` (FK a Users) y `business_id` (FK a Businesses).
- **SavedCards (`saved_cards`):** Tarjetas guardadas en "Mi Tarjetero" de un usuario. Relaciona `user_id` con `business_id` (FK a Businesses), incluyendo la fecha `saved_date` y restricción de unicidad `_user_business_saved_uc`.
- **Orders (`orders`):** Registra los pedidos generados por clientes. Campos: `id`, `order_number` (Integer, nullable, secuencial por negocio), `user_id` (FK a Users), `business_id` (FK a Businesses), `customer_name` (nombre ingresado al hacer checkout), `status` (default `"pendiente_de_pago"`, valores: `"pendiente_de_pago"`, `"pagado"`, `"entregado"`, `"cancelado"`), `delivery_method` (método de envío seleccionado), `pickup_business_id` (FK a Businesses, nullable, ID del punto de recogida si aplica), `total_price`, `receipt_url` (String, comprobante de pago), `payment_rejection_reason` (String, nullable, motivo de rechazo de pago), `created_at` (timestamp de creación del pedido) y `delivered_at` (timestamp en el que el pedido cambió a estado "entregado").
- **OrderItems (`order_items`):** Detalle de productos solicitados en un pedido. Campos: `id`, `order_id` (FK a Orders), `product_id` (FK a Products, nullable), `product_name` (nombre del producto en el momento de la compra), `quantity` (cantidad), `price_at_time` (precio unitario histórico) y `subtotal`.

---

## 4. Lógica de Negocio y Flujos del Backend (FastAPI)

### 4.1. Arquitectura de Capas (Controller-Service-Model)
El backend está estructurado bajo un patrón de capas para separar responsabilidades:
- **Routers (`spinjob-backend/routers/`):** Controladores de FastAPI que definen endpoints, inyectan dependencias y orquestan flujos. Incluye: `admin.py`, `auth.py`, `businesses.py`, `countries.py`, `orders.py`, `products.py`, `reviews.py`, `seo.py`, `specialties.py`, `tarjetero.py`, `users.py`.
- **Servicios (`spinjob-backend/services/`):** Capa de lógica de negocio pura. Incluye: `admin_service.py`, `business_service.py`, `email_service.py`, `order_service.py`, `product_service.py`, `user_service.py`.
- **Schemas Pydantic (`spinjob-backend/schemas/`):** Modelos modulares de validación de datos: `business.py`, `user.py`, `order.py`, `product.py`, `specialty.py`, `location.py`, `common.py`.
- **Modelos SQLAlchemy (`spinjob-backend/models.py`):** Entidades de mapeo relacional a base de datos.
- **Utilidades (`spinjob-backend/utils/`):** Helpers especializados como `url_resolver.py` (resolución y normalización de URLs).
- **Migraciones (`spinjob-backend/alembic/`):** Migraciones de esquema de BD gestionadas con Alembic.
- **Testing:** Entorno de pruebas con soporte de base de datos en contenedor (`docker-compose.test.yml`), script de inicialización (`init_test_db.py`) y configuración separada (`.env.test`).

### 4.2. Flujos Principales
- **Autenticación y Seguridad** (`spinjob-backend/auth.py`, `spinjob-backend/routers/auth.py`):
  - Autenticación simplificada mediante Google OAuth2. Al autenticarse exitosamente con Google, el usuario se crea de forma automática en la base de datos y se le marca como verificado (`is_verified = True`).
  - Si el usuario requiere completar sus datos de contacto, el backend expone el flujo `/usuarios/completar-celular` (`spinjob-backend/routers/users.py`), requiriendo un número telefónico único (validado por país) antes de continuar a ciertas acciones restringidas.
  - Soporte SMTP para envío de códigos de verificación de 6 dígitos.
- **Moderación de Negocios** (`spinjob-backend/routers/admin.py`): Los negocios creados se registran inicialmente en estado `pendiente`. Los administradores pueden cambiar el estado a `aprobado` (para publicarlos en el directorio) o `rechazado` (especificando un motivo `rejection_reason`).
- **Flujo de Vendedores y Códigos de Afiliación** (`spinjob-backend/routers/admin.py`, `spinjob-backend/routers/businesses.py`):
  - **Límite de Creación:** Un usuario normal sin privilegios (no administrador y no vendedor) está restringido a crear **como máximo 1 negocio** en el sistema. Los usuarios marcados como vendedores (`is_vendedor = True`) o administradores pueden crear múltiples comercios sin restricciones.
  - **Generación de Código:** El sistema calcula dinámicamente un código de vendedor para los afiliados a partir de las `2 primeras letras del email + 3 últimos dígitos del celular` del vendedor (ej: `jh345`).
  - **Prueba Temporal Referida:** Al crear un negocio, el dueño puede introducir el código de un vendedor. Si posee un referente válido, al aprobarse el negocio por administración se le asignan automáticamente **3 meses de plan Premium de prueba** (`premium = True`). Si se aprueba sin referente, inicia con **12 meses de plan Gratis estándar**.
  - **CRUD de Vendedor:** Rutas bajo `/vendedor/` que permiten a un afiliado obtener su código (`/vendedor/my-code`), listar los negocios que ha registrado (`/vendedor/businesses`) y transferir la propiedad del negocio al dueño final (`/vendedor/businesses/{slug}/transfer`) una vez configurado.
- **Gestión Geográfica de Países y Departamentos** (`spinjob-backend/routers/countries.py`):
  - Expone el endpoint `/countries/` para obtener de forma estructurada los países y sus respectivos departamentos/estados activos configurados por la administración en la tabla `locations`.
- **Gestión de Especialidades** (`spinjob-backend/routers/specialties.py`):
  - Rutas CRUD para administrar el catálogo de categorías/subcategorías del directorio. Soporta creación de especialidades por sistema (admin) y por usuario (fuente "user_other").
- **Gestión de Catálogos** (`spinjob-backend/routers/products.py`): Rutas CRUD completas. Lógica de cuotas integrada: límite estricto de **3 productos** para negocios estándar (Gratis) y de **50 productos** para negocios Premium.
- **Sistema de Pedidos / Orders** (`spinjob-backend/routers/orders.py`, `spinjob-backend/services/order_service.py`):
  - Permite a los clientes autenticados crear un pedido con múltiples productos del catálogo mediante `POST /businesses/{slug}/orders`.
  - **Numeración Secuencial:** Cada pedido recibe un `order_number` secuencial por negocio, formateado como código alfanumérico (ej: `a0001`, `b0001`).
  - **Límites de Suscripción:** Solo disponible para negocios en plan **Premium**. Además, cuenta con un límite estricto de **600 pedidos mensuales** por negocio (verificado en backend).
  - **Soporte de Pago QR (Nativo):** Cuando un negocio tiene un código QR de pago (`qr_payment_url`), los pedidos requieren subir comprobante de pago (`receipt_url`). El dueño puede rechazar un pago especificando un `payment_rejection_reason`.
  - **Punto de Recogida (Pickup):** Los pedidos pueden especificar un `pickup_business_id` cuando el método de envío es retiro en un punto aliado, y una `pickup_fee` configurable.
  - **Control de Inventario (Stock):** Al crear el pedido, se deduce automáticamente la cantidad seleccionada del `stock` de cada producto. Si un pedido cambia de estado a `cancelado`, se restituye la cantidad de inventario correspondiente a cada producto. Además, se implementó una UX de reducción manual de inventario para que el vendedor pueda rebajar el stock al realizar ventas físicas fuera del sistema.
  - **Zona Horaria y Ciclo de Estados:** El flujo de estados transita por: `pendiente_de_pago` → `pagado` → `entregado` → `cancelado` (desde cualquier punto previo). Al marcar como `entregado`, se registra el timestamp en `delivered_at` basándose en la zona horaria del país (ej. `America/La_Paz`).
- **Sistema de Calificaciones y Reseñas** (`spinjob-backend/routers/reviews.py`):
  - Permite a los usuarios autenticados calificar a un negocio con una puntuación de 1 a 5 estrellas, una descripción textual y opcionalmente adjuntar una imagen.
  - Cuenta con una restricción de unicidad (`_userid_business_resena_uc`): un usuario puede registrar como máximo una reseña por negocio. Si desea cambiarla, debe actualizarla mediante una petición `PUT`.
  - Cada vez que se crea, edita o elimina una reseña, el backend ejecuta la función `_recalcular_rating` para recalcular el promedio (`rating`) y el conteo de opiniones (`reviews_count`) y actualizarlos en la tabla `businesses`.
- **Tarjetero de Favoritos** (`spinjob-backend/routers/tarjetero.py`):
  - Expone rutas de gestión del tarjetero (`POST /tarjetero/{slug}` y `DELETE /tarjetero/{slug}`) para que los usuarios puedan guardar sus tarjetas profesionales favoritas.
  - La relación de guardado se almacena en la tabla `saved_cards` con una restricción de unicidad para evitar registros duplicados.
- **Métricas e Interacciones** (`spinjob-backend/routers/businesses.py`): Registra clics en enlaces digitales y visitas de perfiles mediante la ruta `/businesses/{slug}/interaccion`.
- **SEO y Sitemaps Dinámicos** (`spinjob-backend/routers/seo.py`): Endpoint `/sitemap.xml` dinámico para indexación en Google de categorías y departamentos, y el generador de Open Graph en `/og/{slug}`.

---

## 5. Arquitectura del Frontend (React)

### 5.1. Estructura de Archivos
```
spinjob-fronted/src/
├── App.jsx                  # Router principal (React Router v7, lazy loading)
├── App.css                  # Estilos globales de la aplicación
├── main.jsx                 # Entry point (BrowserRouter, GoogleOAuthProvider, HelmetProvider, AuthProvider)
├── index.css                # Importación de Tailwind CSS
├── assets/
│   ├── oso-carrito.webp     # Asset del carrito de compras (mascota)
│   └── *.webp               # Iconos de categorías (BELLEZA, COMIDA, SALUD, etc.)
├── config/
│   └── api.js               # Única fuente de verdad para API_URL
├── context/
│   └── AuthContext.jsx      # Provider global de autenticación (AuthProvider)
├── components/              # Componentes globales reutilizables
│   ├── AuthModal.jsx
│   ├── BottomNavbar.jsx
│   ├── BusinessDetailsModal.jsx
│   ├── CartQuantityControl.jsx
│   ├── Catalog/             # Subcomponentes modulares del catálogo
│   │   ├── CarouselBlock.jsx
│   │   ├── CatalogSearchBar.jsx
│   │   ├── FloatingOrderButton.jsx
│   │   ├── ProductCard.jsx
│   │   └── hooks/           # Hooks específicos del catálogo
│   │       ├── useCarouselScroll.js
│   │       ├── useCart.js
│   │       └── useCatalogData.js
│   ├── CatalogModal.jsx
│   ├── CatalogSearchGrid.jsx
│   ├── CategoryGrid.jsx
│   ├── CountryModal.jsx
│   ├── CropModal.jsx
│   ├── DirectoryFilterBar.jsx
│   ├── DirectoryFilters/    # Componentes granulares de filtrado
│   │   ├── CategoryBadge.jsx
│   │   ├── DistanceFilter.jsx
│   │   ├── LocationFilter.jsx
│   │   ├── RatingFilter.jsx
│   │   └── SubcategoryFilter.jsx
│   ├── ErrorBoundary.jsx    # Captura de errores de React
│   ├── Header.jsx
│   ├── InlineCatalogCarousel.jsx
│   ├── InstallPrompt.jsx
│   ├── MapSelectorModal.jsx
│   ├── ModalVerificacion.jsx
│   ├── NavMenu.jsx
│   ├── OrderSummary/        # Subcomponentes del proceso de checkout y seguimiento
│   │   ├── CheckoutSection.jsx
│   │   ├── CustomerForm.jsx
│   │   ├── Header.jsx
│   │   ├── OrderHeader.jsx
│   │   ├── OrderItems.jsx
│   │   └── TrackingSection.jsx
│   ├── PhoneInputWithCountry.jsx
│   ├── PlantillaGenerica/   # Acciones del perfil para plantilla
│   │   └── ProfileHeaderActions.jsx
│   ├── PremiumModal.jsx
│   ├── ProfessionalCard.jsx
│   ├── ReloadPrompt.jsx
│   ├── ReviewModal.jsx
│   └── SeoMeta.jsx
├── hooks/                   # Custom Hooks
│   ├── profile/             # Subhooks de interacción del perfil
│   │   ├── useProfileAuth.js
│   │   ├── useProfileInteraction.js
│   │   ├── useProfileQRAndShare.js
│   │   ├── useProfileReview.js
│   │   └── useProfileTarjetero.js
│   ├── useAccionesPerfil.jsx
│   ├── useAuth.js
│   ├── useAuthLogic.js
│   ├── useDirectoryFilters.js
│   ├── useIsMobile.js
│   ├── useLeafletMap.js
│   ├── useOrderData.js
│   ├── useProfileForm.js
│   ├── useReceiptUploader.js
│   ├── useSEO.js
│   └── useStatusHelpers.js
├── pages/                   # Vistas de ruta (lazy-loaded)
│   ├── AdminPanel/
│   ├── BusinessCardHolder/
│   ├── CreateBusiness/
│   ├── Directory/
│   ├── MetricsDashboard/
│   ├── MyBusinesses/        # Incluye BusinessOrders.jsx
│   ├── MyOrders/
│   ├── NotFound.jsx         # Vista 404 global
│   ├── OrderSummary/
│   ├── OrderTracking/
│   └── Profile/
├── plantillas/              # Sistema de plantillas de perfil
│   ├── PlantillaGenerica.jsx
│   ├── components/
│   │   ├── CatalogProductItem.jsx
│   │   ├── CatalogProductsList.jsx
│   │   ├── CatalogSettings.jsx
│   │   ├── FloatingActionBar.jsx
│   │   ├── PickupPointSelector.jsx
│   │   ├── ProductFormModal.jsx
│   │   ├── ProfileAbout.jsx
│   │   ├── ProfileCatalogEdit.jsx
│   │   ├── ProfileContact.jsx
│   │   ├── ProfileHero.jsx
│   │   ├── ProfileIcons.jsx
│   │   ├── ProfileQRModal.jsx
│   │   └── hero/            # Subcomponentes del hero del perfil
│   │       ├── HeroBanner.jsx
│   │       ├── HeroInfoEdit.jsx
│   │       ├── HeroInfoView.jsx
│   │       └── HeroTopNav.jsx
│   ├── hooks/               # Hooks específicos de la plantilla
│   │   ├── useCatalogEdit.js
│   │   ├── useFetchProfileData.js
│   │   ├── usePlantillaGenerica.js
│   │   ├── useProductForm.js
│   │   ├── useProfileDraft.js
│   │   ├── useProfileLocation.js
│   │   └── useProfileSubmit.js
│   └── utils/               # Utilidades específicas de la plantilla
│       └── parseGoogleMapsCoords.js
└── utils/                   # Utilidades puras globales
    ├── cropImage.js
    ├── fetchAuth.js
    ├── formatOrderCode.js
    ├── imageUtils.js
    ├── navigation.js
    ├── phone.js
    └── slugs.js
```

### 5.2. Punto de Entrada (`src/main.jsx`)
Envuelve la aplicación en los siguientes Providers:
- `React.StrictMode` — Detección de problemas en desarrollo.
- `HelmetProvider` — SEO dinámico con `react-helmet-async`.
- `GoogleOAuthProvider` — Autenticación Google vía `@react-oauth/google` (Client ID desde `VITE_GOOGLE_CLIENT_ID`).
- `BrowserRouter` — Enrutamiento SPA con React Router v7.
- `AuthProvider` — Contexto global de autenticación (`src/context/AuthContext.jsx`), centraliza `user`, `login`, `logout`, `updateUser`, `isLoggedIn`, `isAdmin` e `isPremium`.

Además, captura el evento `beforeinstallprompt` de forma temprana en `window.deferredPromptEvent` para garantizar la disponibilidad del prompt PWA.

### 5.3. Contexto Global de Autenticación (`src/context/AuthContext.jsx`)
- **AuthProvider:** Wrapper de estado global que lee/escribe al `localStorage` (`spingamma_user`, `spingamma_token`).
- **Funciones expuestas:** `login(userData, token)`, `logout()`, `updateUser(partial)`.
- **Flags derivados:** `isLoggedIn`, `isAdmin` (incluye vendedores), `isPremium`.
- **Consumo:** Se accede mediante el hook `useAuth()` (`src/hooks/useAuth.js`) que expone el contexto `_AuthContext`.

### 5.4. Configuración Centralizada (`src/config/api.js`)
Única fuente de verdad para la URL base de la API:
```js
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
```

### 5.5. Rutas y Vistas Principales (`src/App.jsx`)
Todas las vistas se cargan con `React.lazy` + `Suspense` (con splash screen animado de marca durante la carga):

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `pages/Directory/Directory.jsx` | Landing page y buscador principal con filtros avanzados |
| `/directorio/:categoria` | Directory.jsx | Filtro por categoría (SEO-friendly) |
| `/directorio/:categoria/:estado` | Directory.jsx | Filtro por categoría + departamento |
| `/perfil/:slug` | `pages/Profile/Profile.jsx` | Tarjeta digital pública con JSON-LD |
| `/crear-negocio` | `pages/CreateBusiness/CreateBusiness.jsx` | Formulario de creación de negocio |
| `/editar-negocio/:slug` | CreateBusiness.jsx | Reutiliza el formulario en modo edición |
| `/mis-negocios` | `pages/MyBusinesses/MyBusinesses.jsx` | Panel de negocios propios del usuario |
| `/admin` | `pages/AdminPanel/AdminPanel.jsx` | Panel de moderación (admin/vendedor) |
| `/tarjetero` | `pages/BusinessCardHolder/BusinessCardHolder.jsx` | Tarjetero de favoritos del usuario |
| `/metricas/:slug` | `pages/MetricsDashboard/MetricsDashboard.jsx` | Dashboard de analítica (solo Premium) |
| `/perfil/:slug/orden/:orderId?` | `pages/OrderSummary/OrderSummary.jsx` | Resumen de pedido, checkout y seguimiento (tracking) |
| `/mis-pedidos/:slug` | `pages/MyBusinesses/BusinessOrders.jsx` | Panel de pedidos entrantes (vendedor) |
| `/mis-compras` | `pages/MyOrders/MyOrders.jsx` | Historial de compras del cliente |
| `*` | `pages/NotFound.jsx` | Página de error 404 (No Encontrado) |

### 5.6. Componentes Globales (`src/components/`)

#### Navegación y Layout
- **Header.jsx:** Barra superior responsiva con búsqueda, menú de usuario (login/logout), selector de país, acceso al carrito y botón de descarga PWA. Integra `NavMenu` y `CountryModal`.
- **NavMenu.jsx:** Menú de navegación reutilizable (Home, Tarjetero, Mis Negocios, Admin/Ventas). Se adapta entre modo desktop (horizontal) y móvil (barra inferior). El label del botón Admin cambia dinámicamente a "Ventas" para usuarios vendedores.
- **BottomNavbar.jsx:** Barra de navegación fija inferior (solo móvil, `md:hidden`) con efecto glassmorphism (`backdrop-blur`). Envuelve a `NavMenu` en modo `isMobile`.

#### Directorio y Búsqueda
- **DirectoryFilterBar.jsx:** Barra de filtros avanzados del directorio: categoría, subcategoría, departamento, barrio/zona, calificación mínima, distancia. Con dropdowns interactivos y búsqueda interna. Está modularizado internamente usando los componentes de la carpeta `DirectoryFilters/` (`CategoryBadge`, `DistanceFilter`, `LocationFilter`, `RatingFilter`, `SubcategoryFilter`).
- **CategoryGrid.jsx:** Grid visual de categorías con iconos WebP mapeados por keywords y navegación SEO-friendly mediante slugs.
- **ProfessionalCard.jsx:** Tarjeta compacta de profesional en el directorio. Muestra avatar, nombre, categoría, rating, insignia verificado, delivery y distancia calculada (con geolocalización del usuario).

#### Autenticación
- **AuthModal.jsx:** Modal multifase adaptativo para inicio de sesión vía Google e ingreso de número de celular. Usa el hook `useAuthLogic` para toda la lógica.
- **ModalVerificacion.jsx:** Flujo OTP de verificación de cuenta con código de 6 dígitos enviado por SMTP.

#### Catálogo y Pedidos
- **InlineCatalogCarousel.jsx:** Carrusel de catálogo embebido directamente en el perfil. Incluye sistema de carrito de compras interactivo (agregar/quitar ítems, contador, botón flotante para ir a la orden). Soporta secciones por `carousel_name` y ordenamiento configurable.
- **CatalogModal.jsx / CatalogSearchGrid.jsx:** Modal alternativo y grid de búsqueda para visualizar el catálogo completo en una ventana superpuesta.
- **Módulos de Catálogo (`components/Catalog/`):** Subcomponentes que encapsulan la interfaz del catálogo: `CarouselBlock.jsx`, `CatalogSearchBar.jsx`, `FloatingOrderButton.jsx` y `ProductCard.jsx`. Incluye hooks propios: `useCarouselScroll.js` (scroll horizontal del carrusel), `useCart.js` (estado del carrito) y `useCatalogData.js` (fetching y formateo de datos del catálogo).
- **Módulos de Orden (`components/OrderSummary/`):** El proceso de checkout y seguimiento se estructura en subcomponentes: `CheckoutSection.jsx` (formulario de checkout), `CustomerForm.jsx` (datos del cliente), `Header.jsx` (cabecera del módulo), `OrderHeader.jsx` (resumen del header del pedido), `OrderItems.jsx` (lista de ítems) y `TrackingSection.jsx` (seguimiento de estado del pedido).
- **CartQuantityControl.jsx:** Control individual (+/-) para gestionar cantidades de un ítem en el carrito de compras respetando los límites de stock.
- **ProfileHeaderActions.jsx** (`PlantillaGenerica/`): Barra flotante de acciones (guardar/cancelar) visible cuando el perfil está en modo edición.

#### Interacción con el Perfil
- **ReviewModal.jsx:** Modal interactivo para dejar opiniones con estrellas (1-5) y opcionalmente adjuntar una imagen.
- **CropModal.jsx:** Modal de recorte fotográfico (`react-easy-crop`) con soporte para modo rectangular (catálogo) y circular (avatar).
- **BusinessDetailsModal.jsx:** Modal de vista detallada en solo lectura de un negocio para el panel de Admin. Incluye el mini-componente `CampoLectura` para campos formateados.

#### Geolocalización y País
- **MapSelectorModal.jsx:** Selector de ubicación con mapa interactivo Leaflet (carga dinámica). Permite buscar direcciones por nombre, usar la ubicación actual del dispositivo y seleccionar un punto en el mapa con marcador arrastrable.
- **CountryModal.jsx:** Modal de selección de país para filtrar el directorio por contexto geográfico. Carga la lista de países disponibles desde la API del backend.
- **PhoneInputWithCountry.jsx:** Input especializado de teléfono que muestra el código de país (+591, etc.) basado en la configuración de `utils/phone.js`. Separa visualmente prefijo y número local.

#### SEO y PWA
- **SeoMeta.jsx:** Componente wrapper de `react-helmet-async` que inyecta meta-tags Open Graph, Twitter Card y JSON-LD dinámicos en el `<head>` de cada página.
- **InstallPrompt.jsx:** Banner de instalación PWA personalizado. Intercepta `beforeinstallprompt`, detecta iOS/Android y modo standalone. Incluye un switch maestro `IS_PWA_ENABLED` para activar/desactivar.
- **ReloadPrompt.jsx:** Notificación de nueva versión disponible del Service Worker. Permite al usuario actualizar la app o descartar. Verifica actualizaciones automáticamente cada hora.

#### Otros Componentes Globales
- **ErrorBoundary.jsx:** Componente envolvente global que captura errores de renderizado de React (`componentDidCatch`), evitando caídas completas de la aplicación (pantalla blanca) y mostrando una UI amigable de contingencia.
- **PremiumModal.jsx:** Modal de upsell o paywall que se muestra a usuarios 'Gratis' cuando intentan acceder a características exclusivas (como métricas avanzadas).

### 5.7. Componentes de Plantilla (`src/plantillas/`)
- **PlantillaGenerica.jsx:** Plantilla Premium Unificada. Si el usuario actual es el dueño del negocio o un administrador, se habilita el **Modo Edición Inline** que permite modificar directamente títulos, descripciones, redes sociales, ubicación, especialidades y catálogo de productos sin recargar la página. Se descompone en los siguientes módulos:

#### Hero del Perfil (`plantillas/components/hero/`)
  - **HeroBanner.jsx:** Sección superior con foto de avatar (recorte circular), título principal, acciones rápidas (compartir, QR, guardar, ubicación) e insignia de verificado. Soporta edición inline de la foto.
  - **HeroInfoView.jsx:** Vista de solo lectura del nombre y título del negocio con insignia Premium.
  - **HeroInfoEdit.jsx:** Formulario de edición inline de datos principales: nombre, título, categoría, subcategorías, país, departamento, ubicación con mapa.
  - **HeroTopNav.jsx:** Barra de navegación superior del perfil con botón de retroceso, login/logout y nombre del usuario.

#### Componentes de Contenido (`plantillas/components/`)
  - **ProfileHero.jsx:** Componente puente que ensambla HeroBanner + HeroInfoView/HeroInfoEdit según el modo.
  - **ProfileAbout.jsx:** Descripción/biografía del negocio y gestión de especialidades/subcategorías con chips interactivos.
  - **ProfileContact.jsx:** Administra los enlaces a redes sociales (WhatsApp, Facebook, Instagram, TikTok, LinkedIn, GitHub), sitio web y ubicación con tracking de clics analíticos.
  - **ProfileCatalogEdit.jsx:** Panel CRUD interactivo para añadir, modificar, eliminar y reordenar productos del catálogo directamente en el perfil. Gestiona secciones por `carousel_name`.
  - **CatalogSettings.jsx:** Panel de configuración avanzada del catálogo: habilitar/deshabilitar pedidos (`orders_enabled`), gestión de QR de pago, métodos de envío y tarifas de recogida.
  - **CatalogProductsList.jsx:** Lista organizada por secciones/carruseles con expansión/colapso de cada grupo.
  - **CatalogProductItem.jsx:** Ítem individual de producto con controles de visibilidad, stock, edición y eliminación.
  - **FloatingActionBar.jsx:** Barra flotante de acciones de guardado/cancelación visible durante la edición de la plantilla.
  - **PickupPointSelector.jsx:** Selector de puntos de recogida aliados para el método de envío "retiro en punto".
  - **ProductFormModal.jsx:** Modal de formulario para crear/editar productos individuales del catálogo. Incluye nombre, descripción, precio, sección (carousel), imagen con recorte y detección de cambios no guardados.
  - **ProfileQRModal.jsx:** Modal de código QR con opción de escanear o descargar la tarjeta digital en alta resolución.
  - **ProfileIcons.jsx:** Iconos SVG personalizados (TikTok, WhatsApp) para redes sociales no incluidas en Lucide React.

### 5.8. Hooks de Plantilla (`src/plantillas/hooks/`)
- **usePlantillaGenerica.js:** Hook maestro que orquesta todo el estado y lógica del componente PlantillaGenerica. Compone los demás hooks de plantilla.
- **useCatalogEdit.js:** Gestiona el estado de edición CRUD del catálogo: productos locales, secciones, ordenamiento y operaciones de guardado.
- **useFetchProfileData.js:** Fetching de datos auxiliares del perfil (especialidades disponibles) en modo edición/creación.
- **useProductForm.js:** Estado y validaciones del formulario de producto individual (nombre, descripción, precio, sección, imagen).
- **useProfileDraft.js:** Persistencia de borradores de edición en `localStorage` para prevenir pérdida de progreso.
- **useProfileLocation.js:** Gestión del estado de ubicación del perfil: parsing de coordenadas desde URL de Google Maps, integración con mapa Leaflet y lista de países/departamentos.
- **useProfileSubmit.js:** Lógica de envío de datos editados al backend (submit del formulario de edición inline).

### 5.9. Custom Hooks Globales (`src/hooks/`)
- **useAuth.js:** Hook consumer del contexto `_AuthContext`. Expone `user`, `isLoggedIn`, `isAdmin`, `isPremium`, `login`, `logout`, `updateUser`.
- **useAuthLogic.js:** Encapsula la lógica completa de autenticación: flujo Google OAuth, completar celular por país, validación de formato telefónico, manejo de token temporal y sesión. Detecta el país por timezone del navegador (La_Paz → Bolivia, Bogota → Colombia, Lima → Perú, Buenos_Aires → Argentina). También obtiene el WhatsApp de soporte desde el perfil de `spingamma`.
- **useDirectoryFilters.js:** Sincroniza la barra de búsqueda y filtros avanzados (categoría, subcategoría, departamento, barrio, rating, distancia) en la URL mediante Query Params y parámetros de ruta para SEO.
- **useAccionesPerfil.jsx:** Centraliza acciones recurrentes de perfiles (compartir, guardar en tarjetero, calificar y registrar clicks analíticos).
- **useProfileForm.js:** Administra el estado complejo y validaciones de los formularios de edición y creación de perfiles.
- **useOrderData.js:** Recolección, parseo y formato de la información de los pedidos.
- **useStatusHelpers.js:** Helpers de formato y presentación visual de estados de pedido.
- **useReceiptUploader.js:** Maneja la lógica de subida de comprobantes de pago para órdenes por QR.
- **useLeafletMap.js:** Abstracción para el manejo del mapa interactivo y coordenadas.
- **useIsMobile.js:** Detección de viewport móvil para renderizado condicional responsivo.
- **useSEO.js:** Inyecta meta-tags Open Graph, Twitter y Schema.org en el `<head>` del documento de forma imperativa.

#### Subhooks de Perfil (`hooks/profile/`)
- **useProfileAuth.js:** Lectura del estado de autenticación del usuario actual desde `localStorage`.
- **useProfileInteraction.js:** Registro de interacciones/clics analíticos en el backend y gestión de acciones diferidas pendientes.
- **useProfileQRAndShare.js:** Lógica de generación de QR y compartir perfil (Web Share API).
- **useProfileReview.js:** Estado y lógica para el flujo de calificación/reseña (modal, verificación, submit).
- **useProfileTarjetero.js:** Lógica de guardado/eliminación de tarjeta en el tarjetero de favoritos.

### 5.10. Utilidades Globales (`src/utils/`)
- **fetchAuth.js:** Wrapper de `fetch` nativo que inyecta automáticamente el header `Authorization: Bearer <token>` desde `localStorage`. Detecta respuestas `401` (token expirado) y auto-desloguea.
- **phone.js:** Mapa centralizado de países admitidos (`COUNTRIES`) con código de país, bandera emoji, y longitud de número. Funciones de limpieza y parseo.
- **formatOrderCode.js:** Convierte `order_number` secuencial en código alfanumérico legible (ej: 1 → `a0001`, 10000 → `b0001`). Fallback a últimos 6 caracteres del UUID para pedidos legacy.
- **imageUtils.js:** Compresión de imágenes en el lado del cliente usando Canvas HTML5 (`compressImage`). Redimensiona a `maxWidth` configurable y convierte a JPEG. No comprime imágenes menores a 300KB.
- **navigation.js:** Helpers puros de enrutamiento: `goBack`, `goToProfile`, `goToHome`, `replaceWithOrder`.
- **slugs.js:** Funciones de normalización de texto a slug SEO-friendly (`slugify`: normaliza acentos, minúsculas, reemplaza espacios por guiones) y `matchSlugToName` (resuelve un slug de vuelta a su nombre legible desde una lista de opciones).
- **cropImage.js:** Utilidades de recorte de imágenes en canvas: `createImage` (carga una imagen de URL), `getCroppedImg` (recorta con soporte de rotación y flip, retorna blob URL) y `getCroppedImgFile` (convierte el resultado a un objeto `File` listo para subir al servidor).

### 5.11. Utilidades de Plantilla (`src/plantillas/utils/`)
- **parseGoogleMapsCoords.js:** Extrae coordenadas (`lat`, `lng`) de una URL de Google Maps. Soporta múltiples formatos: pin data (`!3d!4d`), query parameters (`q=lat,lng`), path place, viewport (`@lat,lng`) y coordenadas directas.

---

## 6. Características Especiales
- **Modo Edición Inline Unificado:** Los profesionales administran, editan, reordenan especialidades y cargan catálogos directamente desde la interfaz visual de su propia tarjeta, sin necesidad de redirigir a complicados formularios externos.
- **Shopping Cart y Checkout Nativo:** Los clientes pueden añadir múltiples ítems de un catálogo al carrito y formalizar un pedido directamente desde la tarjeta del profesional. Los pedidos se registran en la base de datos y notifican al vendedor.
- **PWA (Progressive Web App):** Instalación con banner personalizado interceptando `beforeinstallprompt` y cacheado inteligente de activos para rendimiento offline. Incluye Service Worker con estrategias `NetworkFirst` para la API y `CacheFirst` para imágenes externas (Cloudinary, UI Avatars).
- **Deferred Actions (Acciones Diferidas):** Guarda la acción de un usuario no logueado (como dar clic a WhatsApp, calificar o hacer un pedido) en `localStorage`, levanta el modal de autenticación y ejecuta la acción automáticamente tras un inicio de sesión exitoso.
- **UX Drafts (Persistencia de Borradores en Cliente):** Para evitar la pérdida de progreso al cambiar de aplicación en móviles, la plataforma guarda el estado del formulario de creación/edición de negocios (y contactos) en caché local (`localStorage`). Al regresar, restaura inteligentemente el progreso del borrador aplicando fallbacks de seguridad respecto a los datos reales del servidor, previniendo sobrescribir información oficial con borradores vacíos.
- **Splash Screen Nativo:** Pantalla de carga HTML puro (visible antes de que React monte) con animación de marca Tarjetoso y transición fade-out suave, garantizando una experiencia sin parpadeos.
- **Auto-logout por Token Expirado:** El wrapper `fetchAuth` detecta automáticamente respuestas `401` del backend y cierra la sesión del usuario de forma transparente.
- **Geolocalización con Leaflet:** Mapa interactivo para selección de ubicación sin dependencias de Google Maps (usa OpenStreetMap vía Leaflet cargado dinámicamente).
- **Internacionalización de País:** Sistema multi-país con selector de país persistente en `localStorage`, detección automática por timezone del navegador y validación de formato telefónico por país.
- **Compresión de Imágenes Client-Side:** Antes de subir imágenes al servidor, se comprimen automáticamente vía Canvas HTML5 (reducción a JPEG con calidad configurable), optimizando el uso de ancho de banda y almacenamiento en Cloudinary.
- **Pago QR Nativo:** Los negocios pueden configurar una imagen QR de pago. Los clientes suben el comprobante directamente desde la interfaz de checkout, y el vendedor puede validar o rechazar el pago.
- **Puntos de Recogida (Pickup):** Los negocios pueden ofrecer retiro en puntos aliados como método de envío, con selector interactivo de puntos y tarifa configurable.

---
 
## 7. Planes de Suscripción (Gratis vs Premium)
El sistema diferencia el acceso a las funciones comerciales y de analítica según el estado del campo `premium` (booleano) en el modelo `BusinessSubscription`:

- **Plan Gratis (`premium = false`):**
  - **Perfil público:** Activo en el directorio.
  - **Catálogo de productos:** Límite estricto de **3 productos**.
  - **Pedidos:** No disponible (carrito y botón de orden ocultos; creación de pedidos bloqueada en backend).
  - **Métricas:** No disponible (acceso bloqueado a `/metricas/:slug` mediante pantalla de bloqueo/paywall y API).
  - **WhatsApp:** Registro de máximo **2 números** de contacto en edición.
  - **Insignia 'Verificado':** No se muestra en perfil ni tarjetas.

- **Plan Premium (`premium = true`):**
  - **Catálogo de productos:** Límite ampliado de **50 productos registrados** (con un máximo de **15 productos visibles** simultáneamente en vitrina).
  - **Pedidos:** Habilitados en el perfil (carrito y formulario de checkout visibles). El backend cuenta y limita la recepción de pedidos a **600 pedidos mensuales** por negocio.
  - **Gestión de Pedidos:** Habilitado (acceso al panel `/mis-pedidos/:slug` para control de entregas y filtros).
  - **Métricas:** Acceso completo al Dashboard interactivo de tráfico e interacciones.
  - **WhatsApp:** Registro de máximo **2 números** (igual al plan Gratis).
  - **Insignia 'Verificado':** Incluida y visible en perfil y tarjetas profesionales.

- **Control de Inventario y Stock:**
  - Tanto en los planes Gratis como Premium se incorpora soporte de control de inventario (`stock`) a nivel de producto.
  - La edición del stock se maneja directamente desde el catálogo inline en la sección de edición, permitiendo fijar un número entero positivo o activar la opción de **"Stock infinito"** (que guarda el campo como `null` en la base de datos).
  - En la interfaz del cliente, si la cantidad agregada al carrito intenta sobrepasar el stock del producto, se arroja una alerta flotante de **"Stock máximo"** impidiendo el exceso.
  - Si el stock de un artículo llega a **0**, se despliega automáticamente una insignia de **"Agotado"** y se inhabilitan los botones de adición en el carrusel de catálogo.

---

## 8. Infraestructura de Despliegue

### 8.1. Frontend (Vercel)
El frontend se despliega como SPA estática en Vercel. La configuración de `vercel.json` define tres rewrites:
1. `/sitemap.xml` → Proxy al backend para el sitemap dinámico.
2. `/api/(.*)` → Proxy de todas las llamadas API al backend (`http://129.80.108.184:8000`).
3. `/(.*)`→ Fallback SPA a `index.html` para que React Router maneje todas las rutas.

### 8.2. Configuración de Desarrollo
- **Variables de entorno** (`.env.development`):
  - `VITE_GOOGLE_CLIENT_ID` — Client ID de Google OAuth2.
  - `VITE_API_URL` — URL base del backend (default: `http://127.0.0.1:8000`).
- **Proxy de desarrollo** (`vite.config.js`): En modo dev, Vite proxea `/api/*` a `http://127.0.0.1:8000` reescribiendo el prefijo `/api`.

### 8.3. Configuración PWA y Optimización de Rendimiento (`vite.config.js`)
Mediante `vite-plugin-pwa` con `registerType: 'prompt'`:
- **Cacheado Workbox:**
  - Assets estáticos: `**/*.{js,css,html,ico,png,svg,webp}`.
  - API profesionales: `NetworkFirst` con caché de 7 días y máximo 50 entradas.
  - Imágenes externas (Cloudinary, UI Avatars): `CacheFirst` con caché de 30 días y máximo 100 entradas.
- **Manifest:** `name: "Tarjetoso Directorio"`, `short_name: "Tarjetoso"`, `display: "standalone"`, `theme_color: "#1E3D51"`, `background_color: "#1D565F"`.
- **Optimización de Recursos (Carga Crítica):**
  - **Conversión a WebP de Imágenes:** Se convirtieron todos los assets estáticos pesados a formato WebP (`icon-192.webp`, `icon-512.webp`, `paw.webp`, `oso-carrito.webp`), logrando reducir un **95%** el peso de la pantalla de carga inicial y eliminando cuellos de botella de renderizado.
  - **Assets de Categorías:** Se migraron los iconos vectoriales SVG pesados a imágenes `.webp` ultraligeras en `src/assets/`, acelerando la carga inicial del directorio principal.
  - **Diseño del Grid de Categorías:** Se modernizó el diseño del contenedor de iconos de categoría en la landing page, pasando de círculos clásicos (`rounded-full`) a un aspecto de tarjetas cuadradas de esquinas suavizadas (`rounded-2xl`).

### 8.4. SEO Estático (`index.html`)
El `index.html` incluye meta-tags de SEO pre-renderizados para crawlers que no ejecutan JavaScript:
- Open Graph completo (og:type, og:url, og:title, og:description, og:image, og:locale `es_BO`).
- Twitter Card (`summary_large_image`).
- Geo-tags para Bolivia.
- Canonical URL a `https://tarjetoso.com/`.
- Archivo `robots.txt` y verificación de Google Search Console (`googled4e7301ca3100293.html`).

---
 
## 9. Guía de Inicio Rápido

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

---

## 10. Almacenamiento y Estructura de Medios (Cloudinary)
Las imágenes asociadas a cada negocio (foto de perfil y catálogo de productos) se almacenan de forma organizada en carpetas a nivel de raíz dentro de Cloudinary usando el identificador único (`id`) del negocio. Esto optimiza el consumo y mantiene la consistencia visual:

- **Estructura de Directorios:**
  - **Directorio Raíz del Negocio:** `business_{business_id}/`
  - **Foto de Perfil:** Almacenada como `business_{business_id}/profile` (utiliza el metadato `asset_folder` asignado a `business_{business_id}`).
  - **Catálogo de Productos:** Almacenada como `business_{business_id}/products/product_{product_id}` (utiliza el metadato `asset_folder` asignado a `business_{business_id}/products`).

- **Funcionamiento y Sincronización:**
  - **Creación/Edición:** El backend genera el ID del negocio y sube el archivo a Cloudinary aplicando el `public_id` estructurado y el parámetro `asset_folder` respectivo. Esto asegura que el archivo se coloque visualmente dentro de la carpeta correspondiente en el panel de Cloudinary (Dynamic Folder Mode).
  - **Eliminación:** Al eliminar un producto o negocio, el sistema extrae el `public_id` de la URL guardada en la base de datos y envía una solicitud de destrucción a Cloudinary, garantizando la eliminación limpia del almacenamiento.
