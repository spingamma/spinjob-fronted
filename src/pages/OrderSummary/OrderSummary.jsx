import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Store, CreditCard, QrCode, Key, ArrowRight, Clock, Download } from 'lucide-react';
import fetchAuth from '../../utils/fetchAuth';

export default function OrderSummary() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, businessName, deliveryMethods, paymentQrImage, ownerId } = location.state || {};

  const userStr = localStorage.getItem('spingamma_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('spingamma_token');

  const isOwner = user && ownerId && String(user.id) === String(ownerId);

  const parsedDeliveryMethods = (() => {
    if (!deliveryMethods) return ["Entrega en el local"];
    try {
      const parsed = typeof deliveryMethods === 'string' ? JSON.parse(deliveryMethods) : deliveryMethods;
      return (Array.isArray(parsed) && parsed.length > 0) ? parsed : ["Entrega en el local"];
    } catch(e) {
      return ["Entrega en el local"];
    }
  })();

  const [customerName, setCustomerName] = useState(isOwner ? 'Venta Presencial' : (user?.nombre || ''));
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(isOwner ? 'presencial' : parsedDeliveryMethods[0]);
  const [presencialPayment, setPresencialPayment] = useState('efectivo');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const getStoredQr = () => {
    try {
      const keys = [
        `spingamma_draft_business_${slug}`,
        'spingamma_draft_business_spingamma',
        'spingamma_draft_business_tarjetoso'
      ];
      for (const k of keys) {
        const stored = localStorage.getItem(k);
        if (stored) {
          const parsed = JSON.parse(stored);
          const qr = parsed.editFormData?.payment_qr_image;
          if (qr && typeof qr === 'string' && qr.length > 10) return qr;
        }
      }
    } catch(e) {}
    return '';
  };

  const storedQr = getStoredQr();
  const [fetchedQrImage, setFetchedQrImage] = useState(paymentQrImage || storedQr || '');

  React.useEffect(() => {
    if (slug) {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const trySlugs = [slug, slug === 'tarjetoso' ? 'spingamma' : 'tarjetoso', 'spingamma'];
      
      const fetchFirstValidQr = async () => {
        for (const s of trySlugs) {
          try {
            const res = await fetchAuth(`${API_URL}/businesses/${s}`);
            if (res && res.ok) {
              const data = await res.json();
              const qr = data.payment_qr_image || data.qr_payment_url || data.payment_qr || data.qr_image || data.qr_image_url || data.qr_code || data.qr || '';
              if (qr) {
                setFetchedQrImage(qr);
                break;
              }
            }
          } catch(e) {}
        }
      };
      fetchFirstValidQr();
    }
  }, [slug]);

  // Redirigir si no está autenticado
  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-[#1A535C] mb-4">Debes iniciar sesión</h2>
        <p className="mb-6 text-[#757778]">Para realizar un pedido necesitas estar registrado e iniciar sesión.</p>
        <button 
          onClick={() => navigate(`/`)}
          className="px-6 py-3 bg-[#F9842C] text-white rounded-xl font-bold"
        >
          Ir al Inicio para ingresar
        </button>
      </div>
    );
  }

  if (!cart || Object.keys(cart).length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-[#1A535C] mb-4">No hay productos en tu orden</h2>
        <button 
          onClick={() => navigate(`/perfil/${slug}`)}
          className="px-6 py-3 bg-[#F9842C] text-white rounded-xl font-bold"
        >
          Volver al perfil
        </button>
      </div>
    );
  }

  const itemsList = Object.values(cart);
  
  const totalPrice = itemsList.reduce((sum, item) => {
    const rawMatch = (item.product.price || "0").replace(/[^\d.-]/g, '');
    const priceNum = parseFloat(rawMatch);
    const validPrice = isNaN(priceNum) ? 0 : priceNum;
    return sum + validPrice * item.quantity;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwner && !customerName.trim()) return;

    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    const orderData = {
      customer_name: customerName.trim() || (isOwner ? "Venta Presencial" : "Cliente"),
      delivery_method: isOwner ? "presencial" : selectedDeliveryMethod,
      payment_method: isOwner ? presencialPayment : "qr_simple",
      status: isOwner ? "entregado" : "pendiente",
      total_price: totalPrice,
      items: itemsList.map(item => {
        const rawMatch = (item.product.price || "0").replace(/[^\d.-]/g, '');
        const priceNum = parseFloat(rawMatch);
        const validPrice = isNaN(priceNum) ? 0 : priceNum;
        return {
          product_id: item.product.id || null,
          product_name: item.product.name,
          quantity: item.quantity,
          price_at_time: validPrice,
          subtotal: validPrice * item.quantity
        };
      })
    };

    try {
      const res = await fetchAuth(`${API_URL}/businesses/${slug}/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) throw new Error("Error al enviar pedido");
      
      const resData = await res.json().catch(() => ({}));
      setCreatedOrder(resData);
      setSuccess(true);
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error(err);
        alert("Hubo un problema al enviar tu pedido. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const qrSource = createdOrder?.qr_image_url || createdOrder?.payment_qr_image || fetchedQrImage || paymentQrImage || storedQr;

    const handleDownloadQr = async () => {
      if (!qrSource) return;
      try {
        const response = await fetch(qrSource);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `QR-Pago-${businessName || slug || 'negocio'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error('Error al descargar QR:', err);
      }
    };

    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={36} className="text-green-600" />
        </div>
        <h2 data-testid="order-success-msg" className="text-xl font-extrabold text-[#1A535C] mb-1">
          {isOwner ? "¡Venta Presencial Registrada!" : "¡Pedido Realizado con Éxito!"}
        </h2>
        <p className="text-xs text-[#757778] mb-4 max-w-sm">
          {isOwner
            ? "El inventario ha sido actualizado automáticamente y el pedido figura como entregado."
            : "Escanea el QR de pago a continuación con la app de tu banco:"}
        </p>

        {!isOwner && (
          <>
            {/* Despliegue del QR de Pago Bancario */}
            <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-md my-2 max-w-xs w-full">
              <p className="text-xs font-bold text-[#1A535C] mb-2 flex items-center justify-center gap-1.5">
                <QrCode size={16} className="text-[#F9842C]" /> QR de Pago del Negocio
              </p>
              {qrSource ? (
                <div className="space-y-2">
                  <img 
                    src={qrSource} 
                    alt="QR de Pago Bancario" 
                    className="w-48 h-48 object-contain mx-auto rounded-xl border border-gray-100 bg-gray-50 p-1"
                  />
                  <button
                    type="button"
                    data-testid="download-qr-btn"
                    onClick={handleDownloadQr}
                    className="text-xs font-bold text-[#F9842C] hover:text-[#e06516] flex items-center justify-center gap-1.5 mx-auto py-1.5 px-3 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200/60 transition-colors"
                  >
                    <Download size={14} /> Descargar Imagen de QR de Pago
                  </button>
                </div>
              ) : (
                <div className="w-48 h-48 bg-orange-50/60 rounded-xl border border-dashed border-orange-200 flex flex-col items-center justify-center mx-auto p-3">
                  <QrCode size={32} className="text-[#F9842C] mb-1" />
                  <span className="text-[11px] font-bold text-[#1A535C]">QR Bancario Requerido</span>
                </div>
              )}
              <p className="text-xs font-black text-[#F9842C] mt-2.5">
                Monto Total: Bs. {totalPrice.toFixed(2)}
              </p>
            </div>

            {/* Aviso de Garantía y Auto-Confirmación de 72 Horas */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 max-w-xs w-full mb-5 text-left shadow-sm">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs mb-1">
                <Clock size={16} className="text-amber-600 shrink-0" /> Garantía de Confirmación & Plazo 72h
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
                Puedes confirmar la recepción del producto en cualquier momento desde tu pantalla de seguimiento. Cuando el negocio marque tu pedido como <strong>"Entregado"</strong>, recibirás una alerta y dispondrás de <strong>72 horas</strong> para confirmar o reportar un problema.
              </p>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          {!isOwner && (
            <button 
              data-testid="go-to-tracking-btn"
              onClick={() => navigate(`/perfil/${slug}/orden/${createdOrder?.id || 'me'}/seguimiento`, { state: { order: createdOrder, paymentQrImage } })}
              className="w-full px-5 py-3 bg-[#F9842C] hover:bg-[#e06516] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              Adjuntar Comprobante <ArrowRight size={14} />
            </button>
          )}
          <button 
            data-testid="back-to-catalog-btn"
            onClick={() => navigate(`/perfil/${slug}`)}
            className="w-full px-5 py-3 bg-gray-100 hover:bg-gray-200 text-[#1A535C] font-bold text-xs rounded-xl transition-all"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-[#1A535C]">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight">
          {isOwner ? "Registrar Venta Presencial" : "Tu Pedido"}
        </h1>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6">
        {isOwner && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <Store size={22} className="text-blue-600 shrink-0" />
            <p className="text-xs font-medium">
              Estás registrando una <strong>Venta Presencial</strong> como propietario. El pedido se marcará directamente como <span className="underline">entregado</span> y se descontará del inventario.
            </p>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-sm font-bold text-[#757778] uppercase tracking-wider mb-4 border-b pb-2">Para: {businessName}</h2>
          
          <div className="space-y-4">
            {itemsList.map((item, idx) => {
              const rawMatch = (item.product.price || "0").replace(/[^\d.-]/g, '');
              const priceNum = parseFloat(rawMatch);
              const validPrice = isNaN(priceNum) ? 0 : priceNum;
              return (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-sm">{item.product.name}</p>
                    <p className="text-xs text-[#757778]">{item.quantity} x Bs. {validPrice.toFixed(2)}</p>
                  </div>
                  <p className="font-black">Bs. {(item.quantity * validPrice).toFixed(2)}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-end">
            <span className="text-gray-500 font-bold">Total a pagar</span>
            <span data-testid="order-total-price" className="text-2xl font-black text-[#F9842C]">Bs. {totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">
            {isOwner ? "Detalles de la Venta Presencial" : "Datos del Cliente"}
          </h3>

          <div className="mb-6">
            <label className="block text-sm font-bold text-[#757778] mb-2">
              {isOwner ? "Nombre de Cliente / Referencia (Opcional)" : "Nombre completo *"}
            </label>
            <input 
              data-testid="order-customer-name-input"
              type="text" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={isOwner ? "Ej. Venta Presencial / Cliente Don Juan" : "Ej. Juan Pérez"}
              required={!isOwner}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C] transition-all"
            />
          </div>

          {isOwner ? (
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#757778] mb-2">Medio de Pago Presencial</label>
              <select
                data-testid="select-presencial-payment-method"
                value={presencialPayment}
                onChange={(e) => setPresencialPayment(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C] transition-all cursor-pointer font-medium"
              >
                <option value="efectivo">Efectivo en Caja</option>
                <option value="qr_presencial">QR Simple Presencial</option>
                <option value="otro">Otro / Tarjeta</option>
              </select>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#757778] mb-2">Método de entrega *</label>
              <select 
                value={selectedDeliveryMethod}
                onChange={(e) => setSelectedDeliveryMethod(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C] transition-all cursor-pointer"
              >
                <option value="" disabled>Seleccione un método</option>
                {parsedDeliveryMethods.map((m, i) => (
                  <option key={i} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            data-testid={isOwner ? "btn-register-presencial-sale" : "order-submit-btn"}
            type="submit"
            disabled={loading || (!isOwner && !customerName.trim())}
            className="w-full py-4 rounded-xl text-white font-bold bg-[#F9842C] hover:bg-[#e06516] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {loading ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5"></span> : <Send size={18} />}
            {loading ? 'Procesando...' : (isOwner ? 'Registrar Venta Presencial' : 'Enviar Pedido')}
          </button>
        </form>
      </div>
    </div>
  );
}

