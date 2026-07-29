import { useEffect, useCallback } from 'react';
import fetchAuth from '../../utils/fetchAuth';
import { API_URL } from '../../config/api';

export default function useProfileInteraction(profesional, isLoggedIn, isAdmin, onProtectedAction) {
  const pendingInteractionKey = `spingamma_pending_interaction_${profesional?.slug}`;

  const registrarInteraccionBackend = useCallback(async (platformName) => {
    const freshUserStr = localStorage.getItem('spingamma_user');
    if (!freshUserStr || !profesional) return;

    try {
      const freshUser = JSON.parse(freshUserStr);
      if (freshUser.is_admin) return;


      const response = await fetchAuth(`${API_URL}/businesses/${profesional.slug}/interaccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformName })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(`Error ${response.status} registrando interacción (${platformName}):`, errorData);
        throw new Error(`Fallo ${response.status}`);
      }
    } catch (error) {
      console.error("Error en registrarInteraccionBackend:", error);
    }
  }, [profesional]);

  useEffect(() => {
    const userStr = localStorage.getItem('spingamma_user');
    const pendingPlatform = localStorage.getItem(pendingInteractionKey);

    if (userStr && pendingPlatform) {
      const parsed = JSON.parse(userStr);
      if (!parsed.is_admin) {
        registrarInteraccionBackend(pendingPlatform);
      }
      localStorage.removeItem(pendingInteractionKey);
    }
  });

  const handleLinkClick = useCallback(async (e, platformName, url) => {
    e.preventDefault();

    if (isLoggedIn) {
      if (!isAdmin) {
        await registrarInteraccionBackend(platformName);
      }
      onProtectedAction(url);
    } else {
      localStorage.setItem(pendingInteractionKey, platformName);
      onProtectedAction(url);
    }
  }, [onProtectedAction, registrarInteraccionBackend, pendingInteractionKey, isLoggedIn, isAdmin]);

  return { handleLinkClick };
}
