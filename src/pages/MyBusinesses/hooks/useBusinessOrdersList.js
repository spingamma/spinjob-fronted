import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchAuth from '../../../utils/fetchAuth';
import { API_URL } from '../../../config/api';

export function useBusinessOrdersList(slug) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(true);
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [rejectingOrder, setRejectingOrder] = useState(null);

  const sortOrders = (ordersList) => {
    return [...ordersList].sort((a, b) => {
      const getScore = (status) => {
        if (status === "pendiente_de_pago" || status === "pendiente") return 0;
        if (status === "pagado") return 1;
        if (status === "entregado") return 2;
        if (status === "cancelado") return 3;
        return 4;
      };
      const scoreA = getScore(a.status);
      const scoreB = getScore(b.status);
      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }
      
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });
  };

  const fetchOrders = useCallback(async (sDate, eDate) => {
    if (!slug) return;
    setLoading(true);
    const token = localStorage.getItem('spingamma_token');
    if (!token) {
      navigate('/');
      return;
    }
    
    let url = `${API_URL}/businesses/${slug}/orders`;
    const paramsList = [];
    if (sDate) paramsList.push(`start_date=${sDate}`);
    if (eDate) paramsList.push(`end_date=${eDate}`);
    if (paramsList.length > 0) {
      url += `?${paramsList.join('&')}`;
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
        } catch {
          // ignore
        }
        alert("No tienes permiso para ver los pedidos de este negocio.");
        navigate('/mis-negocios');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setOrders(sortOrders(data));
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
  }, [slug, navigate]);

  useEffect(() => {
    fetchOrders(startDate, endDate);
  }, [slug, startDate, endDate, fetchOrders]);

  const handleStatusChange = async (orderId, newStatus, reason = null) => {
    setUpdatingOrder({ id: orderId, status: newStatus });
    
    try {
      const res = await fetchAuth(`${API_URL}/businesses/${slug}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          payment_rejection_reason: reason 
        })
      });

      if (res.ok) {
        setOrders(prev => {
          const updated = prev.map(o => o.id === orderId ? { ...o, status: newStatus, payment_rejection_reason: reason } : o);
          return sortOrders(updated);
        });
      }
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error("Error al actualizar estado", err);
        alert("Hubo un error al actualizar el estado del pedido.");
      }
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleDownloadReceipt = async (url, orderNumber) => {
    try {
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `comprobante-pedido-${orderNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `comprobante-pedido-${orderNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error("Error al descargar comprobante", err);
      window.open(url, '_blank'); // fallback si falla CORS
    }
  };

  return {
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
  };
}
