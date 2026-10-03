import { useState, useEffect, useCallback } from 'react';
import fetchAuth from '../../utils/fetchAuth';
import { API_URL } from '../../config/api';

export function useTeamManagement(slug, isOpen) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [candidateUser, setCandidateUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchStaff = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchAuth(`${API_URL}/businesses/${slug}/staff`);
      if (res.ok) {
        const data = await res.json();
        setStaffList(Array.isArray(data) ? data : []);
      } else {
        const err = await res.json();
        setError(err.detail || 'Error al cargar colaboradores');
      }
    } catch {
      setError('Error de conexión al cargar equipo');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
      setSearchQuery('');
      setCandidateUser(null);
      setError('');
    }
  }, [isOpen, fetchStaff]);

  const handleSearchUser = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setError('Ingresa un correo o celular para buscar');
      return;
    }
    setIsSearching(true);
    setError('');
    setCandidateUser(null);

    try {
      const res = await fetchAuth(`${API_URL}/businesses/${slug}/staff/search-user?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setCandidateUser(data);
      } else {
        const err = await res.json();
        setError(err.detail || 'Usuario no encontrado en Tarjetoso.');
      }
    } catch {
      setError('Error al buscar usuario');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddStaff = async () => {
    if (!candidateUser && !searchQuery.trim()) return;
    setIsAdding(true);
    setError('');

    const query = candidateUser ? (candidateUser.email || candidateUser.phone) : searchQuery.trim();

    try {
      const res = await fetchAuth(`${API_URL}/businesses/${slug}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        setSearchQuery('');
        setCandidateUser(null);
        await fetchStaff();
      } else {
        const err = await res.json();
        setError(err.detail || 'Error al agregar colaborador');
      }
    } catch {
      setError('Error de conexión al agregar colaborador');
    } finally {
      setIsAdding(false);
    }
  };

  const handleTogglePermission = async (staffId, permKey, currentValue) => {
    setUpdatingId(staffId);
    setError('');
    try {
      const res = await fetchAuth(`${API_URL}/businesses/${slug}/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [permKey]: !currentValue }),
      });
      if (res.ok) {
        const updated = await res.json();
        setStaffList(prev => prev.map(s => s.id === staffId ? updated : s));
      } else {
        const err = await res.json();
        setError(err.detail || 'Error al actualizar permiso');
      }
    } catch {
      setError('Error de conexión al actualizar permisos');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveStaff = async (staffId) => {
    if (!window.confirm('¿Estás seguro de remover a este colaborador del equipo?')) return;
    setRemovingId(staffId);
    setError('');
    try {
      const res = await fetchAuth(`${API_URL}/businesses/${slug}/staff/${staffId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStaffList(prev => prev.filter(s => s.id !== staffId));
      } else {
        const err = await res.json();
        setError(err.detail || 'Error al eliminar colaborador');
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setRemovingId(null);
    }
  };

  return {
    staffList,
    loading,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    isSearching,
    candidateUser,
    setCandidateUser,
    isAdding,
    removingId,
    updatingId,
    handleSearchUser,
    handleAddStaff,
    handleTogglePermission,
    handleRemoveStaff,
  };
}
