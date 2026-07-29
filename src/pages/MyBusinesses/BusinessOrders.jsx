import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, PackageOpen } from 'lucide-react';
import { useBusinessOrdersList } from './hooks/useBusinessOrdersList';
import OrdersFilterBar from './components/OrdersFilterBar';
import OrderCard from './components/OrderCard';
import PremiumLockScreen from './components/PremiumLockScreen';

export default function BusinessOrders({ slugProp, hideHeader = false }) {
  const params = useParams();
  const slug = slugProp || params.slug;
  const navigate = useNavigate();
  
  const {
    orders,
    loading,
    isPremium,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    todayStr,
    updatingOrder,
    rejectingOrder,
    setRejectingOrder,
    handleStatusChange,
    handleDownloadReceipt
  } = useBusinessOrdersList(slug);

  return (
    <div className={`min-h-screen bg-[#F8F9FA] ${hideHeader ? 'pb-8' : 'pb-24'} font-sans text-[#1A535C]`}>
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
            <OrdersFilterBar 
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              todayStr={todayStr}
            />

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
                {orders.map(order => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    updatingOrder={updatingOrder}
                    rejectingOrder={rejectingOrder}
                    setRejectingOrder={setRejectingOrder}
                    handleStatusChange={handleStatusChange}
                    handleDownloadReceipt={handleDownloadReceipt}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <PremiumLockScreen />
        )}
      </div>
    </div>
  );
}
