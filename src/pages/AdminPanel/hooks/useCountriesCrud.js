import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../../config/api';

export function useCountriesCrud() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for adding / editing modals or inline forms
  const [isAddingCountry, setIsAddingCountry] = useState(false);
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryDept, setNewCountryDept] = useState('');

  const [editingCountry, setEditingCountry] = useState(null);
  const [editCountryName, setEditCountryName] = useState('');

  const [addingDeptToCountry, setAddingDeptToCountry] = useState(null);
  const [newDeptName, setNewDeptName] = useState('');

  const [editingDept, setEditingDept] = useState(null);
  const [editDeptName, setEditDeptName] = useState('');

  const [submitting, setSubmitting] = useState(false);


  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/countries/`);
      if (!res.ok) throw new Error("Error al cargar localizaciones");
      const data = await res.json();
      setCountries(data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar localizaciones. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const getHeaders = () => {
    const token = localStorage.getItem('spingamma_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleCreateCountry = async (e) => {
    e.preventDefault();
    if (!newCountryName.trim() || !newCountryDept.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/countries`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          country: newCountryName.trim(),
          state: newCountryDept.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al crear país");
      }

      setNewCountryName('');
      setNewCountryDept('');
      setIsAddingCountry(false);
      await fetchCountries();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCountry = async (oldName) => {
    if (!editCountryName.trim() || editCountryName.trim() === oldName) {
      setEditingCountry(null);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/countries/${encodeURIComponent(oldName)}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name: editCountryName.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al actualizar país");
      }

      setEditingCountry(null);
      await fetchCountries();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCountry = async (name) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el país "${name}" y todos sus departamentos? Esta acción no se puede deshacer.`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/countries/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!res.ok) throw new Error("Error al eliminar país");
      await fetchCountries();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddDepartment = async (countryName) => {
    if (!newDeptName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/countries/${encodeURIComponent(countryName)}/departments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newDeptName.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al agregar departamento");
      }

      setNewDeptName('');
      setAddingDeptToCountry(null);
      await fetchCountries();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDepartment = async (id) => {
    if (!editDeptName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/departments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name: editDeptName.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al actualizar departamento");
      }

      setEditingDept(null);
      await fetchCountries();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id, deptName) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el departamento "${deptName}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/departments/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!res.ok) throw new Error("Error al eliminar departamento");
      await fetchCountries();
    } catch (err) {
      alert(err.message);
    }
  };

  return {
    countries,
    loading,
    error,
    isAddingCountry,
    setIsAddingCountry,
    newCountryName,
    setNewCountryName,
    newCountryDept,
    setNewCountryDept,
    editingCountry,
    setEditingCountry,
    editCountryName,
    setEditCountryName,
    addingDeptToCountry,
    setAddingDeptToCountry,
    newDeptName,
    setNewDeptName,
    editingDept,
    setEditingDept,
    editDeptName,
    setEditDeptName,
    submitting,
    fetchCountries,
    handleCreateCountry,
    handleUpdateCountry,
    handleDeleteCountry,
    handleAddDepartment,
    handleUpdateDepartment,
    handleDeleteDepartment,
  };
}
