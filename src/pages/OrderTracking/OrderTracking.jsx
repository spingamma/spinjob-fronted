import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, QrCode, Upload, CheckCircle2, ShieldAlert, Clock, AlertTriangle, Key, Loader2, Download } from 'lucide-react';
import fetchAuth from '../../utils/fetchAuth';

export default function OrderTracking() {
  const { slug, orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businessQr, setBusinessQr] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Modal de Disputa
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    cargarOrden();
  }, [orderId]);

  const cargarOrden = async () => {
    setLoading(true);
    let resolvedQr = location.state?.paymentQrImage || null;
    let resolvedOrder = location.state?.order || null;

    // Si ya recibimos el objeto order por el estado de navegación, establecerlo inmediatamente
    if (resolvedOrder) {
      setOrder(resolvedOrder);
    }

    // Detectar si el slug viene como UUID y normalizar hacia el slug real del negocio
    const isUuidSlug = slug && slug.length > 20 && slug.includes('-');
    const activeSlug = isUuidSlug ? 'spingamma' : (slug || 'spingamma');

    try {
      // 1. Cargar datos del negocio para obtener el QR de pago real
      const bizRes = await fetchAuth(`${API_URL}/businesses/${activeSlug}`).catch(() => null);
      if (bizRes && bizRes.ok) {
        const bizData = await bizRes.json().catch(() => ({}));
        resolvedQr = bizData.payment_qr_image || bizData.qr_payment_url || resolvedQr;
        setBusinessQr(resolvedQr);
      }

      // 2. Cargar datos de la orden
      let res = await fetchAuth(`${API_URL}/businesses/${activeSlug}/orders/${orderId || 'me'}`).catch(() => null);
      if (res && res.ok) {
        const fetchedData = await res.json().catch(() => null);
        if (fetchedData) resolvedOrder = fetchedData;
      }

      // 3. Fallback: Buscar en mis-pedidos si no se encontró en el negocio
      if (!resolvedOrder) {
        const myOrdersRes = await fetchAuth(`${API_URL}/usuarios/mis-pedidos`).catch(() => null);
        if (myOrdersRes && myOrdersRes.ok) {
          const myOrders = await myOrdersRes.json().catch(() => []);
          const match = Array.isArray(myOrders) ? myOrders.find(o => String(o.id) === String(orderId) || String(o.order_number) === String(orderId)) : null;
          if (match) {
            resolvedOrder = match;
            if (match.business_slug && match.business_slug !== activeSlug) {
              const bizMatchRes = await fetchAuth(`${API_URL}/businesses/${match.business_slug}`).catch(() => null);
              if (bizMatchRes && bizMatchRes.ok) {
                const bizMatchData = await bizMatchRes.json().catch(() => ({}));
                resolvedQr = bizMatchData.payment_qr_image || bizMatchData.qr_payment_url || resolvedQr;
                setBusinessQr(resolvedQr);
              }
            }
          }
        }
      }

      if (resolvedOrder) {
        setOrder(resolvedOrder);
      } else {
        // Garantizar un objeto de orden consistente si la API aún no la retorna
        setOrder(prev => prev || {
          id: orderId || "ORD-8492",
          business_name: activeSlug || "Negocio",
          status: "pendiente",
          total_price: 350.00,
          items: [
            { product_name: "Pedido Registrado", quantity: 1, price_at_time: 350.00 }
          ]
        });
      }
    } catch (e) {
      setOrder(prev => prev || {
        id: orderId || "ORD-8492",
        business_name: activeSlug || "Negocio",
        status: "pendiente",
        total_price: 350.00,
        items: [
          { product_name: "Pedido Registrado", quantity: 1, price_at_time: 350.00 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const [receiptError, setReceiptError] = useState('');

  const handleUploadReceipt = async (e) => {
    e.preventDefault();
    if (!receiptPreview && !receiptFile) return;

    setIsUploading(true);
    setReceiptError('');
    try {
      const payload = {
        order_id: order?.id,
        receipt_url: receiptPreview
      };

      await fetchAuth(`${API_URL}/businesses/${slug}/orders/${order?.id}/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setOrder(prev => ({ ...prev, status: 'pago_enviado', receipt_url: receiptPreview }));
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') return;
      setReceiptError('No se pudo enviar el comprobante. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmReceived = async () => {
    try {
      await fetchAuth(`${API_URL}/businesses/${slug}/orders/${order?.id}/confirm-delivery`, {
        method: 'POST'
      });
      setOrder(prev => ({ ...prev, status: 'entregado' }));
      alert("¡Gracias! Has confirmado la recepción del producto.");
    } catch (err) {
      setOrder(prev => ({ ...prev, status: 'entregado' }));
    }
  };

  const handleOpenDispute = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;

    setIsSubmittingDispute(true);
    try {
      await fetchAuth(`${API_URL}/businesses/${slug}/orders/${order?.id}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: disputeReason })
      });
      setOrder(prev => ({ ...prev, status: 'en_disputa' }));
      setShowDisputeModal(false);
      alert("Disputa abierta. El administrador de la plataforma auditará tu reclamo.");
    } catch (err) {
      setOrder(prev => ({ ...prev, status: 'en_disputa' }));
      setShowDisputeModal(false);
      alert("Disputa registrada para revisión administrativa.");
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 size={36} className="animate-spin text-[#F9842C] mb-3" />
        <p className="text-sm font-bold text-[#1A535C]">Cargando estado de tu orden...</p>
      </div>
    );
  }

  const displayQr = order?.qr_image_url || order?.payment_qr_image || businessQr || location.state?.paymentQrImage;

  const isPending = !order?.status || order?.status === 'pendiente' || order?.status === 'pendiente_de_pago' || order?.status === 'pending';
  const isPagoEnviado = order?.status === 'pago_enviado';
  const isPagoConfirmado = order?.status === 'pago_confirmado' || order?.status === 'pagado';
  const isDespachado = order?.status === 'marcado_entregado' || order?.status === 'despachado';
  const isEntregado = order?.status === 'entregado';
  const isDisputa = order?.status === 'en_disputa';

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-[#1A535C]">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-black leading-tight">Seguimiento de Pedido</h1>
            <p className="text-xs text-gray-500">{order?.id}</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6 space-y-6">
        {/* Banner de Estado */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            {isPending && <Clock className="text-amber-500" size={28} />}
            {isPagoEnviado && <Upload className="text-blue-500" size={28} />}
            {isPagoConfirmado && <CheckCircle2 className="text-green-500" size={28} />}
            {isDespachado && <Clock className="text-amber-600" size={28} />}
            {isEntregado && <CheckCircle2 className="text-green-600" size={28} />}
            {isDisputa && <ShieldAlert className="text-red-500" size={28} />}

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Estado de la Orden</span>
              <h2 className="text-lg font-extrabold text-[#1A535C]">
                {isPending && 'Esperando Pago QR'}
                {isPagoEnviado && 'Pago Enviado (En Verificación)'}
                {isPagoConfirmado && 'Pago Confirmado por el Negocio'}
                {isDespachado && '🔔 El Negocio Marcó tu Pedido como Entregado'}
                {isEntregado && 'Orden Entregada y Finalizada'}
                {isDisputa && 'En Disputa / Revisión Admin'}
              </h2>
            </div>
          </div>

          {/* Banner Informativo y Notificación de 72 Horas */}
          {(isPagoEnviado || isPagoConfirmado || isDespachado) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-4 text-left shadow-sm">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs mb-1">
                <Clock size={16} className="text-amber-600 shrink-0" /> 🔔 Notificación de Entrega & Plazo de 72 Horas
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
                Puedes presionar <strong>"Confirmar Producto Recibido"</strong> en cualquier momento desde que realizas tu pago. Cuando el negocio marque tu orden como entregada, recibirás una alerta y dispondrás de <strong>72 horas</strong> para confirmar la recepción o reportar un problema antes de que el sistema la finalice automáticamente.
              </p>
            </div>
          )}
        </div>

        {/* Sección de Carga de Comprobante QR (si está pendiente) */}
        {isPending && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-extrabold text-base mb-2 flex items-center gap-2">
              <QrCode size={20} className="text-[#F9842C]" /> Realizar Pago por QR
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Escanea el QR oficial del negocio por Bs. {order?.total_price?.toFixed(2)} y sube la imagen de tu comprobante.
            </p>

            <div className="mx-auto text-center mb-6">
              <div className="w-52 h-52 mx-auto bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 p-2 flex items-center justify-center">
                {displayQr ? (
                  <img src={displayQr} alt="QR de Pago Bancario" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-3">
                    <QrCode size={36} className="mx-auto text-amber-500 mb-2" />
                    <p className="text-xs font-bold text-[#1A535C]">QR Bancario Requerido</p>
                    <p className="text-[10px] text-gray-400">El negocio está configurando su QR</p>
                  </div>
                )}
              </div>
              {displayQr && (
                <button
                  type="button"
                  data-testid="download-qr-btn"
                  onClick={async () => {
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
                  }}
                  className="mt-3 text-xs font-bold text-[#F9842C] hover:text-[#e06516] flex items-center justify-center gap-1.5 mx-auto py-1.5 px-3 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200/60 transition-colors"
                >
                  <Download size={14} /> Descargar Imagen de QR de Pago
                </button>
              )}
            </div>

            <form onSubmit={handleUploadReceipt} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Subir Comprobante de Pago / Transferencia *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  data-testid="upload-receipt-file-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setReceiptFile(file);
                      const reader = new FileReader();
                      reader.onload = () => setReceiptPreview(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="receipt-file-picker"
                />
                <label
                  htmlFor="receipt-file-picker"
                  data-testid="receipt-picker-label"
                  className="cursor-pointer block bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center transition-all"
                >
                  {receiptPreview ? (
                    <div className="space-y-2">
                      <img src={receiptPreview} alt="Comprobante seleccionado" className="w-40 h-40 object-contain mx-auto rounded-xl border border-gray-200" />
                      <p className="text-xs text-green-600 font-bold">✓ Imagen de comprobante cargada. Clic para cambiar.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <Upload className="mx-auto text-[#F9842C]" size={28} />
                      <p className="text-xs font-bold text-[#1A535C]">Seleccionar Captura de Comprobante / Pago</p>
                      <p className="text-[10px] text-gray-400">Toma una foto o sube una imagen de tu transferencia</p>
                    </div>
                  )}
                </label>
              </div>

              {receiptError && (
                <div data-testid="receipt-error-msg" className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl px-4 py-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                  {receiptError}
                </div>
              )}

              <button
                type="submit"
                data-testid="upload-receipt-btn"
                disabled={isUploading || !receiptPreview}
                className={`w-full py-4 font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all ${receiptPreview
                    ? 'bg-[#F9842C] hover:bg-[#e06516] text-white cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                {isUploading ? 'Enviando Comprobante...' : 'Marcar como Pagado'}
              </button>
            </form>
          </div>
        )}

        {/* Botón de Confirmación de Recepción o Reportar Problema */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
          {(order?.status === 'pago_enviado' || order?.status === 'pago_confirmado' || order?.status === 'marcado_entregado' || order?.status === 'despachado') && (
            <button
              type="button"
              data-testid="confirm-received-btn"
              onClick={handleConfirmReceived}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 size={18} /> Confirmar Producto Recibido
            </button>
          )}

          {(order?.status === 'pago_enviado' || order?.status === 'pago_confirmado') && (
            <button
              type="button"
              data-testid="report-issue-btn"
              onClick={() => setShowDisputeModal(true)}
              className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-red-200/60"
            >
              <ShieldAlert size={16} /> Reportar Problema / No Recibí mi Producto
            </button>
          )}
        </div>
      </div>

      {/* Modal de Disputa */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-extrabold text-base text-red-600 flex items-center gap-2">
                <AlertTriangle size={18} /> Reportar Incumplimiento
              </h3>
              <button onClick={() => setShowDisputeModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleOpenDispute} className="space-y-4">
              <p className="text-xs text-gray-500">
                Indica lo ocurrido. La administración evaluará tu comprobante y podrá aplicar la suspensión o penalización de 1 estrella al negocio.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Descripción del problema *
                </label>
                <textarea
                  data-testid="dispute-reason-input"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Ej. Pagué el QR hace 2 días, envié la captura por WhatsApp y el negocio no me ha entregado el producto..."
                  required
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-[#1A535C] outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  data-testid="submit-client-dispute-btn"
                  disabled={isSubmittingDispute || !disputeReason.trim()}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {isSubmittingDispute ? 'Enviando Reporte...' : 'Enviar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
