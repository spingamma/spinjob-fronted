/**
 * Returns today's date formatted in Spanish text (e.g. "17 de Octubre del 2026").
 *
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
export function getFormattedTodayDate(date = new Date()) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} del ${year}`;
}

/**
 * Formats the daily menu message for WhatsApp sharing.
 *
 * @param {string} businessName - Name of the business.
 * @param {Array} products - List of products from the catalog.
 * @param {string} profileUrl - Direct URL to the business profile.
 * @returns {string} Formatted WhatsApp message with markdown and emojis.
 */
export function formatDailyMenuMessage(businessName, products = [], profileUrl = '', currency = '$') {
  // 1. Filtrar productos visibles
  const visibleProducts = (products || []).filter(p => p.is_visible !== false);

  // 2. Si existe un carrusel/sección con nombre alusivo a "Menú del día" o "Almuerzo", priorizarlo
  const menuKeywords = ['menú del día', 'menu del dia', 'menú', 'menu', 'almuerzo', 'almuerzos', 'plato del día'];
  const menuSpecificProducts = visibleProducts.filter(p => {
    const cName = (p.carousel_name || '').toLowerCase().trim();
    return menuKeywords.some(keyword => cName.includes(keyword));
  });

  const selectedProducts = menuSpecificProducts.length > 0 ? menuSpecificProducts : visibleProducts;

  // 3. Formatear la lista de platos
  const dishesList = selectedProducts.map(p => {
    const name = p.name ? p.name.trim() : 'Plato';
    const price = p.price ? p.price.trim() : null;
    return price ? `• *${name}* — ${currency} ${price}` : `• *${name}*`;
  }).join('\n');

  const nameHeader = businessName ? businessName.trim() : 'Nuestro Negocio';
  const todayDateText = getFormattedTodayDate();

  const dishesSection = dishesList
    ? `*${todayDateText}*\n${dishesList}`
    : `*${todayDateText}*\n_Consulta nuestros platos disponibles en la tarjeta._`;

  return `🍽️ *MENÚ DEL DÍA — ${nameHeader.toUpperCase()}*

${dishesSection}

📲 _Haz tus pedidos y reservas directamente desde nuestra tarjeta:_
👉 ${profileUrl}`;
}

