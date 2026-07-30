import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchAuth from '../../../utils/fetchAuth';
import { API_URL } from '../../../config/api';

export default function useMyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado del Switch Modo Negocio / Modo Cliente
  const [isBusinessMode, setIsBusinessMode] = useState(null); // null = aún no determinado
  const [myBusinesses, setMyBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [selectedBusinessSlug, setSelectedBusinessSlug] = useState('');

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [confirmingReceivedId, setConfirmingReceivedId] = useState(null);

  const isLoggedIn = localStorage.getItem('spingamma_user') !== null;
  const isAdmin = (() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        return parsed.is_admin === true || parsed.is_vendedor === true; 
      } catch { return false; }
    }
    return false;
  })();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('spingamma_token');
    if (!token) {
      navigate('/');
      return;
    }
    
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
        // Ordenar del más reciente al más antiguo
        const sortedData = [...data].sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at).getTime();
          const dateB = new Date(b.updated_at || b.created_at).getTime();
          return dateB - dateA;
        });
        setOrders(sortedData);
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
  }, [navigate, startDate, endDate]);

  const fetchUserBusinesses = useCallback(async () => {
    setLoadingBusinesses(true);
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
  }, [selectedBusinessSlug]);

  useEffect(() => {
    const detectInitialMode = async () => {
      try {
        const storedMode = localStorage.getItem('spingamma_last_mode');
        const storedSlug = localStorage.getItem('spingamma_last_business_slug');
        
        const res = await fetchAuth(`${API_URL}/usuarios/mis-negocios`);
        if (res.ok) {
          const data = await res.json();
          setMyBusinesses(data);
          const premiumList = data.filter(b => b.premium && b.status === 'aprobado');
          if (premiumList.length > 0) {
            // Restore slug or pick first
            if (storedSlug && premiumList.some(b => b.slug === storedSlug)) {
              setSelectedBusinessSlug(storedSlug);
            } else {
              setSelectedBusinessSlug(premiumList[0].slug);
            }
            // Restore mode or default true
            if (storedMode !== null) {
              setIsBusinessMode(storedMode === 'business');
            } else {
              setIsBusinessMode(true);
            }
          } else {
            setIsBusinessMode(false);
          }
        } else {
          setIsBusinessMode(false);
        }
      } catch (err) {
        if (err.message !== 'SESSION_EXPIRED') {
          console.error("Error al cargar negocios del usuario", err);
        }
        setIsBusinessMode(false);
      }
    };
    detectInitialMode();
  }, []);

  useEffect(() => {
    if (isBusinessMode === null) return;
    if (!isBusinessMode) {
      fetchOrders();
    } else {
      fetchUserBusinesses();
    }
  }, [fetchOrders, fetchUserBusinesses, isBusinessMode]);

  const handleMarkReceived = async (orderId) => {
    setUpdatingOrderId(orderId);
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

  const handleSetIsBusinessMode = useCallback((val) => {
    setIsBusinessMode(val);
    localStorage.setItem('spingamma_last_mode', val ? 'business' : 'customer');
  }, []);

  const handleSetSelectedBusinessSlug = useCallback((val) => {
    setSelectedBusinessSlug(val);
    localStorage.setItem('spingamma_last_business_slug', val);
  }, []);

  return {
    orders,
    loading,
    isBusinessMode,
    setIsBusinessMode: handleSetIsBusinessMode,
    premiumBusinesses,
    loadingBusinesses,
    selectedBusinessSlug,
    setSelectedBusinessSlug: handleSetSelectedBusinessSlug,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    todayStr,
    isLoggedIn,
    isAdmin,
    updatingOrderId,
    confirmingReceivedId,
    setConfirmingReceivedId,
    handleMarkReceived,
    navigate
  };
}
