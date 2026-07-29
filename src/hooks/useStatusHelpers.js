// src/hooks/useStatusHelpers.js

/**
 * Helper hook that provides status text and colour classes.
 * Keeps the mapping in a single place to avoid duplicated literals.
 */
export const useStatusHelpers = () => {
  const getStatusText = (status) => {
    switch (status) {
      case "pendiente":
      case "pendiente_de_pago":
        return "Pendiente de Pago";
      case "pago_enviado":
        return "Pago en Verificación";
      case "pagado":
        return "Pago Confirmado (Preparando)";
      case "entregado":
        return "Enviado / Entregado";
      case "completado":
        return "Completado";
      case "cancelado":
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pendiente":
      case "pendiente_de_pago":
        return "bg-amber-100 text-amber-800";
      case "pago_enviado":
        return "bg-orange-100 text-orange-800";
      case "pagado":
        return "bg-blue-100 text-blue-800";
      case "entregado":
        return "bg-green-100 text-green-800";
      case "completado":
        return "bg-emerald-100 text-emerald-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return { getStatusText, getStatusColor };
};
