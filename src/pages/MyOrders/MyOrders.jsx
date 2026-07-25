import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, PackageOpen, ShoppingBag, Lock, Sparkles, CheckCircle2, Briefcase, Building, QrCode, Eye, ArrowRight, PackageCheck } from 'lucide-react';
import BottomNavbar from '../../components/BottomNavbar';
import fetchAuth from '../../utils/fetchAuth';
import BusinessOrders from '../MyBusinesses/BusinessOrders';
import { formatOrderCode } from '../../utils/formatOrderCode';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado del Switch Modo Negocio / Modo Cliente
  const [isBusinessMode, setIsBusinessMode] = useState(false);
  const [myBusinesses, setMyBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [selectedBusinessSlug, setSelectedBusinessSlug] = useState('');

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const isLoggedIn = localStorage.getItem('spingamma_user') !== null;
  const isAdmin = (() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        return parsed.is_admin === true || parsed.is_vendedor === true; 
      } catch (e) { return false; }
    }
    return false;
  })();

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem('spingamma_token');
    if (!token) {
      navigate('/');
      return;
    }
    
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    let url = `${API_URL}/usuarios/mis-pedidos`;
    const params = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    try {
      const res = await fetchAuth(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBusinesses = async () => {
    setLoadingBusinesses(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetchAuth(`${API_URL}/usuarios/mis-negocios`);
      if (res.ok) {
        const data = await res.json();
        setMyBusinesses(data);
        const premiumList = data.filter(b => b.premium && b.status === 'aprobado');
        if (premiumList.length > 0 && !selectedBusinessSlug) {
          setSelectedBusinessSlug(premiumList[0].slug);
        }
      }
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error("Error al cargar negocios del usuario", err);
      }
    } finally {
      setLoadingBusinesses(false);
    }
  };

  useEffect(() => {
    if (!isBusinessMode) {
      fetchOrders();
    } else {
      fetchUserBusinesses();
    }
  }, [navigate, startDate, endDate, isBusinessMode]);

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const handleMarkReceived = async (orderId) => {
    if (!window.confirm('¿Confirmas que recibiste tu pedido?')) return;
    setUpdatingOrderId(orderId);
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetchAuth(`${API_URL}/usuarios/pedidos/${orderId}/recibido`, {
        method: 'PUT'
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completado' } : o));
      } else {
        alert("No se pudo actualizar el estado del pedido.");
      }
    } catch (err) {
      console.error(err);
      alert("Hubo un error al conectar con el servidor.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const premiumBusinesses = myBusinesses.filter(b => b.premium && b.status === 'aprobado');

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-[#1A535C]">
      {/* Header Con Switch Modo Negocio / Cliente */}
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm border-b border-gray-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} data-testid="my-orders-back-btn" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#1A535C]">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="bg-[#F9842C]/10 p-2 rounded-xl">
              <ShoppingBag size={20} className="text-[#F9842C]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight">Mis Pedidos</h1>
            </div>
          </div>
        </div>

        {/* Switch Estilo Material (Modo Negocio) */}
        <div className="flex items-center gap-3 shrink-0 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-100" data-testid="business-mode-switch-container">
          <span className={`text-xs font-bold transition-colors ${isBusinessMode ? 'text-[#F9842C]' : 'text-gray-600'}`}>
            Modo Negocio
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isBusinessMode}
            onClick={() => setIsBusinessMode(!isBusinessMode)}
            data-testid="business-mode-switch"
            className="relative inline-flex items-center h-6 w-12 cursor-pointer focus:outline-none select-none shrink-0"
          >
            {/* Pista (Track) */}
            <span 
              className={`w-full h-3 rounded-full transition-colors duration-300 ${
                isBusinessMode ? 'bg-[#F9842C]' : 'bg-gray-300'
              }`} 
            />
            {/* Botón Circular Blanco Deslizable (Thumb) */}
            <span
              className={`absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow-md border border-gray-200/80 transform transition-transform duration-300 flex items-center justify-center ${
                isBusinessMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* CONTENIDO MODO CLIENTE */}
      {!isBusinessMode ? (
        <div className="max-w-3xl mx-auto px-4 mt-6">
          {/* Filtros */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Desde:</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  data-testid="my-orders-start-date-input"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hasta:</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  data-testid="my-orders-end-date-input"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
               <button 
                 onClick={() => { setStartDate(todayStr); setEndDate(todayStr); }} 
                 data-testid="my-orders-today-filter-btn"
                 className="flex-1 sm:flex-none px-4 py-2.5 bg-[#F9842C]/10 text-[#F9842C] hover:bg-[#F9842C]/20 text-xs font-bold rounded-xl transition-colors"
               >
                 Hoy
               </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="animate-spin text-[#F9842C] mb-4" size={32} />
              <p className="font-bold text-gray-500">Cargando tus compras...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center mt-8">
              <div className="mb-4">
                <img src="/oso-carrito.webp" alt="Aún no tienes pedidos" className="w-24 h-24 object-contain mix-blend-multiply opacity-80" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-[#1A535C]">No se encontraron pedidos</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">No hay pedidos registrados en el rango de fechas seleccionado.</p>
              <button 
                onClick={() => navigate('/')}
                data-testid="my-orders-goto-directory-btn"
                className="px-6 py-3 bg-[#F9842C] text-white font-bold rounded-xl shadow-md hover:bg-[#e06516] transition-colors"
              >
                Ir al Directorio
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const dateObj = new Date(order.created_at);
                const dateStr = dateObj.toLocaleDateString();
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                const isCancelado = order.status === "cancelado";
                const isCompletado = order.status === "completado";
                const isEntregado = order.status === "entregado";
                const isPagado = order.status === "pagado";
                const isPagoEnviado = order.status === "pago_enviado";

                const badgeClass = isCancelado 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : isCompletado
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : isEntregado 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : isPagado 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : isPagoEnviado
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
                  : isPagoEnviado
                  ? 'PAGO ENVIADO'
                  : 'PENDIENTE DE PAGO';

                return (
                  <div key={order.id} data-testid={`customer-order-card-${order.id}`} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between transition-all hover:shadow-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-md ${badgeClass}`}>
                          {statusLabel}
                        </span>
                        <p className="text-xs font-bold text-gray-400">{dateStr} • {timeStr}</p>
                      </div>
                      
                      <h3 className="font-extrabold text-lg mb-3">Pedido #{formatOrderCode(order.order_number, order.id)} ({order.customer_name})</h3>
                      
                      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-700">
                              <span className="font-bold text-[#1A535C] mr-2">{item.quantity}x</span> 
                              {item.product_name}
                            </span>
                            <span className="text-gray-500 font-bold text-xs">Bs. {item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="md:w-40 flex flex-col justify-between items-end md:items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4 w-full">
                      <div className="text-right w-full flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total</p>
                        <p className="text-xl font-black text-[#1A535C]">Bs. {order.total_price.toFixed(2)}</p>
                      </div>

                      {order.status === 'pendiente' || order.status === 'pendiente_de_pago' ? (
                        <button
                          type="button"
                          data-testid={`pay-order-btn-${order.id}`}
                          onClick={() => {
                            const targetSlug = order.business_slug || order.business?.slug || 'spingamma';
                            navigate(`/perfil/${targetSlug}/orden/${order.id}`);
                          }}
                          className="w-full mt-3 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all bg-[#F9842C] hover:bg-[#e06516] text-white"
                        >
                          <QrCode size={14} /> Pagar con QR
                        </button>
                      ) : order.status === 'pago_enviado' ? (
                        <button
                          type="button"
                          disabled
                          className="w-full mt-3 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all bg-gray-100 text-gray-500 cursor-not-allowed"
                        >
                          <Loader2 size={14} className="animate-spin" /> Verificando Pago
                        </button>
                      ) : order.status === 'pagado' || order.status === 'entregado' ? (
                        <div className="flex flex-col gap-2 w-full mt-3">
                          {order.status === 'entregado' && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] p-2 rounded-xl text-center font-bold">
                              Tienes 72 horas para confirmar entrega o presentar reclamo
                            </div>
                          )}
                          <button
                            type="button"
                            data-testid={`receive-order-btn-${order.id}`}
                            onClick={() => handleMarkReceived(order.id)}
                            disabled={updatingOrderId === order.id}
                            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                          >
                            {updatingOrderId === order.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <PackageCheck size={14} />
                            )}
                            Producto recibido
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* CONTENIDO MODO NEGOCIO */
        <div className="max-w-4xl mx-auto px-4 mt-6">
          {loadingBusinesses ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="animate-spin text-[#F9842C] mb-4" size={32} />
              <p className="font-bold text-gray-500">Cargando datos de negocio...</p>
            </div>
          ) : premiumBusinesses.length === 0 ? (
            /* PANTALLA CANDADO PREMIUM */
            <div 
              data-testid="premium-lock-container"
              className="bg-gradient-to-br from-[#1A535C]/5 via-[#1D565F]/5 to-transparent border border-gray-200/80 backdrop-blur-lg rounded-3xl p-8 md:p-12 text-center shadow-xl max-w-2xl mx-auto mt-4"
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-[#F9842C] to-[#e06516] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 animate-pulse">
                <Lock size={36} />
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A535C] tracking-tight mb-4 flex items-center justify-center gap-2">
                <Sparkles className="text-[#F9842C] fill-[#F9842C]/20" /> Gestión de Pedidos Premium
              </h2>
              
              <p className="text-[#757778] text-sm mb-6 leading-relaxed max-w-sm mx-auto">
                Para recibir y gestionar los pedidos de tus clientes directamente en Tarjetoso, activa el plan Premium en tu negocio.
              </p>
              
              <div className="bg-white/90 rounded-2xl p-6 border border-gray-100 shadow-sm text-left max-w-sm mx-auto mb-8 flex flex-col gap-3">
                <p className="text-[#1A535C] font-bold mb-2 flex items-center gap-2 border-b border-gray-100 pb-3 text-sm">
                  Beneficios del Plan Premium:
                </p>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 size={18} className="text-[#F9842C] shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700">
                    <strong className="text-[#1A535C]">Hasta 600 pedidos mensuales</strong> (Estados, notificaciones y carrito activo)
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 size={18} className="text-[#F9842C] shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700">
                    <strong className="text-[#1A535C]">Vitrina y catálogo ampliados</strong> (50 productos)
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 size={18} className="text-[#F9842C] shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700">
                    <strong className="text-[#1A535C]">Dashboard de métricas</strong> para el crecimiento de tu negocio
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 size={18} className="text-[#F9842C] shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700">
                    <strong className="text-[#1A535C]">Insignia de Cuenta Verificada</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => setIsBusinessMode(false)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-[#1A535C] font-bold rounded-xl transition-all text-sm"
                  data-testid="lock-back-to-client-btn"
                >
                  Volver a mis compras
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
          ) : (
            /* VISTA DE PEDIDOS DE NEGOCIO PREMIUM */
            <div>
              {/* Selector de Negocio si administra más de uno */}
              {premiumBusinesses.length > 1 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building size={16} className="text-[#F9842C]" /> Seleccionar Negocio:
                  </span>
                  <select 
                    value={selectedBusinessSlug}
                    onChange={(e) => setSelectedBusinessSlug(e.target.value)}
                    data-testid="business-selector-dropdown"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#1A535C] outline-none focus:border-[#F9842C]"
                  >
                    {premiumBusinesses.map(b => (
                      <option key={b.id} value={b.slug}>{b.nombre_negocio || b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Render del panel de pedidos de negocio */}
              <BusinessOrders 
                slugProp={selectedBusinessSlug || premiumBusinesses[0].slug} 
                hideHeader={true} 
              />
            </div>
          )}
        </div>
      )}

      <div className="h-28 md:h-12 w-full shrink-0"></div>
      <BottomNavbar
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onHomeClick={() => navigate('/')}
      />
    </div>
  );
}
