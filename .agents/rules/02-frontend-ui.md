# Estándares de Diseño UI/UX y Branding Dinámico

## Branding y Estética Dinámica
1. **Detección y Carga de Branding:** Al iniciar un nuevo proyecto, el agente debe verificar si existe el archivo `.agents/branding.json` con la definición de marca y colores.
   - **Flujo de Inicialización (Si no existe):**
     - Si el archivo no existe o está vacío, **pregunta activamente al usuario** por el nombre de la marca, el color primario (ej. `#1E3D51`) y el color de acento (ej. `#B95221`).
     - Guarda el resultado escribiendo o sobrescribiendo el archivo `.agents/branding.json` en este formato:
       ```json
       {
         "brandName": "NombreDeMarca",
         "primaryColor": "#HEXCOLOR",
         "accentColor": "#HEXCOLOR"
       }
       ```
     - Una vez creado, utilízalo para todas tus decisiones estéticas sin volver a preguntar.
2. **Tailwind & Glassmorphism:** Usa la paleta cargada dinámicamente de tu archivo de branding. Diseña con efectos modernos: `bg-white/10 backdrop-blur-md border border-white/20`, gradientes fluidos (`from-[primaryColor] to-[accentColor]`) y animaciones dinámicas (`transition-all duration-300 ease-out hover:scale-[1.02]`).
3. **Nombre de marca:** Usa consistentemente el `brandName` definido. NUNCA utilices nombres placeholders ni marcas de otros boilerplates (ej. "SpinJob", "Tarjetoso") en textos visibles al usuario a menos que estén explícitamente configurados.
4. **Imágenes y Fallbacks:** SIEMPRE añade un manejador `onError` con fallback a `ui-avatars.com` u otro proveedor de placeholders dinámicos. Toda subida de imagen que requiera encuadre debe pasar por un componente de recorte/edición (`CropModal` o equivalente) con propiedades de forma correctas (ej. rectangular para banners/productos, redonda para avatares).

## Mobile-First Responsivo
5. **NUNCA usar hover para acciones críticas:** En móvil no existe hover. Las acciones principales deben estar siempre visibles de forma directa.
6. **Grids en móvil:** Usar `grid-cols-1` en móvil, `sm:grid-cols-2`, `md:grid-cols-3` o similares. NUNCA fuerces layouts multidistribución (2 o más columnas) en pantallas pequeñas si rompen la lectura.
7. **Prevenir Overflow (Responsive Robusto)**: Usa `w-full`, `overflow-hidden` o `min-w-0` en contenedores anidados. Además, en componentes que contengan etiquetas de texto fijas y entradas de usuario (como pills, badges o campos de formulario alineados horizontalmente), **usa siempre `flex flex-wrap` o `flex-col sm:flex-row`** y anchos máximos controlados (ej. `w-full sm:flex-1`, `w-24`, o `w-full sm:w-auto` para botones) en lugar de anchos fijos anchos (como `w-32`), para evitar que las etiquetas y campos empujen el diseño hacia afuera del viewport en pantallas móviles.
8. **Textareas:** Usar auto-grow con `useRef` + `useEffect` y contador visual de caracteres.

## z-index Hierarchy
9. **Escala obligatoria de capas (Modificar según arquitectura):**
    - `z-40` → Barras de navegación global flotantes / fijas (ej. `BottomNavbar`)
    - `z-50` → Dropdowns, tooltips, notificaciones temporales
    - `z-[100]` → Modales principales (popups)
    - `z-[999]` → Modales secundarios sobrepuestos (ej. modales de confirmación o recorte de fotos)
    - NUNCA asignes el mismo z-index a capas superpuestas para evitar bugs visuales de oclusión.
