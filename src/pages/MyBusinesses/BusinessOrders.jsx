import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar, PackageCheck, PackageOpen } from 'lucide-react';

export default function BusinessOrders() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        alert("No tienes permiso para ver los pedidos de este negocio.");
        navigate('/mis-negocios');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(filterDate);
  }, [slug, filterDate]);

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('spingamma_token');
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    
    try {
      const res = await fetch(`${API_URL}/businesses/${slug}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error("Error al actualizar estado", err);
      alert("Hubo un error al actualizar el estado del pedido.");
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
        {/* Filtros */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2.5 bg-orange-50 text-[#F9842C] rounded-xl">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha</p>
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="font-bold text-[#1A535C] outline-none bg-transparent"
              />
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
              const timeStr = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={order.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-colors ${isEntregado ? 'border-green-100' : 'border-gray-100'}`}>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 border-b border-gray-50 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{order.customer_name}</h3>
                        <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded ${isEntregado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-[#F9842C]'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-medium">Hora del pedido: {timeStr}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total</p>
                      <p className="text-xl font-black text-[#1A535C]">Bs. {order.total_price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Productos ({order.items?.length || 0})</p>
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700"><span className="text-gray-400 mr-2">{item.quantity}x</span> {item.product_name}</span>
                        <span className="text-gray-500 font-medium">Bs. {item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {!isEntregado ? (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'entregado')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl transition-colors"
                      >
                        <PackageCheck size={18} /> Marcar como Entregado
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'pendiente')}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold rounded-xl transition-colors"
                      >
                        Revertir a Pendiente
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
