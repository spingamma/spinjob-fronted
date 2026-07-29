import { useState, useEffect, useCallback } from 'react';
import fetchAuth from '../../../../utils/fetchAuth';

export function useAdminNegociosTab(API_URL, onUpdatePendingCount) {
  const [negocios, setNegocios] = useState([]);
  const [searchNegocios, setSearchNegocios] = useState('');
  const [negocioStatusFilter, setNegocioStatusFilter] = useState('pendientes');
  
  const [editingPlanSlug, setEditingPlanSlug] = useState(null);
  const [editPremium, setEditPremium] = useState(false);
  const [editExpirationDate, setEditExpirationDate] = useState('');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estado para ver detalles de un negocio
  const [negocioSeleccionado, setNegocioSeleccionado] = useState(null);

  const cargarPendingCount = useCallback(async () => {
    try {
      const res = await fetchAuth(`${API_URL}/admin/businesses?status=pendientes`);
      if (res.ok) {
        const data = await res.json();
        if (onUpdatePendingCount) onUpdatePendingCount(data.length);
      }
    } catch (err) {
      console.error("Error loading pending count:", err);
    }
  }, [API_URL, onUpdatePendingCount]);

  const cargarNegocios = useCallback(async () => {
    setCargando(true);
    try {
      const queryParams = `?status=${negocioStatusFilter}${searchNegocios ? `&search=${encodeURIComponent(searchNegocios)}` : ''}`;
      const res = await fetchAuth(`${API_URL}/admin/businesses${queryParams}`);
      
      if (!res.ok) throw new Error("Error al cargar negocios.");
      
      const data = await res.json();
      setNegocios(data);
      if (negocioStatusFilter === 'pendientes' && !searchNegocios) {
        if (onUpdatePendingCount) onUpdatePendingCount(data.length);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [negocioStatusFilter, searchNegocios, API_URL, onUpdatePendingCount]);

  useEffect(() => {
    cargarNegocios();
    if (negocioStatusFilter !== 'pendientes') {
      cargarPendingCount();
    }
  }, [cargarNegocios, cargarPendingCount, negocioStatusFilter]);

  const startEditingPlan = (neg) => {
    setEditingPlanSlug(neg.slug);
    setEditPremium(neg.premium);
    const rawDate = neg.expiration_date || '';
    const dateOnly = rawDate.split(' ')[0] || '';
    setEditExpirationDate(dateOnly);
  };

  const savePlanChanges = async (slug) => {
    setIsSavingPlan(true);
    try {
      const res = await fetchAuth(`${API_URL}/admin/businesses/${slug}/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          premium: editPremium,
          expiration_date: editExpirationDate || null
        })
      });
      
      if (!res.ok) throw new Error("Error al guardar cambios de plan");
      
      const updatedBusiness = await res.json();
      setNegocios(negocios.map(n => n.slug === slug ? updatedBusiness : n));
      setEditingPlanSlug(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleAccion = async (slug, accion) => {
    let razon = "";
    if (accion === 'rechazar') {
      razon = prompt("Escribe el motivo del rechazo para que el usuario lo vea:");
      if (razon === null) return; // Canceló el prompt
    }
    
    try {
      const res = await fetchAuth(`${API_URL}/admin/businesses/${slug}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: accion === 'aprobar' ? 'aprobado' : 'rechazado',
          rejection_reason: razon
        })
      });

      if (!res.ok) throw new Error("Error al procesar la solicitud.");
      
      // Recargar la lista si fue exitoso
      await cargarNegocios();
      await cargarPendingCount();
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  return {
    negocios,
    searchNegocios,
    setSearchNegocios,
    negocioStatusFilter,
    setNegocioStatusFilter,
    editingPlanSlug,
    setEditingPlanSlug,
    editPremium,
    setEditPremium,
    editExpirationDate,
    setEditExpirationDate,
    isSavingPlan,
    cargando,
    error,
    negocioSeleccionado,
    setNegocioSeleccionado,
    startEditingPlan,
    savePlanChanges,
    handleAccion
  };
}
