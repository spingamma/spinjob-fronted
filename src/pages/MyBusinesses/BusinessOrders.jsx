import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar, PackageCheck, PackageOpen, Lock, Sparkles, CheckCircle2, XCircle, Eye, Download } from 'lucide-react';
import fetchAuth from '../../utils/fetchAuth';
import { formatOrderCode } from '../../utils/formatOrderCode';

export default function BusinessOrders({ slugProp, hideHeader = false }) {
  const params = useParams();
  const slug = slugProp || params.slug;
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(true);
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const fetchOrders = async (sDate, eDate) => {
    if (!slug) return;
    setLoading(true);
    const token = localStorage.getItem('spingamma_token');
    if (!token) {
      navigate('/');
      return;
    }
    
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    let url = `${API_URL}/businesses/${slug}/orders`;
    const paramsList = [];
    if (sDate) paramsList.push(`start_date=${sDate}`);
    if (eDate) paramsList.push(`end_date=${eDate}`);
    if (paramsList.length > 0) {
      url += `?${paramsList.join('&')}`;
    }

    try {
      const res = await fetchAuth(url);
      if (res.status === 403) {
        try {
          const errData = await res.json();
          if (errData.detail && errData.detail.includes("Premium")) {
            setIsPremium(false);
            return;
          }
        } catch {}
        alert("No tienes permiso para ver los pedidos de este negocio.");
        navigate('/mis-negocios');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const sortedData = data.sort((a, b) => {
          const getScore = (status) => {
            if (status === "pendiente_de_pago" || status === "pendiente") return 0;
            if (status === "pagado") return 1;
            if (status === "entregado") return 2;
            if (status === "cancelado") return 3;
            return 4;
          };
          return getScore(a.status) - getScore(b.status);
        });
        setOrders(sortedData);
        setIsPremium(true);
      } else {
        setOrders([]);
      }
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error(err);
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(startDate, endDate);
  }, [slug, startDate, endDate]);

  const [updatingOrder, setUpdatingOrder] = useState(null);

  const handleStatusChange = async (orderId, newStatus) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    setUpdatingOrder({ id: orderId, status: newStatus });
    
    try {
      const res = await fetchAuth(`${API_URL}/businesses/${slug}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(prev => {
          const updated = prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
          return updated.sort((a, b) => {
            const getScore = (status) => {
              if (status === "pendiente_de_pago" || status === "pendiente") return 0;
              if (status === "pagado") return 1;
              if (status === "entregado") return 2;
              if (status === "cancelado") return 3;
              return 4;
            };
            return getScore(a.status) - getScore(b.status);
          });
        });
      }
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error("Error al actualizar estado", err);
        alert("Hubo un error al actualizar el estado del pedido.");
      }
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleDownloadReceipt = (base64Url, orderNumber) => {
    try {
      const link = document.createElement('a');
      link.href = base64Url;
      link.download = `comprobante-pedido-${orderNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error al descargar comprobante", err);
      alert("Hubo un error al intentar descargar el comprobante.");
    }
  };

  return (
    <div className={`min-h-screen bg-[#F8F9FA] ${hideHeader ? 'pb-8' : 'pb-24'} font-sans text-[#1A535C]`}>
      {/* Header */}
      {!hideHeader && (
        <div className="bg-[#1A535C] text-white px-4 py-5 sticky top-0 z-50 shadow-md flex items-center gap-4">
          <button onClick={() => navigate('/mis-negocios')} data-testid="business-orders-back-btn" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">Gestión de Pedidos</h1>
            <p className="text-xs text-white/70">Panel de administración</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {isPremium ? (
          <>
            {/* Filtros */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Desde:</span>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    data-testid="business-orders-start-date"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hasta:</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    data-testid="business-orders-end-date"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                 <button 
                   onClick={() => { setStartDate(todayStr); setEndDate(todayStr); }} 
                   data-testid="business-orders-today-btn"
                   className="flex-1 md:flex-none px-4 py-2.5 bg-[#F9842C]/10 text-[#F9842C] hover:bg-[#F9842C]/20 text-xs font-bold rounded-xl transition-colors"
                 >
                   Hoy
                 </button>
              </div>
            </div>

            {/* Lista de Pedidos */}
            {loading ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="animate-spin text-[#F9842C] mb-4" size={32} />
                <p className="font-bold text-gray-500">Cargando pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <PackageOpen size={32} className="text-gray-300" />
                </div>
                <h3 className="font-bold text-lg mb-2">No hay pedidos</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">No se encontraron pedidos para la fecha seleccionada.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const isPendiente = order.status === "pendiente_de_pago" || order.status === "pendiente" || order.status === "pago_enviado";
                  const isPagado = order.status === "pagado";
                  const isEntregado = order.status === "entregado";
                  const isCompletado = order.status === "completado";
                  const isCancelado = order.status === "cancelado";

                  const statusBadgeClass = isCancelado
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : isCompletado
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : isEntregado
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : isPagado
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : order.status === "pago_enviado"
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200';

                  const statusLabel = isCancelado
                    ? 'CANCELADO'
                    : isCompletado
                    ? 'COMPLETADO'
                    : isEntregado
                    ? 'ENTREGADO'
                    : isPagado
                    ? 'PAGADO'
                    : order.status === "pago_enviado"
                    ? 'PAGO ENVIADO'
                    : 'PENDIENTE DE PAGO';

                  return (
                    <div key={order.id} data-testid={`business-order-card-${order.id}`} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-[#1A535C] text-sm">Pedido #{formatOrderCode(order.order_number, order.id)}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${statusBadgeClass}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">Cliente: <span className="text-[#1A535C] font-bold">{order.customer_name}</span></p>
                        <p className="text-xs text-gray-400 font-medium">Fecha: <span className="font-semibold text-gray-600">{new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></p>
                        {order.delivered_at && (
                          <p className="text-xs text-green-600 font-medium mt-0.5">Fecha de Entrega: <span className="font-semibold">{new Date(order.delivered_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></p>
                        )}
                      </div>
                      
                      {/* Items Details */}
                      <div className="border-t border-b sm:border-none border-gray-50 py-3 sm:py-0 flex-1 sm:max-w-xs">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <p key={idx} className="text-xs text-gray-500 font-medium line-clamp-1">
                              {item.quantity}x {item.product_name}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider text-right">Total</p>
                          <p className="font-black text-lg text-[#1A535C]">Bs. {order.total_price.toFixed(2)}</p>
                        </div>
                        
                        {!isCancelado && (
                          <div className="flex gap-2 flex-wrap">
                            {isPendiente && (
                              <>
                                {order.receipt_url && (
                                  <button 
                                    onClick={() => handleDownloadReceipt(order.receipt_url, order.order_number)}
                                    data-testid="download-receipt-btn"
                                    className="flex items-center gap-1.5 px-3 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-bold rounded-xl shadow-sm border border-orange-200 transition-colors"
                                  >
                                    <Download size={14} /> Descargar Comprobante
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleStatusChange(order.id, 'cancelado')}
                                  disabled={updatingOrder?.id === order.id}
                                  data-testid="cancel-order-btn"
                                  className="flex items-center gap-1.5 px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingOrder?.id === order.id && updatingOrder?.status === 'cancelado' ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <XCircle size={14} />
                                  )}
                                  Rechazar
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(order.id, 'pagado')}
                                  disabled={updatingOrder?.id === order.id}
                                  data-testid="mark-paid-btn"
                                  className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingOrder?.id === order.id && updatingOrder?.status === 'pagado' ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <CheckCircle2 size={14} />
                                  )}
                                  Marcar Pagado
                                </button>
                              </>
                            )}

                            {isPagado && (
                              <button 
                                onClick={() => handleStatusChange(order.id, 'entregado')}
                                disabled={updatingOrder?.id === order.id}
                                data-testid="mark-delivered-btn"
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingOrder?.id === order.id && updatingOrder?.status === 'entregado' ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <PackageCheck size={14} />
                                )}
                                Entregado
                              </button>
                            )}

                            {isEntregado && (
                              <div className="flex flex-col gap-1 w-full text-right sm:text-left sm:w-auto mt-2 sm:mt-0">
                                <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-3 py-2 rounded-xl border border-green-200">
                                  <PackageCheck size={14} /> Entregado
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">Esperando confirmación del cliente</span>
                              </div>
                            )}

                            {isCompletado && (
                              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                                <CheckCircle2 size={14} /> Confirmado
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="bg-gradient-to-br from-[#1A535C]/5 via-[#1D565F]/5 to-transparent border border-white/40 backdrop-blur-lg rounded-3xl p-8 md:p-12 text-center shadow-xl max-w-2xl mx-auto mt-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#F9842C] to-[#e06516] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 animate-pulse">
              <Lock size={36} />
            </div>
            
            <h2 className="text-3xl font-extrabold text-[#1A535C] tracking-tight mb-4 flex items-center justify-center gap-2">
              <Sparkles className="text-[#F9842C] fill-[#F9842C]/20" /> Gestión de Pedidos Premium
            </h2>
            
            <p className="text-[#757778] text-sm mb-6 leading-relaxed max-w-sm mx-auto">
              Actualiza al plan Premium para desbloquear esta y muchas más herramientas para tu negocio.
            </p>
            
            <div className="bg-white/80 rounded-2xl p-6 border border-gray-200 shadow-sm text-left max-w-sm mx-auto mb-8 flex flex-col gap-3">
              <p className="text-[#1A535C] font-bold mb-2 flex items-center gap-2 border-b border-gray-100 pb-3">
                Incluye todo lo del plan Básico, más:
              </p>
              <div className="flex gap-3 items-start">
                <CheckCircle2 size={18} className="text-[#F9842C] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong className="text-[#1A535C]">Vitrina y catálogo ampliados</strong> (15 visibles, 50 en inventario)
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 size={18} className="text-[#F9842C] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong className="text-[#1A535C]">Hasta 600 pedidos mensuales</strong> (Notificaciones, estados y carrito activo)
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 size={18} className="text-[#F9842C] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong className="text-[#1A535C]">Dashboard de métricas completo</strong> (Analítica para ventas)
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 size={18} className="text-[#F9842C] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong className="text-[#1A535C]">Insignia de Cuenta Verificada</strong> (Más confianza)
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 size={18} className="text-[#F9842C] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong className="text-[#1A535C]">Soporte prioritario</strong> (Vía WhatsApp directo)
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate('/mis-negocios')}
                className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-[#1A535C] font-bold rounded-xl transition-all text-sm"
                data-testid="back-to-businesses-btn"
              >
                Volver
              </button>
              <a 
                href="https://wa.me/59164016676?text=Hola%20SpinGamma,%20quiero%20actualizar%20mi%20negocio%20al%20plan%20Premium%20para%20activar%20los%20Pedidos."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#F9842C] to-[#e06516] text-white font-extrabold rounded-xl hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
                data-testid="activate-premium-orders-btn"
              >
                <Sparkles size={16} /> Activar Premium (US$5/mes)
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
