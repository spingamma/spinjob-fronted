import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar, PackageCheck, PackageOpen, Lock, Sparkles } from 'lucide-react';
import fetchAuth from '../../utils/fetchAuth';

export default function BusinessOrders() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(true);
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [filterDate, setFilterDate] = useState(todayStr);

  const fetchOrders = async (date) => {
    setLoading(true);
    const token = localStorage.getItem('spingamma_token');
    if (!token) {
      navigate('/');
      return;
    }
    
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    let url = `${API_URL}/businesses/${slug}/orders`;
    if (date) {
      url += `?date=${date}`;
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
        setOrders(data);
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
    fetchOrders(filterDate);
  }, [slug, filterDate]);

  const handleStatusChange = async (orderId, newStatus) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    
    try {
      const res = await fetchAuth(`${API_URL}/businesses/${slug}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error("Error al actualizar estado", err);
        alert("Hubo un error al actualizar el estado del pedido.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-[#1A535C]">
      {/* Header */}
      <div className="bg-[#1A535C] text-white px-4 py-5 sticky top-0 z-50 shadow-md flex items-center gap-4">
        <button onClick={() => navigate('/mis-negocios')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight">Gestión de Pedidos</h1>
          <p className="text-xs text-white/70">Panel de administración</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {isPremium ? (
          <>
            {/* Filtros */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative p-2.5 bg-orange-50 text-[#F9842C] rounded-xl cursor-pointer hover:bg-orange-100 transition-colors flex-shrink-0">
                  <Calendar size={20} />
                  <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Seleccionar fecha"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha</p>
                  <p className="font-bold text-[#1A535C]">
                    {filterDate 
                      ? new Date(filterDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) 
                      : 'Todas las fechas'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                 <button onClick={() => setFilterDate('')} className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-xl transition-colors">Todos</button>
                 <button onClick={() => setFilterDate(todayStr)} className="flex-1 sm:flex-none px-4 py-2 bg-[#F9842C]/10 text-[#F9842C] hover:bg-[#F9842C]/20 text-xs font-bold rounded-xl transition-colors">Hoy</button>
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
                  const isEntregado = order.status === "entregado";
                  return (
                    <div key={order.id} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-[#1A535C] text-sm">Pedido #{order.id.slice(-6)}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${isEntregado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">Cliente: <span className="text-[#1A535C] font-bold">{order.customer_name}</span></p>
                        <p className="text-xs text-gray-400 font-medium">Fecha: <span className="font-semibold text-gray-600">{new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></p>
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
                        
                        {!isEntregado ? (
                          <button 
                            onClick={() => handleStatusChange(order.id, 'entregado')}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                          >
                            <PackageCheck size={14} /> Entregado
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusChange(order.id, 'pendiente')}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition-colors"
                          >
                            <PackageOpen size={14} /> Reabrir
                          </button>
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
            
            <p className="text-[#757778] text-base mb-8 leading-relaxed max-w-sm mx-auto">
              Recibe, organiza y procesa los pedidos de tus clientes de manera eficiente. Esta función requiere el plan **Premium**.
            </p>
            
            <div className="bg-white/80 rounded-2xl p-5 border border-gray-200 shadow-sm text-left max-w-sm mx-auto mb-8 flex flex-col gap-3">
              <div className="flex gap-2.5 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F9842C]"></span>
                <p className="text-sm font-bold text-[#1A535C]">Carrito de compras activo en tu tarjeta</p>
              </div>
              <div className="flex gap-2.5 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F9842C]"></span>
                <p className="text-sm font-bold text-[#1A535C]">Hasta 150 pedidos al mes</p>
              </div>
              <div className="flex gap-2.5 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F9842C]"></span>
                <p className="text-sm font-bold text-[#1A535C]">Filtrado y gestión por estado/fecha</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate('/mis-negocios')}
                className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-[#1A535C] font-bold rounded-xl transition-all text-sm"
              >
                Volver
              </button>
              <a 
                href="https://wa.me/59164016676?text=Hola%20SpinGamma,%20quiero%20actualizar%20mi%20negocio%20al%20plan%20Premium%20para%20activar%20los%20Pedidos."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#F9842C] to-[#e06516] text-white font-extrabold rounded-xl hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
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
