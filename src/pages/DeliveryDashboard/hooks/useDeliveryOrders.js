import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../../config/api';

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

  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Departamento fijo del usuario (del perfil o Santa Cruz por defecto)
  const userDepartment = (() => {
    try {
      const raw = localStorage.getItem('spingamma_user');
      const u = raw ? JSON.parse(raw) : null;
      return u?.state || 'Santa Cruz';
    } catch {
      return 'Santa Cruz';
    }
  })();

  // Obtener geolocalización del repartidor en tiempo real
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDriverCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.warn('Geolocalización no disponible:', err.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );

      // Vigilar posición si se desplaza en la moto
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setDriverCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        null,
        { enableHighAccuracy: true, maximumAge: 10000 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, []);

  // Consultar pedidos disponibles para tomar
  const fetchAvailableOrders = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
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
      if (userDepartment) {
        params.append('state', userDepartment);
      }
      if (driverCoords?.lat && driverCoords?.lng) {
        params.append('lat', driverCoords.lat);
        params.append('lng', driverCoords.lng);
      }

      const res = await fetch(`${API_URL}/delivery/orders?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('No tienes permisos de personal de delivery.');
        }
        throw new Error('Error al consultar los pedidos para delivery.');
      }

      const data = await res.json();
      setAvailableOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching available orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userDepartment, driverCoords]);

  // Consultar entregas asignadas al motorizado ('en_camino' y 'entregado')
  const fetchMyOrders = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    const token = localStorage.getItem('spingamma_token');
    if (!token) return;

    try {
      const params = new URLSearchParams();
      if (driverCoords?.lat && driverCoords?.lng) {
        params.append('lat', driverCoords.lat);
        params.append('lng', driverCoords.lng);
      }
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await fetch(`${API_URL}/delivery/my-orders?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setMyOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching my deliveries:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [driverCoords, startDate, endDate]);

  // Consultar resumen de ganancias y contadores por rango de fechas
  const fetchSummary = useCallback(async () => {
    const token = localStorage.getItem('spingamma_token');
    if (!token) return;

    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await fetch(`${API_URL}/delivery/my-summary?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Error fetching delivery summary:', err);
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

  // Sondeo en vivo en segundo plano
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'disponibles') {
        fetchAvailableOrders(true);
      } else {
        fetchMyOrders(true);
      }
      fetchSummary();
    }, 7000);

    return () => clearInterval(interval);
  }, [activeTab, fetchAvailableOrders, fetchMyOrders, fetchSummary]);

  // Transmisión periódica de coordenadas GPS mientras el repartidor tiene pedidos 'en_camino'
  useEffect(() => {
    const activeOnTheWay = myOrders.filter(o => o.status === 'en_camino');
    if (activeOnTheWay.length === 0 || !driverCoords) return;

    const emitLocation = async () => {
      const token = localStorage.getItem('spingamma_token');
      if (!token) return;

      for (const order of activeOnTheWay) {
        try {
          await fetch(`${API_URL}/delivery/orders/${order.id}/location`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              lat: driverCoords.lat,
              lng: driverCoords.lng
            })
          });
        } catch (e) {
          console.warn('Error emitiendo ubicación GPS:', e);
        }
      }
    };

    emitLocation();
    const locInterval = setInterval(emitLocation, 8000);
    return () => clearInterval(locInterval);
  }, [myOrders, driverCoords]);

  // Tomar pedido (Fase 1 + Fase 2: Redirigir a Mis Entregas)
  const claimOrder = async (orderId) => {
    setClaimingId(orderId);
    const token = localStorage.getItem('spingamma_token');

    try {
      const res = await fetch(`${API_URL}/delivery/orders/${orderId}/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      setToast({
        type: 'error',
        message: err.message || 'Error al aceptar el pedido.'
      });
    } finally {
      setClaimingId(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  // Marcar pedido como entregado (Fase 2)
  const deliverOrder = async (orderId) => {
    setDeliveringId(orderId);
    const token = localStorage.getItem('spingamma_token');

    try {
      const res = await fetch(`${API_URL}/delivery/orders/${orderId}/deliver`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      setToast({
        type: 'error',
        message: err.message || 'Error al confirmar entrega.'
      });
    } finally {
      setDeliveringId(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const activeDeliveries = myOrders.filter(o => o.status === 'en_camino');
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
    userDepartment,
    driverCoords,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    todayStr,
    refreshOrders: () => {
      if (activeTab === 'disponibles') fetchAvailableOrders(false);
      else fetchMyOrders(false);
      fetchSummary();
    },
    claimOrder,
    deliverOrder
  };
}


