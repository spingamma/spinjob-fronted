export function getStatusText(order) {
  const status = order?.status;
  const isPaqueteria = order?.delivery_method?.startsWith('PAQUETERIA|') || order?.delivery_method === 'paqueteria' || !!order?.pickup_business_id;
  
  switch (status) {
    case 'pendiente':
    case 'pendiente_de_pago':
      return 'Pendiente de Pago';
    case 'pago_enviado':
      return 'Pago en Verificación';
    case 'pagado':
      return 'Pago Confirmado (Preparando)';
    case 'entregado':
      return isPaqueteria ? 'En Camino a Paquetería' : 'Enviado / Entregado';
    case 'ready_for_pickup':
      return 'Listo para Recojo';
    case 'completado':
      return 'Completado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
}

export function getStatusColor(order) {
  const status = order?.status;
  const isPaqueteria = order?.delivery_method?.startsWith('PAQUETERIA|') || order?.delivery_method === 'paqueteria' || !!order?.pickup_business_id;

  switch (status) {
    case 'pendiente':
    case 'pendiente_de_pago':
      return 'bg-amber-100 text-amber-800';
    case 'pago_enviado':
      return 'bg-orange-100 text-orange-800';
    case 'pagado':
      return 'bg-blue-100 text-blue-800';
    case 'entregado':
      return isPaqueteria ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800';
    case 'ready_for_pickup':
      return 'bg-secondary text-white';
    case 'completado':
      return 'bg-emerald-100 text-emerald-800';
    case 'cancelado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
