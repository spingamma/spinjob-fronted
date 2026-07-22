/**
 * Formatea el número de pedido en código alfanumérico secuencial:
 * 1 -> "a0001"
 * 9999 -> "a9999"
 * 10000 -> "b0001"
 * 19998 -> "b9999"
 * 19999 -> "c0001"
 *
 * Si el orden no posee un orderNumber (pedidos legacy sin número secuencial),
 * cae como fallback a los últimos 6 caracteres de su UUID.
 */
export function formatOrderCode(orderNumber, fallbackId) {
  if (typeof orderNumber === 'number' && orderNumber > 0) {
    const idx = orderNumber - 1;
    let letterIdx = Math.floor(idx / 9999);
    const subNum = (idx % 9999) + 1;
    
    let letterStr = '';
    while (letterIdx >= 0) {
      letterStr = String.fromCharCode(97 + (letterIdx % 26)) + letterStr;
      letterIdx = Math.floor(letterIdx / 26) - 1;
    }
    
    return `${letterStr}${String(subNum).padStart(4, '0')}`;
  }
  
  if (fallbackId && typeof fallbackId === 'string') {
    return fallbackId.slice(-6);
  }
  
  return '0000';
}
