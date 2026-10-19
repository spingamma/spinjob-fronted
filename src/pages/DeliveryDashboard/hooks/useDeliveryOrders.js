import { useState, useEffect, useCallback, useRef } from 'react';
import fetchAuth from '../../../utils/fetchAuth';
import { API_URL } from '../../../config/api';
import { calculateStraightDistanceKm } from '../../../utils/deliveryCalculator';

export function useDeliveryOrders() {
  const [activeTab, setActiveTab] = useState('disponibles'); // 'disponibles' | 'mis_entregas'
  const [myOrdersSubTab, setMyOrdersSubTab] = useState('activas'); // 'activas' | 'historial'

  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [summary, setSummary] = useState({
    active_deliveries_count: 0,
    completed_today_count: 0,
    total_earnings_today: 0.0
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success' | 'warning' | 'error', message: string }
  const [claimingId, setClaimingId] = useState(null);
  const [deliveringId, setDeliveringId] = useState(null);
  const [driverCoords, setDriverCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // País configurado del usuario (del perfil, fallback a 'Bolivia')
  const userCountry = (() => {
    try {
      const raw = localStorage.getItem('spingamma_user');
      const u = raw ? JSON.parse(raw) : null;
      return u?.country || 'Bolivia';
    } catch {
      return 'Bolivia';
    }
  })();

  // Departamentos dinámicos cargados según el país del usuario
  const [availableDepartments, setAvailableDepartments] = useState(['Todos']);

  useEffect(() => {
    let isMounted = true;
    async function loadCountryDepartments() {
      try {
        const res = await fetch(`${API_URL}/countries/`);
        if (res.ok) {
          const countries = await res.json();
          const match = Array.isArray(countries)
            ? countries.find((c) => c.country?.toLowerCase() === userCountry.toLowerCase()) || countries[0]
            : null;

          if (match && Array.isArray(match.departments) && isMounted) {
            const deptNames = match.departments.map((d) => d.name);
            setAvailableDepartments(['Todos', ...deptNames]);
          }
        }
      } catch (err) {
        console.error('Error cargando departamentos del país:', err);
      }
    }
    loadCountryDepartments();
    return () => {
      isMounted = false;
    };
  }, [userCountry]);

  // Departamento del repartidor: configurable vía dropdown (persistido, fallback a 'Todos')
  const [selectedDepartment, setSelectedDepartment] = useState(() => {
    try {
      const stored = localStorage.getItem('tarjetoso_delivery_department');
      if (stored) return stored;
      const raw = localStorage.getItem('spingamma_user');
      const u = raw ? JSON.parse(raw) : null;
      return u?.state || 'Todos';
    } catch {
      return 'Todos';
    }
  });

  const changeDepartment = useCallback((newDept) => {
    setSelectedDepartment(newDept);
    try {
      localStorage.setItem('tarjetoso_delivery_department', newDept);
    } catch {
      // ignore
    }
  }, []);

  // Modo Trabajo / Turno del repartidor (persistido, requiere GPS para encender)
  const [isWorkMode, setIsWorkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('tarjetoso_delivery_work_mode');
      return stored === 'true'; // Solo activo si fue explícitamente encendido
    } catch {
      return false;
    }
  });

  const driverCoordsRef = useRef(null);
  const lastEmittedCoordsRef = useRef(null);
  const isInitialLoadDisponibles = useRef(true);
  const isInitialLoadMyOrders = useRef(true);

  // Referencia viva a entregas en camino para la emisión reactiva de GPS sin re-suscribir el watch
  const activeDeliveries = myOrders.filter(o => o.status === 'en_camino');
  const activeDeliveriesRef = useRef(activeDeliveries);
  useEffect(() => {
    activeDeliveriesRef.current = activeDeliveries;
  }, [activeDeliveries]);

  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Función de actualización de posición GPS
  const handlePositionUpdate = useCallback((pos) => {
    const newCoords = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };
    driverCoordsRef.current = newCoords;

    // Actualizar estado React solo si el desplazamiento es >= 100 metros (0.10 km)
    setDriverCoords((prev) => {
      if (!prev) return newCoords;
      const distKm = calculateStraightDistanceKm(prev.lat, prev.lng, newCoords.lat, newCoords.lng);
      return distKm >= 0.10 ? newCoords : prev;
    });

    // Emisión reactiva al único pedido 'en_camino' guiada puramente por desplazamiento (>= 100m)
    const currentActive = activeDeliveriesRef.current;
    if (currentActive && currentActive.length > 0) {
      const last = lastEmittedCoordsRef.current;
      const distEmittedKm = last
        ? calculateStraightDistanceKm(last.lat, last.lng, newCoords.lat, newCoords.lng)
        : 999;

      if (distEmittedKm >= 0.10) {
        lastEmittedCoordsRef.current = newCoords;
        const activeOrder = currentActive[0];
        fetchAuth(`${API_URL}/delivery/orders/${activeOrder.id}/location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lat: newCoords.lat,
            lng: newCoords.lng
          })
        }).catch((e) => console.warn('Error emitiendo ubicación GPS:', e));
      }
    }
  }, []);

  // Encender o apagar Modo Trabajo (OBLIGATORIO compartir ubicación al encender)
  const toggleWorkMode = useCallback(() => {
    if (isWorkMode) {
      // Apagar Modo Trabajo
      setIsWorkMode(false);
      setDriverCoords(null);
      driverCoordsRef.current = null;
      try {
        localStorage.setItem('tarjetoso_delivery_work_mode', 'false');
      } catch (err) {
        console.warn('Error saving work mode:', err);
      }
      setToast({
        type: 'warning',
        message: 'Modo Trabajo pausado. Turno detenido.'
      });
      return;
    }

    // Encender Modo Trabajo: Requiere obtener ubicación actual en el primer click
    if (!('geolocation' in navigator)) {
      setToast({
        type: 'error',
        message: 'Tu dispositivo o navegador no soporta geolocalización GPS.'
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        handlePositionUpdate(pos);
        setIsWorkMode(true);
        try {
          localStorage.setItem('tarjetoso_delivery_work_mode', 'true');
        } catch (storageErr) {
          console.warn('Error saving work mode:', storageErr);
        }
        setToast({
          type: 'success',
          message: '📍 Modo Trabajo activado. Ubicación GPS sincronizada.'
        });
      },
      (err) => {
        setIsLocating(false);
        setIsWorkMode(false);
        try {
          localStorage.setItem('tarjetoso_delivery_work_mode', 'false');
        } catch (storageErr) {
          console.warn('Error saving work mode:', storageErr);
        }
        let msg = 'Debes permitir el acceso a tu ubicación GPS para activar el Modo Trabajo.';
        if (err?.code === 1) {
          msg = 'Permiso de ubicación denegado. Activa el GPS y permite el acceso para iniciar turno.';
        } else if (err?.code === 2) {
          msg = 'Ubicación no disponible. Revisa que tu GPS esté activado.';
        } else if (err?.code === 3) {
          msg = 'Tiempo de espera agotado al consultar GPS. Intenta de nuevo.';
        }
        setToast({
          type: 'warning',
          message: msg
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [isWorkMode, handlePositionUpdate]);

  // Vigilar geolocalización continua del repartidor (solo si Modo Trabajo está activo)
  useEffect(() => {
    if (!isWorkMode || !('geolocation' in navigator)) {
      setDriverCoords(null);
      driverCoordsRef.current = null;
      return;
    }

    // Al montar o si ya estaba activo, sincronizar ubicación inicial
    navigator.geolocation.getCurrentPosition(
      handlePositionUpdate,
      (err) => {
        console.warn('Geolocalización no disponible al iniciar:', err.message);
        setIsWorkMode(false);
        try {
          localStorage.setItem('tarjetoso_delivery_work_mode', 'false');
        } catch (storageErr) {
          console.warn('Error saving work mode:', storageErr);
        }
        setToast({
          type: 'warning',
          message: 'Se requiere GPS activo para el Modo Trabajo. Actívalo para iniciar turno.'
        });
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );

    const watchId = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      null,
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isWorkMode, handlePositionUpdate]);

  // Consultar pedidos disponibles para tomar (silencioso tras la carga inicial)
  const fetchAvailableOrders = useCallback(async (isBackground = false) => {
    if (!isBackground && isInitialLoadDisponibles.current) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    const token = localStorage.getItem('spingamma_token');
    if (!token) {
      setError('Debes iniciar sesión con rol de delivery.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (selectedDepartment) {
        params.append('state', selectedDepartment);
      }
      const coords = driverCoordsRef.current;
      if (coords?.lat && coords?.lng) {
        params.append('lat', coords.lat);
        params.append('lng', coords.lng);
      }

      const res = await fetchAuth(`${API_URL}/delivery/orders?${params.toString()}`);

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('No tienes permisos de personal de delivery.');
        }
        throw new Error('Error al consultar los pedidos para delivery.');
      }

      const data = await res.json();
      setAvailableOrders(Array.isArray(data) ? data : []);
      isInitialLoadDisponibles.current = false;
    } catch (err) {
      console.error('Error fetching available orders:', err);
      if (err.message !== 'SESSION_EXPIRED') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDepartment]);

  // Consultar entregas asignadas al motorizado ('en_camino' y 'entregado')
  const fetchMyOrders = useCallback(async (isBackground = false) => {
    if (!isBackground && isInitialLoadMyOrders.current) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    const token = localStorage.getItem('spingamma_token');
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      const coords = driverCoordsRef.current;
      if (coords?.lat && coords?.lng) {
        params.append('lat', coords.lat);
        params.append('lng', coords.lng);
      }
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await fetchAuth(`${API_URL}/delivery/my-orders?${params.toString()}`);

      if (res.ok) {
        const data = await res.json();
        setMyOrders(Array.isArray(data) ? data : []);
        isInitialLoadMyOrders.current = false;
      }
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error('Error fetching my deliveries:', err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate]);

  // Consultar resumen de ganancias y contadores por rango de fechas
  const fetchSummary = useCallback(async () => {
    const token = localStorage.getItem('spingamma_token');
    if (!token) return;

    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await fetchAuth(`${API_URL}/delivery/my-summary?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error('Error fetching delivery summary:', err);
      }
    }
  }, [startDate, endDate]);

  // Carga inicial según la pestaña activa o cambio de fechas
  useEffect(() => {
    if (activeTab === 'disponibles') {
      fetchAvailableOrders(false);
    } else {
      fetchMyOrders(false);
    }
    fetchSummary();
  }, [activeTab, startDate, endDate, fetchAvailableOrders, fetchMyOrders, fetchSummary]);

  // Actualización reactiva por eventos y notificaciones push (sin timers de sondeo ciego de fondo)
  useEffect(() => {
    const handleNotification = () => {
      if (!isWorkMode) return; // Si está desconectado, ignora notificaciones
      if (activeTab === 'disponibles') {
        fetchAvailableOrders(true);
      } else {
        fetchMyOrders(true);
      }
      fetchSummary();
    };

    window.addEventListener('tarjetoso:notification-received', handleNotification);
    window.addEventListener('tarjetoso:payment-received', handleNotification);

    return () => {
      window.removeEventListener('tarjetoso:notification-received', handleNotification);
      window.removeEventListener('tarjetoso:payment-received', handleNotification);
    };
  }, [isWorkMode, activeTab, fetchAvailableOrders, fetchMyOrders, fetchSummary]);

  // Tomar pedido (Fase 1 + Fase 2: Redirigir a Mis Entregas)
  const claimOrder = async (orderId) => {
    if (activeDeliveries.length > 0) {
      setToast({
        type: 'warning',
        message: '⚠️ Ya tienes una entrega en curso. Debes completarla antes de tomar otro pedido.'
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    setClaimingId(orderId);

    try {
      const res = await fetchAuth(`${API_URL}/delivery/orders/${orderId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 409) {
        setToast({
          type: 'warning',
          message: '⚠️ Pedido ya tomado por otro repartidor.'
        });
        setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'No se pudo aceptar el pedido.');
      }

      const claimedOrder = await res.json();

      setToast({
        type: 'success',
        message: '✅ ¡Pedido aceptado! Redirigiendo a tu entrega en curso...'
      });

      // Remover de disponibles y agregar a mis entregas
      setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
      setMyOrders(prev => [claimedOrder, ...prev]);

      // Cambiar automáticamente a pestaña Mis Entregas Activas
      setActiveTab('mis_entregas');
      setMyOrdersSubTab('activas');

      // Actualizar métricas
      fetchSummary();
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        setToast({
          type: 'error',
          message: err.message || 'Error al aceptar el pedido.'
        });
      }
    } finally {
      setClaimingId(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  // Marcar pedido como entregado (Fase 2)
  const deliverOrder = async (orderId) => {
    setDeliveringId(orderId);

    try {
      const res = await fetchAuth(`${API_URL}/delivery/orders/${orderId}/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'No se pudo marcar como entregado.');
      }

      const updatedOrder = await res.json();

      setToast({
        type: 'success',
        message: `🎉 ¡Pedido entregado con éxito! Ganancia sumada: Bs. ${(updatedOrder.delivery_cost || 0).toFixed(2)}`
      });

      // Actualizar estado local
      setMyOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      fetchSummary();
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        setToast({
          type: 'error',
          message: err.message || 'Error al confirmar entrega.'
        });
      }
    } finally {
      setDeliveringId(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const completedDeliveries = myOrders.filter(o => o.status === 'entregado');

  return {
    activeTab,
    setActiveTab,
    myOrdersSubTab,
    setMyOrdersSubTab,
    availableOrders,
    myOrders,
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
    userDepartment: selectedDepartment,
    changeDepartment,
    setSelectedDepartment: changeDepartment,
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
    refreshOrders: () => {
      if (activeTab === 'disponibles') fetchAvailableOrders(false);
      else fetchMyOrders(false);
      fetchSummary();
    },
    claimOrder,
    deliverOrder
  };
}


