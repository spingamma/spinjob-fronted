import { useState, useEffect, useCallback } from 'react';
import fetchAuth from '../../utils/fetchAuth';
import { API_URL } from '../../config/api';

export default function useProfileTarjetero(profesional, isLoggedIn, onProtectedAction) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('spingamma_token');
    if (isLoggedIn && token && profesional && profesional.slug) {
      fetchAuth(`${API_URL}/tarjetero/${profesional.slug}/status`)
      .then(res => res.json())
      .then(data => {
        if (data && data.is_saved !== undefined) {
          setIsSaved(data.is_saved);
        }
      })
      .catch(err => {
        if (err.message !== 'SESSION_EXPIRED') {
          console.error("Error consultando estado del tarjetero", err);
        }
      });
    }
  }, [isLoggedIn, profesional]);

  const toggleSaveCard = useCallback(async () => {
    if (!profesional) return;
    if (!isLoggedIn) {
      onProtectedAction(null);
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetchAuth(`${API_URL}/tarjetero/${profesional.slug}`, {
        method: isSaved ? 'DELETE' : 'POST'
      });
      if (res.ok) {
        setIsSaved(!isSaved);
      }
    } catch (err) {
      console.error("Error guardando tarjeta:", err);
    } finally {
      setIsSaving(false);
    }
  }, [isLoggedIn, profesional, isSaved, onProtectedAction]);

  return { isSaved, isSaving, toggleSaveCard };
}
