import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, PackageOpen, ShoppingBag } from 'lucide-react';
import BottomNavbar from '../../components/BottomNavbar';
import fetchAuth from '../../utils/fetchAuth';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchOrders();
  }, [navigate, startDate, endDate]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-[#1A535C]">
      {/* Header */}
      <div className="bg-white px-4 py-5 sticky top-0 z-50 shadow-sm border-b border-gray-100 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#1A535C]">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-[#F9842C]/10 p-2 rounded-xl">
            <ShoppingBag size={20} className="text-[#F9842C]" />
          </div>
          <h1 className="text-lg font-extrabold tracking-tight">Mis Pedidos</h1>
        </div>
      </div>

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
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hasta:</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <button 
               onClick={() => { setStartDate(todayStr); setEndDate(todayStr); }} 
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
              <img src="/oso-carrito.png" alt="Aún no tienes pedidos" className="w-24 h-24 object-contain mix-blend-multiply opacity-80" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-[#1A535C]">No se encontraron pedidos</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">No hay pedidos registrados en el rango de fechas seleccionado.</p>
            <button 
              onClick={() => navigate('/')}
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
              const isEntregado = order.status === "entregado";

              return (
                <div key={order.id} data-testid="order-card" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between transition-all hover:shadow-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-md ${isEntregado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-[#F9842C]'}`}>
                        {order.status}
                      </span>
                      <p className="text-xs font-bold text-gray-400">{dateStr} • {timeStr}</p>
                    </div>
                    
                    <h3 className="font-extrabold text-lg mb-3">Pedido para tu cuenta ({order.customer_name})</h3>
                    
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

                  <div className="md:w-32 flex flex-col justify-between items-end md:items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                    <div className="text-right w-full flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total</p>
                      <p className="text-xl font-black text-[#1A535C]">Bs. {order.total_price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-28 md:h-12 w-full shrink-0"></div>
      <BottomNavbar
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onHomeClick={() => navigate('/')}
      />
    </div>
  );
}
