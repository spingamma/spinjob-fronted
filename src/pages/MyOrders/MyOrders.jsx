import React from 'react';
import { Loader2, Building } from 'lucide-react';
import BottomNavbar from '../../components/BottomNavbar';
import BusinessOrders from '../MyBusinesses/BusinessOrders';

import useMyOrders from './hooks/useMyOrders';
import MyOrdersHeader from './components/MyOrdersHeader';
import MyOrdersFilters from './components/MyOrdersFilters';
import CustomerOrderCard from './components/CustomerOrderCard';
import PremiumLockScreen from './components/PremiumLockScreen';

export default function MyOrders() {
  const {
    orders, loading, isBusinessMode, setIsBusinessMode, premiumBusinesses,
    loadingBusinesses, selectedBusinessSlug, setSelectedBusinessSlug,
    startDate, setStartDate, endDate, setEndDate, todayStr,
    isLoggedIn, isAdmin, updatingOrderId, confirmingReceivedId,
    setConfirmingReceivedId, handleMarkReceived, navigate
  } = useMyOrders();

  return (
    <div className="min-h-screen bg-brand-bg pb-24 font-sans text-primary">
      <MyOrdersHeader 
        navigate={navigate} 
        isBusinessMode={isBusinessMode} 
        setIsBusinessMode={setIsBusinessMode} 
      />

      {isBusinessMode === null ? (
        <div className="flex flex-col items-center py-16">
          <Loader2 className="animate-spin text-secondary mb-4" size={32} />
          <p className="font-bold text-gray-500">Cargando...</p>
        </div>
      ) : !isBusinessMode ? (
        <div className="max-w-3xl mx-auto px-4 mt-6">
          <MyOrdersFilters 
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
            todayStr={todayStr}
          />
          {loading ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="animate-spin text-secondary mb-4" size={32} />
              <p className="font-bold text-gray-500">Cargando tus compras...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center mt-8">
              <div className="mb-4">
                <img src="/oso-carrito.webp" alt="Aún no tienes pedidos" className="w-24 h-24 object-contain mix-blend-multiply opacity-80" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-primary">No se encontraron pedidos</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">No hay pedidos registrados en el rango de fechas seleccionado.</p>
              <button 
                onClick={() => navigate('/')}
                data-testid="my-orders-goto-directory-btn"
                className="px-6 py-3 bg-secondary text-white font-bold rounded-xl shadow-md hover:bg-secondary/90 transition-colors"
              >
                Ir al Directorio
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <CustomerOrderCard 
                  key={order.id}
                  order={order}
                  updatingOrderId={updatingOrderId}
                  confirmingReceivedId={confirmingReceivedId}
                  setConfirmingReceivedId={setConfirmingReceivedId}
                  handleMarkReceived={handleMarkReceived}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          {loadingBusinesses ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="animate-spin text-secondary mb-4" size={32} />
              <p className="font-bold text-gray-500">Cargando datos de negocio...</p>
            </div>
          ) : premiumBusinesses.length === 0 ? (
            <PremiumLockScreen setIsBusinessMode={setIsBusinessMode} />
          ) : (
            <div>
              {premiumBusinesses.length > 1 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building size={16} className="text-secondary shrink-0" /> Seleccionar Negocio:
                  </span>
                  <select 
                    value={selectedBusinessSlug}
                    onChange={(e) => setSelectedBusinessSlug(e.target.value)}
                    data-testid="business-selector-dropdown"
                    className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-primary outline-none focus:border-secondary truncate"
                  >
                    {premiumBusinesses.map(b => (
                      <option key={b.id} value={b.slug}>{b.nombre_negocio || b.name}</option>
                    ))}
                  </select>
                </div>
              )}
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
