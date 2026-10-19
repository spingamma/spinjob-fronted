import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCw, 
  Loader2, 
  PackageOpen, 
  Bike, 
  MapPin, 
  AlertCircle,
  Navigation,
  CheckCircle2,
  TrendingUp,
  PackageCheck,
  ChevronDown
} from 'lucide-react';
import { useDeliveryOrders } from './hooks/useDeliveryOrders';
import DeliveryOrderCard from './components/DeliveryOrderCard';
import ActiveDeliveryCard from './components/ActiveDeliveryCard';
import CompletedDeliveryCard from './components/CompletedDeliveryCard';
import DeliveryHistoryControlCard from './components/DeliveryHistoryControlCard';

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const {
    activeTab,
    setActiveTab,
    myOrdersSubTab,
    setMyOrdersSubTab,
    availableOrders,
    activeDeliveries,
    completedDeliveries,
    summary,
    loading,
    refreshing,
    error,
    toast,
    setToast,
    claimingId,
    deliveringId,
    selectedDepartment,
    changeDepartment,
    availableDepartments,
    userCountry,
    driverCoords,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    todayStr,
    isWorkMode,
    isLocating,
    toggleWorkMode,
    refreshOrders,
    claimOrder,
    deliverOrder
  } = useDeliveryOrders();


  return (
    <div className="min-h-screen bg-brand-bg pb-28 font-sans text-primary relative">
      {/* ── TOAST NOTIFICACIÓN EN TIEMPO REAL ─────────── */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-center justify-between gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : toast.type === 'warning'
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-red-600 text-white border-red-700'
          }`}>
            <p className="font-extrabold text-sm">{toast.message}</p>
            <button 
              onClick={() => setToast(null)}
              className="p-1 hover:bg-white/20 rounded-lg text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── TOPBAR PRINCIPAL ────────────────────────────── */}
      <div className="bg-primary text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              data-testid="delivery-back-btn"
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Volver al inicio"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shadow-sm">
                <Bike size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  Tablero de Despachos
                </h1>
                <p className="text-[11px] text-white/70">
                  Operaciones de reparto en tiempo real
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={refreshOrders}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            title="Actualizar pedidos"
          >
            <RotateCw size={14} className={`${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>

        {/* ── BANNER DE ZONA / DEPARTAMENTO DEL MOTORIZADO Y MODO TRABAJO ── */}
        <div className="max-w-4xl mx-auto px-4 pb-3 flex items-center justify-between text-xs text-white/90 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-bold text-secondary">
              <MapPin size={16} className="shrink-0" />
              <span className="text-white/80 text-[11px] sm:text-xs">Zona ({userCountry}):</span>
            </div>

            <div className="relative">
              <select
                id="delivery-zone-selector"
                data-testid="delivery-zone-select"
                value={selectedDepartment}
                onChange={(e) => changeDepartment(e.target.value)}
                className="appearance-none bg-white/15 hover:bg-white/20 text-white font-extrabold text-xs pl-2.5 pr-7 py-1 rounded-xl border border-white/25 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none cursor-pointer transition-all shadow-xs"
              >
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept} className="bg-primary text-white font-semibold">
                    {dept === 'Todos' ? `📍 Todos (${userCountry})` : dept}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Modo Trabajo */}
            <button
              type="button"
              onClick={toggleWorkMode}
              disabled={isLocating}
              data-testid="delivery-work-mode-toggle"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-extrabold text-[11px] transition-all cursor-pointer shadow-xs disabled:opacity-60 ${
                isLocating
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : isWorkMode
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30'
                  : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
              }`}
              title={
                isLocating
                  ? 'Obteniendo GPS...'
                  : isWorkMode
                  ? 'Pausar turno de trabajo'
                  : 'Activar turno de trabajo (requiere GPS)'
              }
            >
              {isLocating ? (
                <Loader2 size={12} className="animate-spin text-amber-300" />
              ) : (
                <span className={`w-2 h-2 rounded-full ${isWorkMode ? 'bg-emerald-400 animate-ping' : 'bg-gray-400'}`} />
              )}
              <span>
                {isLocating
                  ? 'Conectando GPS...'
                  : isWorkMode
                  ? 'Modo Trabajo: ACTIVO'
                  : 'Modo Trabajo: EN PAUSA'}
              </span>
            </button>

            {isWorkMode && driverCoords && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold hidden sm:flex">
                <Navigation size={12} className="animate-pulse" />
                <span>GPS Activo</span>
              </div>
            )}
          </div>
        </div>

        {/* ── PESTAÑAS PRINCIPALES: DISPONIBLES VS MIS ENTREGAS ── */}
        <div className="max-w-4xl mx-auto px-4 flex gap-2 border-t border-white/10 pt-2 pb-2">
          <button
            onClick={() => setActiveTab('disponibles')}
            data-testid="tab-disponibles"
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'disponibles'
                ? 'bg-white text-primary shadow-sm'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <PackageOpen size={16} />
            <span>Disponibles</span>
            {availableOrders.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'disponibles' ? 'bg-secondary text-white' : 'bg-white/20 text-white'
              }`}>
                {availableOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mis_entregas')}
            data-testid="tab-mis-entregas"
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'mis_entregas'
                ? 'bg-white text-primary shadow-sm'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Bike size={16} />
            <span>Mis Entregas</span>
            {activeDeliveries.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white animate-pulse">
                {activeDeliveries.length} activa{activeDeliveries.length > 1 ? 's' : ''}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL ────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 mt-5 space-y-4">
        {/* RESUMEN DE GANANCIAS Y MÉTRICAS DEL DÍA */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-2xs text-center">
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 block uppercase">
              En Curso
            </span>
            <p className="text-lg sm:text-2xl font-black text-blue-600">
              {activeDeliveries.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-2xs text-center">
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 block uppercase">
              Entregados Hoy
            </span>
            <p className="text-lg sm:text-2xl font-black text-emerald-600">
              {summary.completed_today_count}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-2xs text-center">
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 block uppercase">
              Ganancia Hoy
            </span>
            <p className="text-lg sm:text-2xl font-black text-secondary">
              Bs. {summary.total_earnings_today?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* ALERTA DE ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700 text-sm font-semibold">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* ── VISTA 1: PEDIDOS DISPONIBLES PARA TOMAR ── */}
        {activeTab === 'disponibles' && (
          <div className="space-y-4">
            {!isWorkMode && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-center space-y-2 shadow-xs">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-800 text-lg font-bold mb-1">
                  ⏸️
                </div>
                <h3 className="font-extrabold text-amber-900 text-sm sm:text-base">
                  Turno en Pausa (Modo Descanso)
                </h3>
                <p className="text-xs text-amber-700 max-w-sm mx-auto">
                  El GPS y las alertas de pedidos están apagados para no consumir tu batería. Activa tu turno cuando estés listo para salir a repartir.
                </p>
                <button
                  type="button"
                  onClick={toggleWorkMode}
                  disabled={isLocating}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-60"
                >
                  {isLocating && <Loader2 size={13} className="animate-spin text-white" />}
                  <span>{isLocating ? 'Conectando GPS...' : '🟢 Conectar y Activar Turno'}</span>
                </button>
              </div>
            )}

            {/* LEYENDA DEL SEMÁFORO DE DISTANCIA */}
            <div className="bg-white rounded-3xl p-4 shadow-xs border border-gray-100 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                  Restaurantes en {selectedDepartment === 'Todos' ? `${userCountry} (Todos)` : selectedDepartment}
                </span>
                <p className="text-base font-black text-primary">
                  {loading ? 'Buscando pedidos...' : `${availableOrders.length} listos para entrega`}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  🟢 0-3 km
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                  🟡 3-8 km
                </span>
                <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                  🔴 &gt;8 km (Bloqueado)
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="animate-spin text-secondary mb-3" size={36} />
                <p className="font-extrabold text-gray-400 text-sm">
                  Ordenando pedidos por cercanía en {selectedDepartment === 'Todos' ? userCountry : selectedDepartment}...
                </p>
              </div>
            ) : availableOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <PackageOpen size={36} />
                </div>
                <h3 className="font-black text-lg text-primary mb-1">
                  No hay pedidos pendientes en {selectedDepartment === 'Todos' ? userCountry : selectedDepartment}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm max-w-sm mx-auto mb-4">
                  En cuanto un comercio confirme el pago de una orden, se ordenará aquí por distancia al local al instante.
                </p>
                <button
                  onClick={refreshOrders}
                  className="px-5 py-2.5 bg-secondary text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Comprobar de nuevo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {availableOrders.map(order => (
                  <DeliveryOrderCard 
                    key={order.id} 
                    order={order}
                    driverCoords={driverCoords}
                    onClaimOrder={claimOrder}
                    isClaiming={claimingId === order.id}
                    hasActiveDelivery={activeDeliveries.length > 0}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── VISTA 2: MIS ENTREGAS (ACTIVAS & HISTORIAL) ── */}
        {activeTab === 'mis_entregas' && (
          <div className="space-y-4">
            {/* SUB-PESTAÑAS: EN CURSO VS COMPLETADAS */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
              <button
                onClick={() => setMyOrdersSubTab('activas')}
                data-testid="subtab-activas"
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  myOrdersSubTab === 'activas'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                <Bike size={14} />
                <span>En camino ({activeDeliveries.length})</span>
              </button>

              <button
                onClick={() => setMyOrdersSubTab('historial')}
                data-testid="subtab-historial"
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  myOrdersSubTab === 'historial'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                <CheckCircle2 size={14} />
                <span>Completadas ({completedDeliveries.length})</span>
              </button>
            </div>

            {/* SECCIÓN 1: ENTREGAS ACTIVAS (EN CURSO) */}
            {myOrdersSubTab === 'activas' && (
              <div className="space-y-4">
                {activeDeliveries.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                      <Bike size={32} />
                    </div>
                    <h3 className="font-black text-lg text-primary mb-1">
                      No tienes entregas en camino
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm max-w-sm mx-auto mb-4">
                      Acepta un pedido desde la pestaña de Disponibles para iniciar tu recorrido.
                    </p>
                    <button
                      onClick={() => setActiveTab('disponibles')}
                      className="px-5 py-2.5 bg-secondary text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                    >
                      Ver Pedidos Disponibles
                    </button>
                  </div>
                ) : (
                  activeDeliveries.map(order => (
                    <ActiveDeliveryCard
                      key={order.id}
                      order={order}
                      onDeliverOrder={deliverOrder}
                      isDelivering={deliveringId === order.id}
                    />
                  ))
                )}
              </div>
            )}

            {/* SECCIÓN 2: HISTORIAL DE ENTREGAS COMPLETADAS */}
            {myOrdersSubTab === 'historial' && (
              <div className="space-y-4">
                <DeliveryHistoryControlCard
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  todayStr={todayStr}
                  summary={summary}
                />

                {completedDeliveries.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                      <PackageCheck size={32} />
                    </div>
                    <h3 className="font-black text-lg text-primary mb-1">
                      No hay entregas registradas en este periodo
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm max-w-sm mx-auto">
                      Ajusta el rango de fechas arriba o completa una entrega hoy para visualizar tu historial y ganancias.
                    </p>
                  </div>
                ) : (
                  completedDeliveries.map(order => (
                    <CompletedDeliveryCard key={order.id} order={order} />
                  ))
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
