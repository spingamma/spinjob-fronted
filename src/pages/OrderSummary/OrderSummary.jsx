import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Store, CreditCard, QrCode, Key, ArrowRight, Clock, Download, Upload, CheckCircle2, ShieldAlert, Loader2, ShoppingBag } from 'lucide-react';
import fetchAuth from '../../utils/fetchAuth';

export default function OrderSummary() {
  const { slug, orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, businessName, deliveryMethods, paymentQrImage, ownerId } = location.state || {};

  const userStr = localStorage.getItem('spingamma_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('spingamma_token');

  const isOwner = user && ownerId && String(user.id) === String(ownerId);
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  // --- Estados de Checkout (Cart) ---
  const parsedDeliveryMethods = (() => {
    if (!deliveryMethods) return ["Entrega en el local"];
    try {
      const parsed = typeof deliveryMethods === 'string' ? JSON.parse(deliveryMethods) : deliveryMethods;
      return (Array.isArray(parsed) && parsed.length > 0) ? parsed : ["Entrega en el local"];
    } catch {
      return ["Entrega en el local"];
    }
  })();
  const [customerName, setCustomerName] = useState(isOwner ? 'Venta Presencial' : (user?.nombre || ''));
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(isOwner ? 'presencial' : parsedDeliveryMethods[0]);
  const [presencialPayment, setPresencialPayment] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  // --- Estados de Seguimiento (Tracking) ---
  const [order, setOrder] = useState(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(!!orderId);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [receiptError, setReceiptError] = useState('');

  // Fallbacks QR
  const getStoredQr = () => {
    try {
      const keys = [`spingamma_draft_business_${slug}`, 'spingamma_draft_business_spingamma', 'spingamma_draft_business_tarjetoso'];
      for (const k of keys) {
        const stored = localStorage.getItem(k);
        if (stored) {
          const parsed = JSON.parse(stored);
          const qr = parsed.editFormData?.payment_qr_image;
          if (qr && typeof qr === 'string' && qr.length > 10) return qr;
        }
      }
    } catch {
      // Ignorar
    }
    return '';
  };
  const storedQr = getStoredQr();
  const [fetchedQrImage, setFetchedQrImage] = useState(paymentQrImage || storedQr || '');

  // Efecto para buscar el QR si no lo tenemos, y si estamos en modo Tracking, cargar la orden
  useEffect(() => {
    if (orderId) {
      cargarOrden();
    } else if (slug) {
      const fetchFirstValidQr = async () => {
        const trySlugs = [slug, slug === 'tarjetoso' ? 'spingamma' : 'tarjetoso', 'spingamma'];
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
          } catch {
            // Ignorar
          }
        }
      };
      fetchFirstValidQr();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, orderId]);

  const cargarOrden = async () => {
    setIsTrackingLoading(true);
    let resolvedOrder = location.state?.order || null;
    let resolvedQr = location.state?.paymentQrImage || fetchedQrImage;

    const isUuidSlug = slug && slug.length > 20 && slug.includes('-');
    const activeSlug = isUuidSlug ? 'spingamma' : (slug || 'spingamma');

    try {
      if (!resolvedQr) {
        const bizRes = await fetchAuth(`${API_URL}/businesses/${activeSlug}`).catch(() => null);
        if (bizRes && bizRes.ok) {
          const bizData = await bizRes.json().catch(() => ({}));
          resolvedQr = bizData.payment_qr_image || bizData.qr_payment_url || resolvedQr;
          setFetchedQrImage(resolvedQr);
        }
      }

      if (!resolvedOrder) {
        let res = await fetchAuth(`${API_URL}/businesses/${activeSlug}/orders/${orderId}`).catch(() => null);
        if (res && res.ok) {
          resolvedOrder = await res.json().catch(() => null);
        } else {
          const myOrdersRes = await fetchAuth(`${API_URL}/usuarios/mis-pedidos`).catch(() => null);
          if (myOrdersRes && myOrdersRes.ok) {
            const myOrders = await myOrdersRes.json().catch(() => []);
            resolvedOrder = Array.isArray(myOrders) ? myOrders.find(o => String(o.id) === String(orderId) || String(o.order_number) === String(orderId)) : null;
          }
        }
      }

      if (resolvedOrder) {
        setOrder(resolvedOrder);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-[#1A535C] mb-4">Debes iniciar sesión</h2>
        <p className="mb-6 text-[#757778]">Para continuar necesitas estar registrado e iniciar sesión.</p>
        <button onClick={() => navigate(`/`)} className="px-6 py-3 bg-[#F9842C] text-white rounded-xl font-bold">Ir al Inicio para ingresar</button>
      </div>
    );
  }

  // Si estamos cargando el tracking
  if (isTrackingLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 size={36} className="animate-spin text-[#F9842C] mb-3" />
        <p className="text-sm font-bold text-[#1A535C]">Cargando información de tu pedido...</p>
      </div>
    );
  }

  // --- MODO CHECKOUT (CART) ---
  if (!orderId && !order) {
    if (!cart || Object.keys(cart).length === 0) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-[#1A535C] mb-4">No hay productos en tu orden</h2>
          <button onClick={() => navigate(`/perfil/${slug}`)} className="px-6 py-3 bg-[#F9842C] text-white rounded-xl font-bold">Volver al perfil</button>
        </div>
      );
    }

    const itemsList = Object.values(cart);
    const totalPrice = itemsList.reduce((sum, item) => {
      const rawMatch = (item.product.price || "0").replace(/[^\d.-]/g, '');
      const priceNum = parseFloat(rawMatch);
      return sum + (isNaN(priceNum) ? 0 : priceNum) * item.quantity;
    }, 0);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!isOwner && !customerName.trim()) return;

      setLoading(true);
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        if (!res.ok) throw new Error("Error al enviar pedido");
        
        const resData = await res.json().catch(() => ({}));
        // Limpiamos el localStorage del carrito al ser exitoso (el comportamiento original de Profile)
        // Redirigimos al mismo componente pero con el orderId inyectado en la URL (cambia a Tracking Mode)
        navigate(`/perfil/${slug}/orden/${resData.id}`, { state: { order: resData, paymentQrImage: fetchedQrImage }, replace: true });
      } catch (err) {
        if (err.message !== 'SESSION_EXPIRED') {
          alert("Hubo un problema al enviar tu pedido. Intenta nuevamente.");
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-[#1A535C]">
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
              <p className="text-xs font-medium">Estás registrando una <strong>Venta Presencial</strong>. Se descontará del inventario.</p>
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
              <span className="text-2xl font-black text-[#F9842C]">Bs. {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-[#1A535C] mb-4 border-b pb-2">Detalles del {isOwner ? 'Cliente' : 'Pedido'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isOwner && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tu Nombre *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#F9842C] focus:ring-4 focus:ring-orange-50 transition-all outline-none font-bold"
                  />
                </div>
              )}
              {isOwner ? (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Método de Pago Recibido *</label>
                  <select value={presencialPayment} onChange={(e) => setPresencialPayment(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 font-bold text-gray-700 outline-none">
                    <option value="efectivo">Efectivo</option>
                    <option value="qr_simple">Transferencia / QR</option>
                    <option value="pos">Tarjeta (POS)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Método de Entrega *</label>
                  <select value={selectedDeliveryMethod} onChange={(e) => setSelectedDeliveryMethod(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 font-bold text-gray-700 outline-none">
                    {parsedDeliveryMethods.map((method, i) => (
                      <option key={i} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              )}
              <button type="submit" disabled={loading} data-testid="confirm-order-btn" className="w-full bg-[#F9842C] hover:bg-[#e06516] text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-60">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={18} />}
                Confirmar Pedido{!isOwner && ' (Pagar con QR)'}
              </button>
              {isOwner && (
                <button
                  type="button"
                  disabled={loading}
                  data-testid="ingresar-venta-realizada-btn"
                  onClick={async () => {
                    if (loading) return;
                    setLoading(true);
                    const orderData = {
                      customer_name: customerName.trim() || 'Venta Presencial',
                      delivery_method: 'presencial',
                      payment_method: presencialPayment,
                      total_price: totalPrice,
                      is_direct_sale: true,
                      items: itemsList.map(item => {
                        const rawMatch = (item.product.price || '0').replace(/[^\d.-]/g, '');
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
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData)
                      });
                      if (!res.ok) throw new Error('Error al registrar venta');
                      navigate('/mis-compras');
                    } catch (err) {
                      if (err.message !== 'SESSION_EXPIRED') {
                        alert('Hubo un problema al registrar la venta. Intenta nuevamente.');
                      }
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ShoppingBag size={18} />}
                  Ingresar Venta Realizada
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- MODO SEGUIMIENTO (TRACKING) ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setReceiptError('El archivo es muy pesado. Máximo 5MB.');
        return;
      }
      setReceiptError('');
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadReceipt = async (e) => {
    e.preventDefault();
    if (!receiptPreview) return;
    setIsUploading(true);
    setReceiptError('');

    try {
      const payload = { order_id: order.id, receipt_url: receiptPreview };
      const activeSlug = slug && slug.includes('-') ? 'spingamma' : (slug || 'spingamma');
      const res = await fetchAuth(`${API_URL}/businesses/${activeSlug}/orders/${order.id}/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Error upload");
      // Redireccionar inmediatamente al carrito de pedidos
      navigate('/mis-compras');
    } catch {
      setReceiptError('No se pudo enviar el comprobante.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmReceived = async () => {
    try {
      const res = await fetchAuth(`${API_URL}/usuarios/pedidos/${order?.id}/recibido`, { method: 'PUT' });
      if (!res.ok) throw new Error("Error al confirmar");
      setOrder(prev => ({ ...prev, status: 'completado' }));
      alert("¡Gracias! Has confirmado la recepción del producto.");
    } catch {
      alert("Hubo un error al confirmar. Intenta nuevamente.");
    }
  };

  const handleReportIssue = () => {
    const text = encodeURIComponent(`Hola Tarjetoso, necesito ayuda con mi pedido #${order?.order_number || order?.id}. El estado marca que el negocio ya lo despachó/entregó pero tengo un problema.`);
    window.open(`https://wa.me/59174116223?text=${text}`, '_blank');
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente':
      case 'pendiente_de_pago': return 'Pendiente de Pago';
      case 'pago_enviado': return 'Pago en Verificación';
      case 'pagado': return 'Pago Confirmado (Preparando)';
      case 'entregado': return 'Enviado / Entregado';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
      case 'pendiente_de_pago': return 'bg-amber-100 text-amber-800';
      case 'pago_enviado': return 'bg-orange-100 text-orange-800';
      case 'pagado': return 'bg-blue-100 text-blue-800';
      case 'entregado': return 'bg-green-100 text-green-800';
      case 'completado': return 'bg-emerald-100 text-emerald-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const displayQr = order?.qr_image_url || order?.payment_qr_image || fetchedQrImage;
  const isPending = !order?.status || order?.status === 'pendiente' || order?.status === 'pendiente_de_pago';

  const handleDownloadQr = async () => {
    if (!displayQr) return;
    try {
      const response = await fetch(displayQr);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QR-Pago-${slug || 'negocio'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error al descargar QR:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-[#1A535C]">
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => navigate('/mis-compras')} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight">Seguimiento de Pedido</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#757778] uppercase tracking-wider mb-1">
                Orden #{order?.order_number || String(order?.id || '').slice(0, 8)}
              </h2>
              <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-md ${getStatusColor(order?.status)}`}>
                {getStatusText(order?.status)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 font-bold block mb-1">Total</span>
              <span className="text-xl font-black text-[#1A535C]">Bs. {parseFloat(order?.total_price || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {isPending && displayQr && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <h3 className="font-extrabold text-[#1A535C] mb-4 flex items-center justify-center gap-2">
              <QrCode size={18} className="text-[#F9842C]" /> Realiza el pago
            </h3>
            <div className="bg-gray-50 p-2 rounded-2xl inline-block border border-gray-100 shadow-inner mb-4">
              <img src={displayQr} alt="QR de Pago" className="w-48 h-48 object-contain rounded-xl" />
            </div>
            
            <button
              type="button"
              data-testid="download-qr-btn"
              onClick={handleDownloadQr}
              className="text-xs font-bold text-[#F9842C] hover:text-[#e06516] flex items-center justify-center gap-1.5 mx-auto mb-4 py-2 px-4 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200/60 transition-colors"
            >
              <Download size={16} /> Descargar Imagen de QR
            </button>

            <p className="text-xs text-gray-500 font-medium mb-4 max-w-[250px] mx-auto">
              Escanea este QR desde la app de tu banco o descárgalo. Luego sube la captura de pantalla del comprobante exitoso abajo.
            </p>
          </div>
        )}

        {(isPending || (order?.status === 'pago_enviado' && !order?.receipt_url)) && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-extrabold text-[#1A535C] mb-4 flex items-center gap-2 text-sm">
              <Upload size={16} className="text-[#F9842C]" /> Sube tu comprobante
            </h3>
            <form onSubmit={handleUploadReceipt} className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center bg-gray-50 hover:bg-orange-50/30 transition-colors relative">
                {receiptPreview ? (
                  <div className="relative inline-block">
                    <img src={receiptPreview} alt="Comprobante" className="max-h-48 rounded-xl shadow-sm border border-gray-200" />
                    <button type="button" onClick={() => { setReceiptPreview(null); }} className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full p-1 border border-red-200 shadow-sm hover:bg-red-200">✕</button>
                  </div>
                ) : (
                  <>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none py-4">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400">
                        <Key size={20} />
                      </div>
                      <span className="text-sm font-bold text-[#1A535C]">Toca para seleccionar imagen</span>
                      <span className="text-[10px] text-gray-400">Solo imágenes (JPG, PNG). Máx 5MB.</span>
                    </div>
                  </>
                )}
              </div>
              {receiptError && <p className="text-xs text-red-500 font-bold text-center">{receiptError}</p>}
              {receiptPreview && (
                <button type="submit" disabled={isUploading} className="w-full py-3.5 bg-[#F9842C] hover:bg-[#e06516] text-white font-bold text-sm rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-60">
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Enviar Comprobante
                </button>
              )}
            </form>
          </div>
        )}

        {(order?.receipt_url || receiptPreview) && !isPending && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
            <h3 className="font-extrabold text-green-700 mb-3 flex items-center justify-center gap-2 text-sm">
              <CheckCircle2 size={18} /> Comprobante Enviado
            </h3>
            <img src={order?.receipt_url || receiptPreview} alt="Comprobante Subido" className="max-h-40 rounded-xl mx-auto border border-gray-200 shadow-sm mb-2" />
            <p className="text-[11px] text-gray-500 font-medium">El administrador está verificando tu pago.</p>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
          {(order?.status === 'pagado' || order?.status === 'entregado' || order?.status === 'pago_enviado') && (
            <button type="button" data-testid="confirm-received-btn" onClick={handleConfirmReceived} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all">
              <CheckCircle2 size={18} /> Confirmar Producto Recibido
            </button>
          )}

          {(order?.status === 'pagado' || order?.status === 'entregado' || order?.status === 'pago_enviado') && (
            <button type="button" data-testid="report-issue-btn" onClick={handleReportIssue} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-red-200/60">
              <ShieldAlert size={16} /> Hacer Reclamo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
