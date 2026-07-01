import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';

export default function OrderSummary() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, businessName } = location.state || {};

  const userStr = localStorage.getItem('spingamma_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('spingamma_token');

  const [customerName, setCustomerName] = useState(user?.nombre || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    const priceNum = parseFloat((item.product.price || "0").replace(/[^\d.-]/g, ''));
    return sum + (priceNum || 0) * item.quantity;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    const orderData = {
      customer_name: customerName,
      total_price: totalPrice,
      items: itemsList.map(item => {
        const priceNum = parseFloat((item.product.price || "0").replace(/[^\d.-]/g, ''));
        return {
          product_id: item.product.id || null,
          product_name: item.product.name,
          quantity: item.quantity,
          price_at_time: priceNum || 0,
          subtotal: (priceNum || 0) * item.quantity
        };
      })
    };

    try {
      const res = await fetch(`${API_URL}/businesses/${slug}/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) throw new Error("Error al enviar pedido");
      
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Hubo un problema al enviar tu pedido. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 data-testid="order-success-msg" className="text-2xl font-bold text-[#1A535C] mb-2">¡Pedido enviado con éxito!</h2>
        <p className="text-[#757778] mb-8 max-w-sm">Tu pedido ha sido registrado. El negocio se comunicará contigo pronto.</p>
        <button 
          onClick={() => navigate(`/perfil/${slug}`)}
          className="px-8 py-3 bg-[#F9842C] text-white font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-all"
        >
          Volver al catálogo
        </button>
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
        <h1 className="text-lg font-extrabold tracking-tight">Tu Pedido</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-sm font-bold text-[#757778] uppercase tracking-wider mb-4 border-b pb-2">Para: {businessName}</h2>
          
          <div className="space-y-4">
            {itemsList.map((item, idx) => {
              const priceNum = parseFloat((item.product.price || "0").replace(/[^\d.-]/g, ''));
              return (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-sm">{item.product.name}</p>
                    <p className="text-xs text-[#757778]">{item.quantity} x Bs. {priceNum.toFixed(2)}</p>
                  </div>
                  <p className="font-black">Bs. {(item.quantity * priceNum).toFixed(2)}</p>
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
          <h3 className="font-bold text-lg mb-4">Datos del Cliente</h3>
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#757778] mb-2">Nombre completo *</label>
            <input 
              data-testid="order-customer-name-input"
              type="text" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C] transition-all"
            />
          </div>

          <button 
            data-testid="order-submit-btn"
            type="submit"
            disabled={loading || !customerName.trim()}
            className="w-full py-4 rounded-xl text-white font-bold bg-[#F9842C] hover:bg-[#e06516] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {loading ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5"></span> : <Send size={18} />}
            {loading ? 'Enviando...' : 'Enviar Pedido'}
          </button>
        </form>
      </div>
    </div>
  );
}
